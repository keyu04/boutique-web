import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Requires a signed-in user. Optional route data: { roles: ['Admin'] }. */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    if (auth.unreachable()) {
      return router.createUrlTree(['/unavailable'], { queryParams: { returnUrl: state.url } });
    }
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
  const roles = route.data['roles'] as string[] | undefined;
  if (roles && !roles.some(r => auth.hasRole(r))) {
    return router.createUrlTree(['/']);
  }
  return true;
};
