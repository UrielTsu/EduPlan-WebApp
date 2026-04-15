import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


function resolveAllowedRoles(route: ActivatedRouteSnapshot): string[] {
  return (route.data['roles'] as string[] | undefined) ?? [];
}


export const authRoleGuard: CanActivateChildFn = (childRoute) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.clearSession();
    return router.createUrlTree(['/login']);
  }

  const allowedRoles = resolveAllowedRoles(childRoute);
  if (allowedRoles.length === 0) {
    return true;
  }

  const currentRole = authService.getStoredRole();
  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  if (!currentRole) {
    authService.clearSession();
    return router.createUrlTree(['/login']);
  }

  return router.createUrlTree([authService.redirectPathForRole(currentRole)]);
};
