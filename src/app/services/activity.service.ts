import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../interfaces/schools/admin-dashboard/activity';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  private baseUrl = 'https://localhost:7270/api/OrganizationActivities';

  constructor(private http: HttpClient) {}

  getAllActivities(organizationId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/allActivities/${organizationId}`);
  }

  createActivity(activity: CreateActivityDto): Observable<Activity> {
    return this.http.post<Activity>(`${this.baseUrl}/newActivity`, activity);
  }

  updateActivity(activityId: string, activity: UpdateActivityDto): Observable<Activity> {
    return this.http.put<Activity>(`${this.baseUrl}/updateActivity/${activityId}`, activity);
  }
}