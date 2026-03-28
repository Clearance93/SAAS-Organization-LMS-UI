import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Grade, Subject, EnrollSubjectDto } from '../../interfaces/student/subject-enrollment';

@Injectable({
  providedIn: 'root'
})
export class SubjectEnrollmentService {
  private baseUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api';

  constructor(private http: HttpClient) { }

  getGrades(organizationId: string): Observable<Grade[]> {
    return this.http.get<Grade[]>(`${this.baseUrl}/Settings/getAllGrades/${organizationId}`);
  }

  getSubjectsByGrade(gradeId: number, organizationId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/Subjects/grade/${gradeId}/organization/${organizationId}`);
  }

  enrollInSubjects(enrollmentData: EnrollSubjectDto): Observable<any> {
    return this.http.post(`${this.baseUrl}/StudentEnrollment/enrollSubjects`, enrollmentData);
  }

  getStudentSubjects(studentId: number): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.baseUrl}/StudentEnrollment/student/${studentId}/subjects`);
  }
}
