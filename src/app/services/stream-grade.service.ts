import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStreamGrades(gradeId: string): Observable<StreamGrade[]> {
    return this.http.get<StreamGrade[]>(`${this.apiUrl}/Settings/getAllStreamGrades/${gradeId}`);
  }
}
