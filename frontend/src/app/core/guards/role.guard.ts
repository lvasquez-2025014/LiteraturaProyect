import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['roles'] as UserRole[];
  const user = auth.currentUserSignal();

  if (!user) {
    router.navigate(['/login']);
    return false;
  }

  if (expectedRoles && expectedRoles.includes(user.role)) {
    return true;
  }

  // Redirect to their respective authorized home page
  auth.redirectByRole();
  return false;
};
