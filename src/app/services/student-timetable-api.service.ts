import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentTimetableResponse {
  teacherFirstNames: string;
  teacherLastName: string;
  studentId: string;
  subject: string;
  streamName: string;
  subjectAddedAt: string;
  date: string;
  startTime: string;
  endTime: string;
  classRoomNumber: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentTimetableApiService {
  private baseUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School';

  constructor(private http: HttpClient) {}

  getStudentTimetable(studentId: string): Observable<StudentTimetableResponse[]> {
    return this.http.get<StudentTimetableResponse[]>(`${this.baseUrl}/studentTimeTable/${studentId}`);
  }
}
