import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AssignmentSubmission {
  submissionId: string;
  assignmentId: string;
  studentId: string;
  submissionText: string;
  attachments: string[];
  submittedDate: Date;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

@Injectable({
  providedIn: 'root'
})
export class AssignmentSubmissionService {
  private apiUrl = 'https://localhost:7270/api';

  constructor(private http: HttpClient) {}

  submitAssignment(assignmentId: string, studentId: string, text: string, files: File[]): Observable<AssignmentSubmission> {
    const formData = new FormData();
    formData.append('assignmentId', assignmentId);
    formData.append('studentId', studentId);
    formData.append('submissionText', text);
    
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    return this.http.post<AssignmentSubmission>(`${this.apiUrl}/Assignments/submit`, formData);
  }

  getStudentSubmissions(studentId: string): Observable<AssignmentSubmission[]> {
    return this.http.get<AssignmentSubmission[]>(`${this.apiUrl}/Assignments/student/${studentId}/submissions`);
  }

  getSubmissionsForGrading(teacherId: string): Observable<AssignmentSubmission[]> {
    return this.http.get<AssignmentSubmission[]>(`${this.apiUrl}/Assignments/teacher/${teacherId}/submissions`);
  }

  gradeSubmission(submissionId: string, grade: number, feedback: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/Assignments/grade`, {
      submissionId,
      grade,
      feedback
    });
  }
}
