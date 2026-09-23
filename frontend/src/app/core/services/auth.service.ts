import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, shareReplay, catchError, of } from 'rxjs';
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
  private ngZone = inject(NgZone);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'lectura_viva_token';
  private readonly USER_KEY = 'lectura_viva_user';
  private readonly LAST_ACTIVITY_KEY = 'lectura_viva_last_activity';
  private readonly LAST_RENEW_KEY = 'lectura_viva_last_renew';

  // Configuración de inactividad (1 hora) y renovación
  readonly INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hora exacta de inactividad
  private readonly MIN_RENEW_INTERVAL_MS = 15 * 60 * 1000; // Mínimo 15 minutos entre renovaciones activas
  private readonly ACTIVITY_THROTTLE_MS = 3000; // 3 segundos para limitar el registro de eventos

  private sessionTimer: any = null;
  private inactivityIntervalTimer: any = null;
  private lastEventRecordTime = 0;
  private isRenewing = false;
  private activityListenersRegistered = false;

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
      } else if (this.isUserInactive()) {
        console.warn('[AuthService] Tiempo de inactividad de 1 hora superado al inicializar. Cerrando sesión.');
        this.handleAutoLogout('inactive');
      } else {
        this.initSessionTracking(token);
        this.fetchProfile().subscribe({ error: () => {} });
      }
    }
  }

  /**
   * Inicializa el monitoreo de inactividad (1 hora), temporizadores y escucha de eventos de usuario
   */
  private initSessionTracking(token: string): void {
    this.scheduleAutoLogout(token);
    this.startInactivityMonitor();
    this.registerActivityListeners();
  }

  /**
   * Obtiene la marca de tiempo de la última actividad del usuario
   */
  getLastActivityTime(): number {
    try {
      const stored = localStorage.getItem(this.LAST_ACTIVITY_KEY);
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return Date.now();
  }

  /**
   * Comprueba si el usuario ha estado inactivo durante 1 hora o más
   */
  isUserInactive(): boolean {
    const token = this.tokenSignal();
    if (!token) return false;
    const lastActive = this.getLastActivityTime();
    return Date.now() - lastActive >= this.INACTIVITY_TIMEOUT_MS;
  }

  /**
   * Registra actividad interactiva del usuario (movimiento, teclado, clics, peticiones HTTP)
   * Si el usuario está activo y ha transcurrido tiempo, renueva automáticamente el token para que nunca se venza.
   */
  recordUserActivity(): void {
    const token = this.tokenSignal();
    if (!token) return;

    const now = Date.now();

    // Si ya superó la hora de inactividad, forzar cierre de sesión inmediato
    if (this.isUserInactive()) {
      this.ngZone.run(() => {
        this.handleAutoLogout('inactive');
      });
      return;
    }

    // Actualizar última actividad
    try {
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());
    } catch {}

    // Restauración / Renovación automática del token por actividad continua:
    // Si han pasado más de 15 minutos desde la última renovación o faltan menos de 60 minutos para que expire
    const lastRenew = this.getLastRenewTime();
    const remainingTime = this.getRemainingSessionTimeMs();

    const shouldRenew =
      !this.isRenewing &&
      (now - lastRenew >= this.MIN_RENEW_INTERVAL_MS || remainingTime <= 60 * 60 * 1000);

    if (shouldRenew && this.isAuthenticated()) {
      this.renewSession();
    }
  }

  /**
   * Obtiene la marca de tiempo de la última renovación del token
   */
  private getLastRenewTime(): number {
    try {
      const stored = localStorage.getItem(this.LAST_RENEW_KEY);
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch {}
    return 0;
  }

  /**
   * Restaura y renueva el token JWT automáticamente en el backend
   */
  renewSession(): void {
    if (this.isRenewing || !this.tokenSignal()) return;
    this.isRenewing = true;

    this.http.post<AuthResponse>(`${this.API_URL}/renew`, {}).pipe(
      catchError((err) => {
        console.warn('[AuthService] No se pudo renovar automáticamente el token:', err?.message);
        if (err?.status === 401) {
          this.ngZone.run(() => this.handleAutoLogout('expired'));
        }
        return of(null);
      })
    ).subscribe((res) => {
      this.isRenewing = false;
      if (res && res.token) {
        const now = Date.now();
        try {
          localStorage.setItem(this.LAST_RENEW_KEY, now.toString());
        } catch {}
        this.saveSession(res);
        console.log('[AuthService] Token de sesión renovado y restaurado exitosamente por actividad activa en la plataforma.');
      }
    });
  }

  /**
   * Monitorea periódicamente si se ha alcanzado 1 hora de inactividad
   */
  private startInactivityMonitor(): void {
    this.stopInactivityMonitor();

    // Verificación cada 25 segundos fuera de la zona de Angular
    this.ngZone.runOutsideAngular(() => {
      this.inactivityIntervalTimer = setInterval(() => {
        if (!this.tokenSignal()) {
          this.stopInactivityMonitor();
          return;
        }

        if (this.isUserInactive()) {
          console.warn('[AuthService] 1 hora de inactividad detectada por el monitor. Cerrando sesión automáticamente.');
          this.ngZone.run(() => {
            this.handleAutoLogout('inactive');
          });
        }
      }, 25000);
    });
  }

  private stopInactivityMonitor(): void {
    if (this.inactivityIntervalTimer) {
      clearInterval(this.inactivityIntervalTimer);
      this.inactivityIntervalTimer = null;
    }
  }

  /**
   * Registra eventos globales del usuario para detectar interacción
   */
  private registerActivityListeners(): void {
    if (typeof window === 'undefined' || this.activityListenersRegistered) return;
    this.activityListenersRegistered = true;

    this.ngZone.runOutsideAngular(() => {
      const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];
      const handleEvent = () => {
        const now = Date.now();
        if (now - this.lastEventRecordTime < this.ACTIVITY_THROTTLE_MS) return;
        this.lastEventRecordTime = now;
        this.recordUserActivity();
      };

      events.forEach((evt) => {
        window.addEventListener(evt, handleEvent, { passive: true });
      });

      // Monitorear foco de pestaña y reactivación del sistema (ej. laptop suspendida)
      const onFocusOrVisible = () => {
        if (this.tokenSignal()) {
          if (this.isUserInactive()) {
            this.ngZone.run(() => this.handleAutoLogout('inactive'));
          } else if (this.isTokenExpired()) {
            this.ngZone.run(() => this.handleAutoLogout('expired'));
          } else {
            this.recordUserActivity();
          }
        }
      };

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          onFocusOrVisible();
        }
      });

      window.addEventListener('focus', onFocusOrVisible);
    });
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
   * Programa el temporizador para expirar sesión si no se ha renovado
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
      console.warn('[AuthService] El token de sesión ya expiró.');
      this.handleAutoLogout('expired');
      return;
    }

    this.sessionTimer = setTimeout(() => {
      // Si el usuario sigue activo y el token estaba por vencer, intentamos renovarlo antes de expulsar
      if (!this.isUserInactive()) {
        console.log('[AuthService] Tiempo límite de token alcanzado con usuario activo. Restaurando sesión...');
        this.renewSession();
      } else {
        console.warn('[AuthService] Tiempo máximo alcanzado con inactividad. Cerrando sesión.');
        this.handleAutoLogout('inactive');
      }
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
    const now = Date.now();
    try {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
      localStorage.setItem(this.LAST_ACTIVITY_KEY, now.toString());
      localStorage.setItem(this.LAST_RENEW_KEY, now.toString());
    } catch (e) {
      console.warn('[AuthService] No se pudo guardar la sesión en el almacenamiento local:', e);
    }
    this.tokenSignal.set(res.token);
    this.currentUserSignal.set(res.user);
    this.initSessionTracking(res.token);
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

  updateAcademicProfile(
    userId: string,
    grade: string,
    section: string,
    institutionalEmail?: string,
    carnet?: string,
  ): Observable<User> {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/${userId}/academic-profile`, {
        grade,
        section,
        institutionalEmail,
        carnet,
      })
      .pipe(
        tap((updatedUser) => {
          const currentUser = this.currentUserSignal();
          if (currentUser) {
            const merged: User = {
              ...currentUser,
              ...updatedUser,
              grade: updatedUser.grade || grade,
              section: updatedUser.section || section,
              institutionalEmail: updatedUser.institutionalEmail || institutionalEmail || currentUser.institutionalEmail,
              carnet: updatedUser.carnet || carnet || currentUser.carnet,
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
    this.stopInactivityMonitor();
    this.clearSessionData();
    this.router.navigate(['/login']);
  }

  /**
   * Cierra la sesión automáticamente y redirige al login con notificación del motivo
   */
  handleAutoLogout(reason: 'inactive' | 'expired' | 'unauthorized' = 'expired'): void {
    this.clearSessionTimer();
    this.stopInactivityMonitor();
    this.clearSessionData();
    this.router.navigate(['/login'], {
      queryParams: { reason },
    });
  }

  private clearSessionData(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      localStorage.removeItem(this.LAST_ACTIVITY_KEY);
      localStorage.removeItem(this.LAST_RENEW_KEY);
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
    if (token) {
      if (this.isUserInactive()) {
        this.handleAutoLogout('inactive');
        return null;
      }
      if (this.isTokenExpired(token)) {
        this.handleAutoLogout('expired');
        return null;
      }
    }
    return token;
  }
}
