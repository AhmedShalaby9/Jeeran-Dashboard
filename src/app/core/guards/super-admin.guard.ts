// GUARD — blocks non-super_admin users from accessing super-admin-only routes

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superAdminGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (auth.getCurrentUser()?.user_type === 'super_admin') return true;

  router.navigate(['/dashboard/users']);
  return false;
};
