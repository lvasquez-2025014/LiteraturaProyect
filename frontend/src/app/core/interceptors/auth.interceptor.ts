import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');
  const isAuthRenew = req.url.includes('/auth/renew');

  // Registrar actividad activa del usuario en cada petición auténtica a la API
  if (token && isApiRequest && !isAuthRenew) {
    authService.recordUserActivity();
  }

  let finalReq = req;
  if (token && isApiRequest) {
    finalReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(finalReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el backend responde 401 en peticiones autenticadas
      const isAuthEndpoint =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/google') ||
        req.url.includes('/auth/renew');

      if (error.status === 401 && !isAuthEndpoint) {
        console.warn('[authInterceptor] 401 Unauthorized detectado en API.');
        const isInactive = authService.isUserInactive();
        authService.handleAutoLogout(isInactive ? 'inactive' : 'expired');
      }
      return throwError(() => error);
    })
  );
};
