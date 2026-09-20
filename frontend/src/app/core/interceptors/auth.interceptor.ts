import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isApiRequest = req.url.startsWith(environment.apiUrl) || req.url.includes('/api/');

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
      // Si el backend responde 401 en peticiones autenticadas (token expirado tras 2h o inválido)
      const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/google');
      if (error.status === 401 && !isAuthEndpoint) {
        console.warn('[authInterceptor] 401 Unauthorized detectado en API. Cerrando sesión por expiración...');
        authService.handleAutoLogout('expired');
      }
      return throwError(() => error);
    })
  );
};
