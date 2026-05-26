import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudentProfile {
  studentId: string;
  firstName: string;
  lastName: string;
  studentEmail: string;
  studentProfilePicture: string;
  dateOfBirth: string;
  gender: string;
  organizationSetupId: string;
}

export interface StudentGradeDto {
  organizationId: string;
  studentId: string;
  teacherId: string;
  streamGradeId: string;
  teacherFirstNames?: string;
  teacherLastName?: string;
  studentFirstName?: string;
  studentLastName?: string;
  studentProfilePicture?: string;
  subject?: string;
  streamName?: string;
  subjectAddedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStudentByEmail(email: string): Observable<StudentProfile> {
    return this.http.get<StudentProfile>(`${this.apiUrl}/School/getStudentByEmail/${email}`);
  }

  getAllGrades(organizationId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Settings/getAllGrades/${organizationId}`);
  }

  addStudentSubject(studentGradeDto: StudentGradeDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/School/addStudentSubject`, studentGradeDto);
  }

  removeStudentSubject(studentGradeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/School/removeSub/${studentGradeId}`);
  }

  getStudentEnrollments(studentId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/School/getStudentEnrollments/${studentId}`);
  }
}
