import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StudentTimetable {
  teacherFirstNames: string;
  teacherLastName: string;
  studentId: string;
  subject: string;
  streamName: string;
  subjectAddedAt: string;
  date: string;
  startTime: string;
  endTime: string;
  classRoomNumber: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class StudentTimetableService {
  private baseUrl = 'https://localhost:7270/api/School';

  constructor(private http: HttpClient) { }

  getStudentTimetable(studentId: string): Observable<StudentTimetable[]> {
    return this.http.get<StudentTimetable[]>(`${this.baseUrl}/studentTimeTable/${studentId}`);
  }
}