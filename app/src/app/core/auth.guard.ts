import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  // Keep the intended URL (e.g. an invite link) so we can come back after login.
  return inject(Router).createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

export const guestGuard: CanActivateFn = () => {
  return inject(AuthService).isLoggedIn() ? inject(Router).createUrlTree(['/groups']) : true;
};
