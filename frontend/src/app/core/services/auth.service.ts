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

  // Claves de almacenamiento seguras configuradas en las variables de entorno de la aplicación
  private readonly TOKEN_KEY = environment.storageKeys?.token || '__sec_lv_a9f12b7c6e';
  private readonly USER_KEY = environment.storageKeys?.user || '__sec_lv_d48f001c9d';
  private readonly LAST_ACTIVITY_KEY = environment.storageKeys?.lastActivity || '__sec_lv_8fceea145f';
  private readonly LAST_RENEW_KEY = environment.storageKeys?.lastRenew || '__sec_lv_b2532a014e';

  // Claves anteriores para migración y saneamiento transparente en el navegador
  private readonly LEGACY_KEYS = {
    token: 'lectura_viva_token',
    user: 'lectura_viva_user',
    lastActivity: 'lectura_viva_last_activity',
    lastRenew: 'lectura_viva_last_renew',
  };

  // Semilla de derivación y ofuscación criptográfica (proveniente del entorno)
  private readonly STORAGE_SALT = environment.storageKeys?.salt || 'LvSec!2026#k9$XmQ7vL8zP3wR1';

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
    const user = this.currentUserSignal();
    return (!!token && !this.isTokenExpired(token)) || !!user;
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
        this.fetchProfile().subscribe({ error: () => { } });
      }
    } else {
      // Intentar restaurar sesión activa desde la cookie HttpOnly segura
      this.restoreSessionFromCookie();
    }
    this.cleanLegacyStorage();
  }

  /**
   * Restaura la sesión del usuario si existe una cookie HttpOnly válida en el navegador
   */
  private restoreSessionFromCookie(): void {
    if (typeof window === 'undefined') return;
    this.fetchProfile().subscribe({
      next: (user) => {
        if (user) {
          this.currentUserSignal.set(user);
        }
      },
      error: () => {},
    });
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
      const stored = this.secureGetItem(this.LAST_ACTIVITY_KEY, this.LEGACY_KEYS.lastActivity);
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch { }
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
      this.secureSetItem(this.LAST_ACTIVITY_KEY, now.toString());
    } catch { }

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
      const stored = this.secureGetItem(this.LAST_RENEW_KEY, this.LEGACY_KEYS.lastRenew);
      if (stored) {
        const val = Number(stored);
        if (!isNaN(val) && val > 0) return val;
      }
    } catch { }
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
          this.secureSetItem(this.LAST_RENEW_KEY, now.toString());
        } catch { }
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

  /**
   * Genera un flujo de claves pseudoaleatorio a partir de la semilla y el salt
   */
  private deriveKeyStream(key: string, salt: string, length: number): Uint8Array {
    const combined = `${this.STORAGE_SALT}:${key}:${salt}`;
    const stream = new Uint8Array(length);
    let h1 = 0x811c9dc5;
    let h2 = 0x9e3779b9;

    for (let i = 0; i < combined.length; i++) {
      h1 = Math.imul(h1 ^ combined.charCodeAt(i), 0x01000193);
      h2 = Math.imul(h2 ^ combined.charCodeAt(i), 0x5bd1e995);
    }

    for (let i = 0; i < length; i++) {
      h1 = Math.imul(h1 ^ (h2 >>> 3), 0x01000193) ^ (i & 0xff);
      h2 = Math.imul(h2 ^ (h1 >>> 5), 0x5bd1e995) ^ ((i >>> 8) & 0xff);
      stream[i] = (h1 ^ (h2 >>> 16)) & 0xff;
    }
    return stream;
  }

  /**
   * Calcula un checksum de integridad para detectar alteraciones o manipulación de datos
   */
  private computeChecksum(data: Uint8Array): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < data.length; i++) {
      hash ^= data[i];
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
  }

  private bytesToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    const chunkSize = 8192;
    for (let i = 0; i < len; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }

  private base64ToBytes(b64: string): Uint8Array {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Cifra y ofusca una cadena de texto para su almacenamiento seguro
   */
  private encryptValue(storageKey: string, plainText: string): string {
    try {
      const encoder = new TextEncoder();
      const plainBytes = encoder.encode(plainText);
      const checksum = this.computeChecksum(plainBytes);

      const saltBytes = new Uint8Array(8);
      if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        window.crypto.getRandomValues(saltBytes);
      } else {
        for (let i = 0; i < 8; i++) saltBytes[i] = Math.floor(Math.random() * 256);
      }
      const salt = Array.from(saltBytes).map((b) => b.toString(16).padStart(2, '0')).join('');

      const keyStream = this.deriveKeyStream(storageKey, salt, plainBytes.length);
      const cipherBytes = new Uint8Array(plainBytes.length);
      for (let i = 0; i < plainBytes.length; i++) {
        cipherBytes[i] = plainBytes[i] ^ keyStream[i];
      }

      const base64Cipher = this.bytesToBase64(cipherBytes);
      return `__sec_v1__:${salt}:${checksum}:${base64Cipher}`;
    } catch (e) {
      console.warn('[AuthService] Falló el cifrado seguro de almacenamiento:', e);
      return plainText;
    }
  }

  /**
   * Descifra y valida la integridad de una cadena almacenada
   */
  private decryptValue(storageKey: string, storedValue: string): string | null {
    if (!storedValue) return null;

    if (!storedValue.startsWith('__sec_v1__:')) {
      return storedValue;
    }

    try {
      const parts = storedValue.split(':');
      if (parts.length !== 4) return null;

      const [, salt, expectedChecksum, base64Cipher] = parts;
      const cipherBytes = this.base64ToBytes(base64Cipher);
      const keyStream = this.deriveKeyStream(storageKey, salt, cipherBytes.length);

      const plainBytes = new Uint8Array(cipherBytes.length);
      for (let i = 0; i < cipherBytes.length; i++) {
        plainBytes[i] = cipherBytes[i] ^ keyStream[i];
      }

      const actualChecksum = this.computeChecksum(plainBytes);
      if (actualChecksum !== expectedChecksum) {
        console.warn('[AuthService] Verificación de integridad fallida en almacenamiento seguro.');
        return null;
      }

      const decoder = new TextDecoder();
      return decoder.decode(plainBytes);
    } catch (e) {
      console.warn('[AuthService] Error al descifrar valor de almacenamiento seguro:', e);
      return null;
    }
  }

  private secureSetItem(key: string, value: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const encrypted = this.encryptValue(key, value);
      localStorage.setItem(key, encrypted);
    } catch (e) {
      console.warn('[AuthService] Error guardando en almacenamiento seguro:', e);
    }
  }

  private secureGetItem(key: string, legacyKey?: string): string | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;

      const stored = localStorage.getItem(key);
      if (stored) {
        const decrypted = this.decryptValue(key, stored);
        if (decrypted !== null) return decrypted;
      }

      if (legacyKey) {
        const legacyVal = localStorage.getItem(legacyKey);
        if (legacyVal) {
          this.secureSetItem(key, legacyVal);
          localStorage.removeItem(legacyKey);
          return legacyVal;
        }
      }
      return null;
    } catch (e) {
      console.warn('[AuthService] Error leyendo de almacenamiento seguro:', e);
      return null;
    }
  }

  private secureRemoveItem(key: string, legacyKey?: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(key);
      if (legacyKey) {
        localStorage.removeItem(legacyKey);
      }
    } catch { }
  }

  private cleanLegacyStorage(): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      localStorage.removeItem(this.LEGACY_KEYS.token);
      localStorage.removeItem(this.LEGACY_KEYS.user);
      localStorage.removeItem(this.LEGACY_KEYS.lastActivity);
      localStorage.removeItem(this.LEGACY_KEYS.lastRenew);
    } catch { }
  }

  private getStoredToken(): string | null {
    try {
      const token = this.secureGetItem(this.TOKEN_KEY, this.LEGACY_KEYS.token);
      if (!token) return null;
      if (this.isTokenExpired(token)) {
        this.secureRemoveItem(this.TOKEN_KEY, this.LEGACY_KEYS.token);
        this.secureRemoveItem(this.USER_KEY, this.LEGACY_KEYS.user);
        return null;
      }
      return token;
    } catch {
      return null;
    }
  }

  private getStoredUser(): User | null {
    try {
      const raw = this.secureGetItem(this.USER_KEY, this.LEGACY_KEYS.user);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  saveSession(res: AuthResponse): void {
    const now = Date.now();
    try {
      this.secureSetItem(this.TOKEN_KEY, res.token);
      this.secureSetItem(this.USER_KEY, JSON.stringify(res.user));
      this.secureSetItem(this.LAST_ACTIVITY_KEY, now.toString());
      this.secureSetItem(this.LAST_RENEW_KEY, now.toString());
      this.cleanLegacyStorage();
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
        } else {
          this.currentUserSignal.set(merged);
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
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {},
      error: () => {},
    });
    this.router.navigate(['/login']);
  }

  /**
   * Cierra la sesión automáticamente y redirige al login con notificación del motivo
   */
  handleAutoLogout(reason: 'inactive' | 'expired' | 'unauthorized' = 'expired'): void {
    this.clearSessionTimer();
    this.stopInactivityMonitor();
    this.clearSessionData();
    this.http.post(`${this.API_URL}/logout`, {}).subscribe({
      next: () => {},
      error: () => {},
    });
    this.router.navigate(['/login'], {
      queryParams: { reason },
    });
  }

  private clearSessionData(): void {
    try {
      this.secureRemoveItem(this.TOKEN_KEY, this.LEGACY_KEYS.token);
      this.secureRemoveItem(this.USER_KEY, this.LEGACY_KEYS.user);
      this.secureRemoveItem(this.LAST_ACTIVITY_KEY, this.LEGACY_KEYS.lastActivity);
      this.secureRemoveItem(this.LAST_RENEW_KEY, this.LEGACY_KEYS.lastRenew);
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
