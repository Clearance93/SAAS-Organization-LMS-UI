import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  submitAssignment(assignmentId: string, studentId: string, text: string, files: File[]): Observable<AssignmentSubmission> {
    const toBase64 = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1].replace(/\s/g, ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    return new Observable(observer => {
      Promise.all(files.map(toBase64)).then(base64Files => {
        const payload = {
          assignmentSubmissionId: '00000000-0000-0000-0000-000000000000',
          assignmentId,
          studentId,
          assignmentPdfSubmission: base64Files[0] ?? null,
          submissionDate: new Date().toISOString(),
          isPending: true,
          isCompleted: false
        };
        this.http.post<AssignmentSubmission>(`${this.apiUrl}/Assingment/submitAssignment`, payload)
          .subscribe({ next: v => { observer.next(v); observer.complete(); }, error: e => observer.error(e) });
      }).catch(e => observer.error(e));
    });
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
