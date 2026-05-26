import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ScheduledWorkshopDto {
  scheduledWorkshopId?: string;
  organizationId: string;
  teacherId?: string;
  adminId?: string;
  workshopName?: string;
  workShopDescription?: string;
  scheduledDate: string;
  scheduleTime: string;
  timeDuration: number;
  roomId?: string;
  privacy?: string;
  success?: boolean;
  thumbnail?: string;
  maxParticipants: number;
  meetingUrl?: string;
  createdAt?: string;
  deletedAt?: string;
  isDeleted?: boolean;
  grade?: string;
  gradeStreamId?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WorkshopService {
  private baseUrl = `${environment.apiUrl}/MeetingsUrl`;

  constructor(private http: HttpClient) {}

  createWorkshop(workshop: ScheduledWorkshopDto, grade: string = ''): Observable<any> {
    const url = grade ? `${this.baseUrl}/createMeeting/${encodeURIComponent(grade)}` : `${this.baseUrl}/createMeeting`;
    return this.http.post(url, workshop);
  }

  createWorkshopWithFile(formData: FormData, grade: string = ''): Observable<any> {
    return this.http.post(`${this.baseUrl}/createAdminMeeting`, formData);
  }

  createAdminWorkshop(workshop: ScheduledWorkshopDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/createAdminMeeting`, workshop, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  createAdminWorkshopWithFile(formData: FormData): Observable<any> {
    // For FormData, don't set Content-Type - browser will set multipart/form-data with boundary
    return this.http.post(`${this.baseUrl}/createAdminMeeting`, formData);
  }

  getRolesByUser(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/getRolesByUser/${email}`);
  }

  getAllWorkshops(organizationId: string, userId: string): Observable<ScheduledWorkshopDto[]> {
    return this.http.get<ScheduledWorkshopDto[]>(`${this.baseUrl}/allMeetings/${organizationId}/${userId}`);
  }
}
