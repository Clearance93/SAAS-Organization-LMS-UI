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

  public currentUser: Observable<LoginAuthUser | null> | undefined;
  
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    const storedUser = this.isBrowser ? localStorage.getItem('currentUser') : null;
    this.currentUserSubject = new BehaviorSubject<LoginAuthUser | null> (
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
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
          this.currentUserSubject.next(user);
        }),
        switchMap(response => {
          return this.http.get<any>(`${this.adminApiUrl}/getAdminByEmail/${credentials.email}`)
            .pipe(
              tap(adminProfile => {
                if (this.isBrowser && adminProfile.organizationSetupId) {
                  localStorage.setItem('organizationId', adminProfile.organizationSetupId);
                }
                if (this.isBrowser) {
                  localStorage.setItem('adminProfile', JSON.stringify(adminProfile))
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
}
