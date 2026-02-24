import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StreamGrade {
  streamId: string;
  subject: string;
  streamName: string;
  firstName: string;
  lastName: string;
  teacherProfilePicture: string;
  classRoomNumber: string;
  totalStudents: number;
  teacherId: string;
}

@Injectable({
  providedIn: 'root'
})
export class StreamGradeService {
  private apiUrl = 'https://localhost:7270/api';

  constructor(private http: HttpClient) {}

  getStreamGrades(gradeId: string): Observable<StreamGrade[]> {
    return this.http.get<StreamGrade[]>(`${this.apiUrl}/Settings/getAllStreamGrades/${gradeId}`);
  }
}