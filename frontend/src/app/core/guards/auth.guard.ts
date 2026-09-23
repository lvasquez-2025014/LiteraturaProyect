import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.tokenSignal()) {
    if (auth.isUserInactive()) {
      auth.handleAutoLogout('inactive');
      return false;
    }

    if (auth.isTokenExpired()) {
      auth.handleAutoLogout('expired');
      return false;
    }
  }

  if (auth.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
