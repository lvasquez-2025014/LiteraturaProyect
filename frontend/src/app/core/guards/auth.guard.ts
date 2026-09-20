import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated() && !auth.isTokenExpired()) {
    return true;
  }

  if (auth.tokenSignal() && auth.isTokenExpired()) {
    auth.handleAutoLogout('expired');
    return false;
  }

  router.navigate(['/login']);
  return false;
};
