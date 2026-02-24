import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDashboardApiResponse } from '../../interfaces/student-dashboard-api';
import { StudentAcademicProgress } from '../../interfaces/student-academic-progress';

@Injectable({
  providedIn: 'root'
})
export class StudentDashboardService {
  private apiUrl = 'https://localhost:7270/api/';

  constructor(private http: HttpClient) { }

  getStudentDashboard(organizationId: string, studentId: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/dashboard/${organizationId}/${studentId}`;
    return this.http.get<any>(url);
  }

  getStudentDashboardData(studentId: string): Observable<StudentDashboardApiResponse[]> {
    const url = `${this.apiUrl}SchoolDashboards/studentDashboard/${studentId}`;
    return this.http.get<StudentDashboardApiResponse[]>(url);
  }

  getStudentAcademicProgress(studentId: string): Observable<StudentAcademicProgress[]> {
    const url = `${this.apiUrl}StudentAcademicAttendance/getStudentAcademic/${studentId}`;
    return this.http.get<StudentAcademicProgress[]>(url);
  }

  getStudentSchedule(studentId: string, date?: string): Observable<any> {
    const url = `${this.apiUrl}School/studentTimeTable/${studentId}`;
    return this.http.get<any>(url);
  }

  getStudentGrades(studentId: string, term?: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/grades/${studentId}`;
    if (term) {
      return this.http.get<any>(url, { params: { term } });
    }
    return this.http.get<any>(url);
  }

  getStudentAssignments(studentId: string, status?: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/assignments/${studentId}`;
    if (status) {
      return this.http.get<any>(url, { params: { status } });
    }
    return this.http.get<any>(url);
  }

  getStudentAttendance(studentId: string, period?: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/attendance/${studentId}`;
    if (period) {
      return this.http.get<any>(url, { params: { period } });
    }
    return this.http.get<any>(url);
  }

  getAnnouncements(organizationId: string, studentId: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/announcements/${organizationId}/${studentId}`;
    return this.http.get<any>(url);
  }

  getUpcomingEvents(organizationId: string, studentId: string): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/events/${organizationId}/${studentId}`;
    return this.http.get<any>(url);
  }

  submitAssignment(assignmentId: string, submission: FormData): Observable<any> {
    const url = `${this.apiUrl}SchoolDashboards/assignments/${assignmentId}/submit`;
    return this.http.post<any>(url, submission);
  }

  submitStudentAssignment(submissionData: any): Observable<any> {
    const url = `${this.apiUrl}Assingment/assignmentSubmission`;
    return this.http.post<any>(url, submissionData);
  }

  getTeachingClasses(organizationId: string, teacherId: string): Observable<any[]> {
    const url = `${this.apiUrl}TeachersSchedule/getAllteachingClasses/${organizationId}/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  addStudentSubject(enrollmentData: any): Observable<any> {
    const url = `${this.apiUrl}School/addStudentSubject`;
    return this.http.post<any>(url, enrollmentData);
  }

  getStudentSubjects(studentId: string): Observable<any[]> {
    const url = `${this.apiUrl}School/allStudentSubjectById/${studentId}`;
    return this.http.get<any[]>(url);
  }

  getStudentUpcomingSessions(studentId: string): Observable<any[]> {
    const url = `${this.apiUrl}MeetingsUrl/studentClasses/${studentId}`;
    return this.http.get<any[]>(url);
  }

  getUpcomingSessionsByRole(role: string): Observable<any[]> {
    const url = `${this.apiUrl}MeetingsUrl/upcommingSession/${role}`;
    return this.http.get<any[]>(url);
  }

  // Get student videos
  // GET https://localhost:7270/api/VideoUpload/studentVideos/{studentId}
  getStudentVideos(studentId: string): Observable<any[]> {
    const url = `${this.apiUrl}VideoUpload/studentVideos/${studentId}`;
    return this.http.get<any[]>(url);
  }
}