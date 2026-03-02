import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TeachingClass, CreateTeachingClassRequest } from '../interfaces/teaching-class.interface';
import { TeacherStream } from '../interfaces/teacher-stream.interface';

@Injectable({
  providedIn: 'root'
})
export class TeachingClassService {
  private apiUrl = 'https://localhost:7270/api/TeachersSchedule';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  createTeachingClass(teachingClass: CreateTeachingClassRequest): Observable<TeachingClass> {
    return this.http.post<TeachingClass>(`${this.apiUrl}/teachingClass`, teachingClass, this.httpOptions);
  }

  getTeachingClasses(organizationId: string, teacherId: string): Observable<TeachingClass[]> {
    return this.http.get<TeachingClass[]>(`${this.apiUrl}/getAllteachingClasses/${organizationId}/${teacherId}`, this.httpOptions);
  }

  getTeacherStreams(teacherId: string): Observable<TeacherStream[]> {
    return this.http.get<TeacherStream[]>(`${this.apiUrl}/getAllStreams/${teacherId}`, this.httpOptions);
  }

  getAllScheduledClasses(organizationId: string, teacherId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getAllScheduledClasses/${organizationId}/${teacherId}`, this.httpOptions);
  }

  createClassSchedule(scheduleData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/classSchedule`, scheduleData, this.httpOptions);
  }

  getTeacherAttendanceDashboard(organizationId: string, teacherId: string): Observable<any> {
    return this.http.get<any>(`https://localhost:7270/api/SchoolDashboards/teacherDashboard/${organizationId}/${teacherId}`);
  }

  getTeacherAttendanceOverview(teacherId: string): Observable<any> {
    return this.http.get<any>(`https://localhost:7270/api/Attendance/teacheDashboard/${teacherId}`);
  }

  updateTeachingClass(teachingClassId: string, teachingClass: Partial<TeachingClass>): Observable<TeachingClass> {
    return this.http.put<TeachingClass>(`${this.apiUrl}/teachingClass/${teachingClassId}`, teachingClass, this.httpOptions);
  }

  deleteTeachingClass(teachingClassId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/teachingClass/${teachingClassId}`, this.httpOptions);
  }
}