import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, NgZone, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { User, KINAL_GRADE_GROUPS, KINAL_SECTIONS } from '../../../../core/models/user.model';
import { CrowdCanvasComponent } from '../../../../shared/components/crowd-canvas/crowd-canvas.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CrowdCanvasComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  public auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  @ViewChild('googleButtonContainer') googleButtonContainer!: ElementRef<HTMLDivElement>;

  loginForm = this.fb.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  loading = false;
  errorMessage = '';
  sessionExpiredMessage = '';
  showPassword = false;
  googleReady = false;

  // Academic Onboarding State for Google Registration
  showAcademicOnboardingModal = false;
  onboardingLoading = false;
  pendingGoogleUser: User | null = null;
  selectedGrade = '';
  selectedSection = '';
  onboardingError = '';

  readonly gradeGroups = KINAL_GRADE_GROUPS;
  readonly sections = KINAL_SECTIONS;

  private clientId = '';
  private configSub?: Subscription;
  private retryTimer: any = null;
  private isDestroyed = false;

  ngOnInit() {
    const reason = this.route.snapshot.queryParams['reason'];
    if (reason === 'expired') {
      this.sessionExpiredMessage = 'Tu sesión ha expirado tras 2 horas por seguridad. Por favor, ingresa tus credenciales nuevamente.';
    }

    const isReset = this.route.snapshot.queryParams['reset'] !== undefined || this.route.snapshot.queryParams['logout'] !== undefined;
    if (isReset) {
      this.auth.logout();
    } else if (this.auth.isAuthenticated() && !this.auth.isTokenExpired()) {
      this.auth.redirectByRole();
    }
  }

  ngAfterViewInit() {
    this.configSub = this.auth.getPublicConfig().subscribe({
      next: (config) => {
        if (config.googleClientId) {
          this.clientId = config.googleClientId;
          this.setupGoogleAuth();
        }
      },
      error: (err) => {
        console.warn('No se pudo obtener la configuración pública de autenticación:', err);
      },
    });
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.configSub) {
      this.configSub.unsubscribe();
    }
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.clientId && this.googleReady) {
      if (this.retryTimer) clearTimeout(this.retryTimer);
      this.retryTimer = setTimeout(() => {
        this.renderGoogleButtonWithRetry(0);
      }, 300);
    }
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  private async setupGoogleAuth() {
    await this.ensureGoogleScript();
    if (this.isDestroyed) return;
    this.renderGoogleButtonWithRetry();
  }

  private ensureGoogleScript(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).google?.accounts?.id) {
        resolve();
        return;
      }

      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          if ((window as any).google?.accounts?.id || attempts > 50) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      } else {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      }
    });
  }

  private renderGoogleButtonWithRetry(attempt = 0) {
    if (this.isDestroyed || !this.clientId) return;

    const container = this.googleButtonContainer?.nativeElement;
    const google = (window as any).google;

    if (!google?.accounts?.id || !container) {
      if (attempt < 30) {
        this.retryTimer = setTimeout(() => this.renderGoogleButtonWithRetry(attempt + 1), 150);
      }
      return;
    }

    try {
      // Clear previous container contents to avoid duplicate or orphan iframes
      container.innerHTML = '';

      // Initialize Google Identity Services with component callback
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: (response: any) => this.handleGoogleResponse(response),
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Responsive width: bounds between 240px and 360px
      const containerWidth = container.clientWidth || 320;
      const targetWidth = Math.min(Math.max(containerWidth, 240), 360);

      google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'continue_with',
        logo_alignment: 'left',
        width: targetWidth,
      });

      // Check if iframe was successfully inserted
      setTimeout(() => {
        if (this.isDestroyed) return;
        const hasChildren = container.children && container.children.length > 0;
        if (hasChildren) {
          this.googleReady = true;
          this.cdr.detectChanges();
        } else if (attempt < 8) {
          this.renderGoogleButtonWithRetry(attempt + 1);
        }
      }, 120);

      // Attempt One Tap prompt (non-intrusive)
      try {
        google.accounts.id.prompt();
      } catch {
        // One Tap is optional
      }
    } catch (e) {
      console.warn('Reintentando renderizado de Google button:', e);
      if (attempt < 5) {
        this.retryTimer = setTimeout(() => this.renderGoogleButtonWithRetry(attempt + 1), 250);
      }
    }
  }

  private handleGoogleResponse(response: any) {
    this.ngZone.run(() => {
      if (!response || !response.credential) {
        this.errorMessage = 'No se recibió la credencial de Google';
        this.cdr.detectChanges();
        return;
      }

      this.loading = true;
      this.errorMessage = '';
      this.sessionExpiredMessage = '';

      this.auth.loginWithGoogle(response.credential).subscribe({
        next: (res) => {
          this.loading = false;
          if (res.user.role === 'STUDENT_ROLE' && (!res.user.grade || !res.user.section)) {
            this.pendingGoogleUser = res.user;
            this.selectedGrade = res.user.grade || '';
            this.selectedSection = res.user.section || '';
            this.showAcademicOnboardingModal = true;
            this.cdr.detectChanges();
            return;
          }
          this.auth.redirectByRole(res.user.role);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.message || 'Error al autenticar con tu cuenta de Google';
          this.cdr.detectChanges();
        },
      });
    });
  }

  submitAcademicOnboarding() {
    if (!this.selectedGrade) {
      this.onboardingError = 'Por favor, selecciona tu grado educativo.';
      return;
    }
    if (!this.selectedSection) {
      this.onboardingError = 'Por favor, selecciona tu sección correspondiente (A a la J).';
      return;
    }
    if (!this.pendingGoogleUser) return;

    this.onboardingLoading = true;
    this.onboardingError = '';

    this.auth.updateAcademicProfile(this.pendingGoogleUser.id, this.selectedGrade, this.selectedSection).subscribe({
      next: (updatedUser) => {
        this.onboardingLoading = false;
        this.showAcademicOnboardingModal = false;
        this.auth.redirectByRole(updatedUser.role);
      },
      error: (err) => {
        this.onboardingLoading = false;
        this.onboardingError = err.error?.message || 'Error al guardar tu grado y sección. Intenta nuevamente.';
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.sessionExpiredMessage = '';

    const { email, password } = this.loginForm.value;
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.loading = false;
        this.auth.redirectByRole(res.user.role);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Credenciales inválidas. Verifica tu correo y contraseña.';
        this.cdr.detectChanges();
      },
    });
  }
}
