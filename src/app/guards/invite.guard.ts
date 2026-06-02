import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/authServices/auth.service';

export const inviteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow through if a linkId is present in the URL — this is an invite link
  const linkId = route.queryParamMap.get('linkId');
  if (linkId) return true;

  // Otherwise fall back to normal auth check
  if (authService.isAuthenticated()) return true;

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
