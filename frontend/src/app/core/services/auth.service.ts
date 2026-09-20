import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, shareReplay } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface DecodedJwtPayload {
  id?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  isSuperAdmin?: boolean;
  avatarUrl?: string;
  grade?: string;
  section?: string;
  exp?: number;
  iat?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'lectura_viva_token';
  private readonly USER_KEY = 'lectura_viva_user';

  private sessionTimer: any = null;

  // Reactive state with Signals
  currentUserSignal = signal<User | null>(this.getStoredUser());
  tokenSignal = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return !!token && !this.isTokenExpired(token);
  });

  isStudent = computed(() => this.currentUserSignal()?.role === 'STUDENT_ROLE');
  isTeacher = computed(() => this.currentUserSignal()?.role === 'TEACHER_ROLE');
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN_ROLE');

  constructor() {
    const token = this.tokenSignal();
    if (token) {
      if (this.isTokenExpired(token)) {
        this.clearSessionData();
      } else {
        this.scheduleAutoLogout(token);
        this.fetchProfile().subscribe({ error: () => {} });
      }
    }

    // Monitorear foco de pestaña y reactivación del sistema (ej. laptop suspendida)
    if (typeof window !== 'undefined') {
      const checkSessionIntegrity = () => {
        const currentToken = this.tokenSignal();
        if (currentToken && this.isTokenExpired(currentToken)) {
          this.handleAutoLogout('expired');
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkSessionIntegrity();
        }
      });

      window.addEventListener('focus', checkSessionIntegrity);
    }
  }

  /**
   * Decodifica de forma segura la carga útil de un JWT en base64url
   */
  static decodeJwt(token: string): DecodedJwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }

  decodeToken(token: string): DecodedJwtPayload | null {
    return AuthService.decodeJwt(token);
  }

  /**
   * Obtiene la fecha y hora exacta de expiración del token
   */
  getTokenExpirationDate(token?: string | null): Date | null {
    const targetToken = token ?? this.tokenSignal();
    if (!targetToken) return null;
    const decoded = AuthService.decodeJwt(targetToken);
    if (!decoded || !decoded.exp) return null;
    return new Date(decoded.exp * 1000);
  }

  /**
   * Verifica si el token ha expirado (con un margen de 5 segundos)
   */
  isTokenExpired(token?: string | null): boolean {
    const targetToken = token ?? this.tokenSignal();
    if (!targetToken) return true;
    const expDate = this.getTokenExpirationDate(targetToken);
    if (!expDate) return true;
    return Date.now() >= expDate.getTime() - 5000;
  }

  /**
   * Devuelve los milisegundos restantes de la sesión actual
   */
  getRemainingSessionTimeMs(): number {
    const expDate = this.getTokenExpirationDate();
    if (!expDate) return 0;
    return Math.max(0, expDate.getTime() - Date.now());
  }

  /**
   * Programa el cierre automático de sesión al completarse el tiempo de vida (2 horas)
   */
  private scheduleAutoLogout(token: string): void {
    this.clearSessionTimer();

    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) {
      this.handleAutoLogout('expired');
      return;
    }

    const remainingMs = expirationDate.getTime() - Date.now();
    if (remainingMs <= 0) {
      console.warn('[AuthService] El token de sesión ya expiró. Forzando cierre.');
      this.handleAutoLogout('expired');
      return;
    }

    const minutesRemaining = Math.round(remainingMs / 1000 / 60);
    console.log(`[AuthService] Temporizador de expiración (2 horas) activo. Cierre programado en ${minutesRemaining} minutos.`);

    this.sessionTimer = setTimeout(() => {
      console.warn('[AuthService] Duración máxima de 2 horas alcanzada. Cerrando sesión automáticamente.');
      this.handleAutoLogout('expired');
    }, remainingMs);
  }

  private clearSessionTimer(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  private getStoredToken(): string | null {
    try {
      const token = localStorage.getItem(this.TOKEN_KEY);
      if (!token) return null;
      if (this.isTokenExpired(token)) {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveSession(res: AuthResponse): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    } catch (e) {
      console.warn('[AuthService] No se pudo guardar la sesión en el navegador:', e);
    }
    this.tokenSignal.set(res.token);
    this.currentUserSignal.set(res.user);
    this.scheduleAutoLogout(res.token);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  loginWithGoogle(credential: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/google`, { credential }).pipe(
      tap((res) => this.saveSession(res)),
    );
  }

  updateAcademicProfile(userId: string, grade: string, section: string): Observable<User> {
    return this.http.patch<User>(`${environment.apiUrl}/users/${userId}/academic-profile`, { grade, section }).pipe(
      tap((updatedUser) => {
        const currentUser = this.currentUserSignal();
        if (currentUser) {
          const merged: User = {
            ...currentUser,
            ...updatedUser,
            grade: updatedUser.grade || grade,
            section: updatedUser.section || section,
          };
          this.saveSession({
            token: this.tokenSignal() || '',
            user: merged,
          });
        }
      }),
    );
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/profile`).pipe(
      tap((freshUser) => {
        const currentUser = this.currentUserSignal();
        const merged: User = {
          ...currentUser,
          ...freshUser,
          id: freshUser.id || (freshUser as any)._id || currentUser?.id || '',
        };
        const token = this.tokenSignal();
        if (token) {
          this.saveSession({ token, user: merged });
        }
      }),
    );
  }

  private publicConfig$?: Observable<{ googleClientId: string }>;

  getPublicConfig(): Observable<{ googleClientId: string }> {
    if (!this.publicConfig$) {
      this.publicConfig$ = this.http.get<{ googleClientId: string }>(`${this.API_URL}/config`).pipe(
        shareReplay(1),
      );
    }
    return this.publicConfig$;
  }

  logout(): void {
    this.clearSessionTimer();
    this.clearSessionData();
    this.router.navigate(['/login']);
  }

  /**
   * Cierra la sesión automáticamente y redirige al login con aviso de expiración
   */
  handleAutoLogout(reason: 'expired' | 'unauthorized' = 'expired'): void {
    this.clearSessionTimer();
    this.clearSessionData();
    this.router.navigate(['/login'], {
      queryParams: { reason },
    });
  }

  private clearSessionData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (e) {
      console.warn('[AuthService] Error al limpiar almacenamiento local:', e);
    }
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  redirectByRole(role?: UserRole): void {
    const targetRole = role || this.currentUserSignal()?.role;
    switch (targetRole) {
      case 'STUDENT_ROLE':
        this.router.navigate(['/estudiante']);
        break;
      case 'TEACHER_ROLE':
        this.router.navigate(['/profesor']);
        break;
      case 'ADMIN_ROLE':
        this.router.navigate(['/admin']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    const token = this.tokenSignal();
    if (token && this.isTokenExpired(token)) {
      this.handleAutoLogout('expired');
      return null;
    }
    return token;
  }
}
