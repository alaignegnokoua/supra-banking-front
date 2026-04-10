import { Injectable } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.hasToken()) {
      return true;
    }
    this.router.navigate(['/auth/login']);
    return false;
  }
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.hasToken()) {
    return true;
  }
  router.navigate(['/auth/login']);
  return false;
};

export const roleGuard = (requiredRole: string): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasToken()) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (authService.isInRole(requiredRole)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
};
