import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, shareReplay } from 'rxjs';
import { User, AuthResponse, UserRole } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'lectura_viva_token';
  private readonly USER_KEY = 'lectura_viva_user';

  // Reactive state with Signals
  currentUserSignal = signal<User | null>(this.getStoredUser());
  tokenSignal = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => !!this.tokenSignal());
  isStudent = computed(() => this.currentUserSignal()?.role === 'STUDENT_ROLE');
  isTeacher = computed(() => this.currentUserSignal()?.role === 'TEACHER_ROLE');
  isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN_ROLE');

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
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
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this.tokenSignal.set(res.token);
    this.currentUserSignal.set(res.user);
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
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
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
    return this.tokenSignal();
  }
}
