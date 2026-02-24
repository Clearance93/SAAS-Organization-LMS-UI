import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginAuthUser } from '../../features/organization/models/auth/login-auth-user';
import { BehaviorSubject, Observable, switchMap, tap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginRequest } from '../../features/organization/models/auth/login-request';
import { LoginResponse } from '../../features/organization/models/auth/login-response';
import { RegisterRequest } from '../../features/organization/models/auth/register-request';
import { ForgotPasswordRequest } from '../../interfaces/forgot-password/forgot-password-request';
import { ResetPasswordRequest } from '../../interfaces/forgot-password/reset-password-request';
import { ConfirmEmailRequest } from '../../interfaces/auth/confirm-email-request';
import { EmailConfirmationResponse } from '../../interfaces/auth/email-confirmation-response';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 

  private apiUrl = 'https://localhost:7270/api/Auth';
  private adminApiUrl = 'https://localhost:7270/api/Admin';

  private currentUserSubject: BehaviorSubject<LoginAuthUser | null>;
  private userProfileSubject: BehaviorSubject<any | null>;
  public userProfile: Observable<any | null> | undefined;

  public currentUser: Observable<LoginAuthUser | null> | undefined;
  
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const storedUser = this.isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<LoginAuthUser | null> (
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
    const storedProfile = this.isBrowser ? localStorage.getItem('userProfile') : null;
    this.userProfileSubject = new BehaviorSubject<any | null>(storedProfile ? JSON.parse(storedProfile) : null);
    this.userProfile = this.userProfileSubject.asObservable();
   }

  register(registerRequest: RegisterRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<any>(`${this.apiUrl}/register`, registerRequest, { headers });
  }

   public get currentUserValue(): LoginAuthUser | null {
    return this.currentUserSubject.value;
   }

   login(credentials: LoginRequest): Observable<LoginResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials, { headers })
      .pipe(
        tap(response => {
          const user: LoginAuthUser = {
            email: credentials.email,
            token: response.token,
            expiration: new Date(response.expiration)
          };
          if (this.isBrowser) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            localStorage.setItem('adminEmail', credentials.email);
          }

          // Decode token to extract common claims (role, user id, organization id)
          const claims = this.decodeToken(response.token);
          if (claims && this.isBrowser) {
            // Try multiple possible claim keys for role, userid and organization
            const possibleRoleKeys = ['role', 'roles', 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];
            const possibleUserIdKeys = ['sub', 'nameid', 'userId', 'user_id', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
            const possibleOrgKeys = ['organizationSetupId', 'organizationId', 'orgId', 'organization_setup_id'];
            const possibleRoleUserKeys = ['roleUserId','roleUserID','extension_roleUserId','extension_teacherId','extension_studentId','extension_staffId','extension_roleId','roleId'];

            let roleVal: any = null;
            for (const k of possibleRoleKeys) {
              if (claims[k]) { roleVal = claims[k]; break; }
            }

            let userIdVal: any = null;
            for (const k of possibleUserIdKeys) {
              if (claims[k]) { userIdVal = claims[k]; break; }
            }

            let orgVal: any = null;
            for (const k of possibleOrgKeys) {
              if (claims[k]) { orgVal = claims[k]; break; }
            }

            // Normalize role (if array take first)
            if (Array.isArray(roleVal)) {
              roleVal = roleVal[0];
            }

            if (roleVal) {
              localStorage.setItem('userRole', String(roleVal).toLowerCase());
            }
            if (userIdVal) {
              localStorage.setItem('userId', String(userIdVal));
            }
            if (orgVal) {
              localStorage.setItem('organizationId', String(orgVal));
            }
            // try to find a role-specific id (teacherId, studentId, etc.)
            let roleUserIdVal: any = null;
            let roleUserKey: string | null = null;
            for (const k of possibleRoleUserKeys) {
              if (claims[k]) { roleUserIdVal = claims[k]; roleUserKey = k; break; }
            }
            if (roleUserIdVal) {
              localStorage.setItem('roleUserId', String(roleUserIdVal));
              localStorage.setItem('roleUserIdKey', String(roleUserKey));
            }

            // publish a normalized user profile for other services to use
            const profile = {
              email: user.email,
              role: roleVal ? String(roleVal).toLowerCase() : null,
              organizationId: orgVal ? String(orgVal) : null,
              userId: userIdVal ? String(userIdVal) : null,
              roleUserId: roleUserIdVal ? String(roleUserIdVal) : null,
              roleUserKey: roleUserKey || null
            };
            this.userProfileSubject.next(profile);
            if (this.isBrowser) {
              localStorage.setItem('userProfile', JSON.stringify(profile));
            }
          }

          this.currentUserSubject.next(user);
        }),
        switchMap(response => {
          return this.http.get<any>(`${this.adminApiUrl}/getAdminByEmail/${credentials.email}`)
            .pipe(
              tap(adminProfile => {
                // adminProfile may be null if the user is not an admin; guard accordingly
                if (this.isBrowser && adminProfile && adminProfile.organizationSetupId) {
                  localStorage.setItem('organizationId', adminProfile.organizationSetupId);
                }
                if (this.isBrowser && adminProfile) {
                  try {
                    localStorage.setItem('adminProfile', JSON.stringify(adminProfile));
                  } catch (err) {
                    console.warn('Failed to store adminProfile in localStorage', err);
                  }
                }
              }),
              switchMap(() => {
                return new Observable<LoginResponse>(observer => {
                  observer.next(response);
                  observer.complete()
                });
              })
            );
        })
      );
   }

   logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('organizationId');
    }
    if (this.userProfileSubject) {
      this.userProfileSubject.next(null);
    }
    if (this.isBrowser) {
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userRole');
      localStorage.removeItem('roleUserId');
      localStorage.removeItem('roleUserIdKey');
      localStorage.removeItem('userId');
    }
    this.currentUserSubject.next(null)
   }

   isAuthenticated(): boolean {
    const user = this.currentUserValue;
    if (!user) {
      return false;
    }

    const now = new Date();
    const expiration = new Date(user.expiration);
    return now < expiration;
   }

   getToken(): string | null {
    const user = this.currentUserValue;
    return user?.token || null;
   }

  private decodeToken(token: string | undefined): any | null {
    if (!token || !this.isBrowser) return null;
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      // Fix padding for base64
      const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const pad = b64.length % 4;
      const padded = b64 + (pad ? '='.repeat(4 - pad) : '');
      const decoded = atob(padded);
      return JSON.parse(decoded);
    } catch (err) {
      console.warn('Failed to decode token:', err);
      return null;
    }
  }

  // Return the current normalized user profile (may be null)
  public getUserProfile(): any | null {
    return this.userProfileSubject ? this.userProfileSubject.value : null;
  }

   forgetPassword(request: ForgotPasswordRequest): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<string>(`${this.apiUrl}/forgot-password`, request, { headers, responseType: 'text' as 'json' });
  }

  resetPassword(request: ResetPasswordRequest): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    const apiPayload = {
      Email: request.email,
      Token: request.token,
      Password: request.password
    };

    return this.http.post<string>(`${this.apiUrl}/reset-password`, 
      apiPayload,
      { headers, responseType: 'text' as 'json' }
    );
  }

  confirmEmail(userId: string, token: string): Observable<EmailConfirmationResponse> {

    const encodedToken = encodeURIComponent(token);
    const url = `${this.apiUrl}/confirm-email/${userId}-token/${encodedToken}`;

    return this.http.put<EmailConfirmationResponse>(url, {});
  }

  changePassword(payload: { currentPassword: string; newPassword: string; email: string }): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.apiUrl}/changepassword`, payload, { 
      headers,
      responseType: 'text' as 'json'
    });
  }
}
