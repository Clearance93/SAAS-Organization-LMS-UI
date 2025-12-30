import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SchoolDashbaordModel } from '../../features/organization/models/school-dashboards/school-dashbaord-model';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AdminProfileModel } from '../../features/organization/models/school-dashboards/admin-profile-model';
import { UpdateAdminDto } from '../../interfaces/schools/admin/update-admin-dto';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private apiUrl = 'https://localhost:7270/api/'

  private organizationIdSubject = new BehaviorSubject<string>('')
  public organizationId$ = this.organizationIdSubject.asObservable();

  private dashboardStatsSubjects = new BehaviorSubject<SchoolDashbaordModel | null>(null);
  public dashboardStats$ = this.dashboardStatsSubjects.asObservable();

  private currentAdminSubject = new BehaviorSubject<AdminProfileModel | null>(null)
  public currentAdmin$ = this.currentAdminSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadOrganizationId();
  }

  private loadOrganizationId(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storeOrgId = localStorage.getItem('organizationId');

      if (storeOrgId) {
        this.organizationIdSubject.next(storeOrgId);
      }
    }
  }

  setOrganizationId(organizationId: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('organizationId', organizationId);
    }
    this.organizationIdSubject.next(organizationId);
  }

  getOrganizationId(): string {
    return this.organizationIdSubject.value;
  }

  getDashboardStats(organizationId: string): Observable<SchoolDashbaordModel> {
    if(organizationId) {
      this.setOrganizationId(organizationId)
    }
    
    return this.http.get<any>(`${this.apiUrl}SchoolDashboards/adminDashboard/${organizationId}`)
      .pipe(
        map(response => {
          console.log('Dashboard API response.', response)

          return new SchoolDashbaordModel({
          organizationSetupId: response.organizationSetupId,
          organizationName: response.organizationName,
          totalAdmins: response.totalAdmins,
          totalTeachers: response.totalTeachers,
          totalStudents: response.totalStudents,
          totalGuests: response.totalGuests,
          totalStaff: response.totalStaff,
          typeOfService: response.typeOfService,
          adminId: response.adminId,
          firstName: response.firstName,
          lastName: response.lastName,
          adminBusinessEmail: response.adminBusinessEmail,
          adminProfilePicture: response.adminProfilePicture,
          isSuperAdmin: response.isSuperAdmin
          })
        }),
        tap(stats => {
          this.dashboardStatsSubjects.next(stats);
          this.setOrganizationId(stats.organizationSetupId);
        }),
        catchError(error => this.handleError(error))
      )
  }

  getCurrentDahsboardStats(): SchoolDashbaordModel | null {
    return this.dashboardStatsSubjects.value;
  }

  private handleError(error: any): Observable<never> {
    console.error('Full error object:', error);
    console.error('Error status:', error.status);
    console.error('Error body:', error.error);

    let errorMessage = 'An error occurred';

    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = this.extractErrorMessage(error.error);
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private extractErrorMessage(errorText: string): string {
    if (errorText.includes('System.Exception:')) {
      const match = errorText.match(/System\.Exception:\s*(.+?)\s*at/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    if (errorText.includes('InvalidOperationException:')) {
      const match = errorText.match(/InvalidOperationException:\s*(.+?)\s*at/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return errorText;
  }

  getAdminByEmail(email: string): Observable<AdminProfileModel> {
    return this.http.get<any>(`${this.apiUrl}Admin/getAdminByEmail/${email}`)
      .pipe(
        map(response => new AdminProfileModel({
          organizationSetupId: response.organizationSetupId,
          firstName: response.firstName,
          lastName: response.lastName,
          adminBusinessEmail: response.adminBusinessEmail,
          adminProfilePicture: response.adminProfilePicture,
          isActive: response.isActive,
          isSuperAdmin: response.isSuperAdmin,
          AdminId: response.adminId,
          organizationName: response.organizationName,
          typeOfService: response.typeOfService
        })),
        tap(admin => {
          this.currentAdminSubject.next(admin);
          this.setOrganizationId(admin.organizationSetupId)
        }),
        catchError(error => this.handleError(error))
      )
  }

  getCurrentAdmin(): AdminProfileModel | null {
    return this.currentAdminSubject.value;
  }

  clearCurrentAdmin(): void {
    this.currentAdminSubject.next(null);
  }

  updateAdmin(adminId: string, dto: UpdateAdminDto): Observable<any> {
    return this.http.put(`${this.apiUrl}Admin/updateAdmin/${adminId}`, dto)
      .pipe(
        tap(response => {
          console.log('Admin updated successfully:', response);

          const currentAdmin = this.currentAdminSubject.value;

          if (currentAdmin && currentAdmin.AdminId === adminId) {
            const updatedAdmin = {
              ...currentAdmin,
              firstName: dto.firstName || currentAdmin.firstName,
              lastName: dto.lastName || currentAdmin.lastName,
              adminProfilePicture: dto.adminProfilePicture || currentAdmin.adminProfilePicture
            };
            this.currentAdminSubject.next(updatedAdmin);

            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('adminProfile', JSON.stringify(updatedAdmin));
            }
          }
        }),
        catchError(error => this.handleError(error))
      )
  }

  getAdminById(adminId: string): Observable<AdminProfileModel> {
    return this.http.get<any>(`${this.apiUrl}Admin/getAdminById/${adminId}`)
      .pipe(
        map(response => new AdminProfileModel({
          organizationSetupId: response.organizationSetupId,
          firstName: response.firstName,
          lastName: response.lastName,
          adminBusinessEmail: response.adminBusinessEmail,
          adminProfilePicture: response.adminProfilePicture,
          isActive: response.isActive,
          isSuperAdmin: response.isSuperAdmin,
          AdminId: response.adminId,
          organizationName: response.organizationName,
          typeOfService: response.typeOfService
        })),
        catchError(error => this.handleError(error))
      );
  }

  generateRegistrationLink(organizationId: string, role: string, maxUsers: number): Observable<string> {
    // Map frontend role values to backend expected values
    const roleMapping: { [key: string]: string } = {
      'student': 'Student',
      'teacher': 'Teacher', 
      'admin': 'Admin',
      'learner': 'Learner',
      'guest': 'Guest',
      'staff': 'StaffMember'
    };

    const mappedRole = roleMapping[role] || role;
    
    const payload = {
      organizationId,
      role: mappedRole,
      maxUsers
    };

    console.log('Sending payload to API:', payload);

    return this.http.post(`${this.apiUrl}SchoolDashboards/generatingLinks`, payload, { responseType: 'text' })
      .pipe(
        tap(response => {
          console.log('API Response:', response);
        }),
        catchError(error => this.handleError(error))
      );
  }

  // Subject to notify when a registration link is used
  private linkUsedSubject = new BehaviorSubject<{linkId: string, count: number} | null>(null);
  public linkUsed$ = this.linkUsedSubject.asObservable();

  notifyLinkUsed(linkId: string, count: number): void {
    this.linkUsedSubject.next({linkId, count});
  }
}