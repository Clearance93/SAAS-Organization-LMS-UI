import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateLeadershipProgramDto, LeadershipProgramDto, EnrollParticipantDto } from '../../interfaces/leadership/leadership';

@Injectable({
  providedIn: 'root'
})
export class LeadershipService {
  private baseUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api';

  constructor(private http: HttpClient) { }

  createProgram(programData: CreateLeadershipProgramDto): Observable<LeadershipProgramDto> {
    return this.http.post<LeadershipProgramDto>(`${this.baseUrl}/LeadershipProgram/createProgram`, programData);
  }

  getPrograms(organizationId: string, adminId: string): Observable<LeadershipProgramDto[]> {
    return this.http.get<LeadershipProgramDto[]>(`${this.baseUrl}/LeadershipProgram/allPrograms/${organizationId}/${adminId}`);
  }

  enrollParticipant(enrollmentData: EnrollParticipantDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/Leadership/enrollParticipant`, enrollmentData);
  }

  getStaffMembers(organizationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Staff/organization/${organizationId}`);
  }

  getEnrolledParticipants(programId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Leadership/enrolledParticipants/${programId}`);
  }
}
