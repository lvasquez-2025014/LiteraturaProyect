import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isUserInactive()) {
    auth.handleAutoLogout('inactive');
    return false;
  }

  if (auth.isTokenExpired()) {
    auth.handleAutoLogout('expired');
    return false;
  }

  const expectedRoles = route.data['roles'] as UserRole[];
  const user = auth.currentUserSignal();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  // Administrador tiene super-acceso a todos los portales
  if (user.role === 'ADMIN_ROLE' || (expectedRoles && expectedRoles.includes(user.role))) {
    return true;
  }

  // Redirect to their respective authorized home page
  auth.redirectByRole();
  return false;
};
