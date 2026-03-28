import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './authServices/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleNavigationService {
  
  constructor(private router: Router, private authService: AuthService) {}

  getUserRole(): string {
    // Prefer the normalized profile from AuthService
    try {
      const profile = this.authService.getUserProfile();
      if (profile && profile.role) {
        return profile.role;
      }
    } catch { /* ignore */ }
    return localStorage.getItem('userRole') || 'admin';
  }

  navigateToDashboard(): void {
    const profile = this.authService.getUserProfile();

    const role = profile?.role || localStorage.getItem('userRole') || 'admin';
    const orgId = profile?.organizationId || localStorage.getItem('organizationId');
    const roleUserId = profile?.roleUserId || localStorage.getItem('roleUserId');

    // ensure localStorage has these keys for backward compatibility
    if (orgId) localStorage.setItem('organizationId', orgId);
    if (roleUserId) localStorage.setItem('roleUserId', roleUserId);

    switch (role) {
      case 'admin':
        this.router.navigate(['/school-admin-dashboard']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher-dashboard']);
        break;
      case 'student':
        this.router.navigate(['/student-dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  getSettingsRoute(): string {
    const role = this.getUserRole();
    
    switch (role) {
      case 'admin':
        return '/admin-settings';
      case 'teacher':
        return '/teacher-settings';
      case 'student':
        return '/student-settings';
      default:
        return '/login';
    }
  }
}
