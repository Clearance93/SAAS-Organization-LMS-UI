import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError, map } from 'rxjs';
import { Organization } from '../features/organization/models/organization.model';
import { CreateOrganizationDto, IOrganization } from '../features/organization/models/organization.interface';
import { IOrganizationRequest } from '../features/organization/models/Organization/iorganization-request';
import { OrganizationType, ServiceType, ServiceDuration } from '../features/organization/models/organization.enums';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {

  //private apiUrl = 'http://thutonetapi-prod.westeurope.azurecontainer.io/api';
  private apiUrl = 'https://localhost:7270/api';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  createOrganization(organization: CreateOrganizationDto): Observable<Organization> {
    const url = `${this.apiUrl}/Organization/Add-New-Organization`;
    const apiPayload = {
      OrganizationName: organization.organizationName,
      TypeOfOrganization: this.stringifyOrganizationType(organization.organizationType),
      OrganizationAddress: organization.organizationAddress,
      OrganizationContactNumber: organization.organizationContactNumber,
      website: organization.website ?? null, 
      AdminEmail: organization.adminEmail,
      ServiceDuration: String(this.stringifyServiceDuration(organization.serviceDuration)),
      TypeOfService: this.stringifyServiceTypes(organization.serviceType)
    } as any;

    console.debug('[OrganizationService] POST', url, apiPayload);

    return this.http.post<IOrganization>(url, apiPayload, this.httpOptions).pipe(
      map(response => new Organization(response)),
      catchError(this.handleError)
    )
  }

  private stringifyOrganizationType(orgType?: OrganizationType): string {
    if (!orgType) return OrganizationType.CORPORATE;
    return String(orgType);
  }

  private stringifyServiceDuration(duration?: ServiceDuration): string | number {
    if (duration === undefined || duration === null) return String(ServiceDuration.ONE_MONTH);
    return duration;
  }

  private stringifyServiceTypes(types?: ServiceType[]): string[] {
    if (!types || !Array.isArray(types)) return [];
    return types.map(t => String(t));
  }

  createOrganizationFromRequest(req: IOrganizationRequest): Observable<Organization> {
    const dto = this.mapRequestToDto(req);
    return this.createOrganization(dto);
  }

  private mapRequestToDto(req: IOrganizationRequest): CreateOrganizationDto {
    const orgTypeMap: Record<string, OrganizationType> = {
      'corporate': OrganizationType.CORPORATE,
      'company': OrganizationType.CORPORATE,
      'church': OrganizationType.CHURCH,
      'school': OrganizationType.SCHOOL,
      'ngo': OrganizationType.NGO,
      'nonprofit': OrganizationType.NGO
    };

    const durationMap: Record<string, ServiceDuration> = {
      '1': ServiceDuration.ONE_MONTH,
      'one': ServiceDuration.ONE_MONTH,
      'one_month': ServiceDuration.ONE_MONTH,
      '3': ServiceDuration.THREE_MONTHS,
      'three': ServiceDuration.THREE_MONTHS,
      'six': ServiceDuration.SIX_MONTHS,
      '6': ServiceDuration.SIX_MONTHS,
      '12': ServiceDuration.ONE_YEAR,
      'one_year': ServiceDuration.ONE_YEAR,
      '24': ServiceDuration.TWO_YEARS,
      '36': ServiceDuration.THREE_YEARS,
      '48': ServiceDuration.FOUR_YEARS,
      '60': ServiceDuration.FIVE_YEARS
    };

    const serviceTypeMap: Record<string, ServiceType> = {
      'employee training': ServiceType.EMPLOYEE_TRAINING,
      'compliance certification': ServiceType.COMPLIANCE_CERTIFICATION,
      'faith based learning': ServiceType.FAITH_BASED_LEARNING,
      'classroom management': ServiceType.CLASSROOM_MANAGEMENT,
      'student progress': ServiceType.STUDENT_PROGRESS_TRACKING,
      'learning material': ServiceType.LEARNING_MATERIAL_REPOSITORY,
      'member engagement': ServiceType.MEMBER_ENGAGEMENT,
      'custom course': ServiceType.CUSTOM_COURSE_CREATION,
      'live workshops': ServiceType.LIVE_WORKSHOPS,
      'full platform access': ServiceType.FULL_PLATFORM_ACCESS
    };

    const mapOrgType = (val?: string): OrganizationType => {
      if (!val) return OrganizationType.CORPORATE;
      const key = val.trim().toLowerCase().replace(/\s+/g, ' ');
      return orgTypeMap[key] ?? OrganizationType.CORPORATE;
    };

    const mapDuration = (val?: string): ServiceDuration => {
      if (!val) return ServiceDuration.ONE_MONTH;
      const key = val.trim().toLowerCase().replace(/\s+/g, '_');
      return durationMap[key] ?? durationMap[val.trim()] ?? ServiceDuration.ONE_MONTH;
    };

    const mapServiceTypes = (arr?: string[]): ServiceType[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.map(s => {
        const key = s.trim().toLowerCase();
        return serviceTypeMap[key] ?? ServiceType.FULL_PLATFORM_ACCESS;
      });
    };

    const dto: CreateOrganizationDto = {
      organizationName: req.organizationName,
      organizationType: mapOrgType(req.typeOfOrganization),
      organizationAddress: req.organizationAddress,
      organizationContactNumber: req.organizationContactNumber,
      website: req.website,
      serviceDuration: mapDuration(req.serviceDuration),
      serviceType: mapServiceTypes(req.typeOfService),
      adminEmail: req.adminEmail
    };

    return dto;
  }

  private handleError(error: HttpErrorResponse) {
    console.error('[OrganizationService] HTTP Error Response:', error);

    let errorMessage = 'An unknown error occured!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Bad Request: Please check your input data';
          break;
        case 404:
          errorMessage = `Not Found: ${error.url || 'unknown endpoint'}`;
          break;
        case 500:
          errorMessage = "Internal server error: Please try again later";
          break;
        default:
          errorMessage = `Server Error: ${error.message}`;
      }
    }

    console.error('[OrganizationService] Service Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
