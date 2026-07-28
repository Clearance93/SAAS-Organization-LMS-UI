import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Teacher {
  teacherId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  organizationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private baseUrl = `${environment.apiUrl}School`;

  constructor(private http: HttpClient) {}

  getAllTeachers(organizationId: string): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/getAllTeachers/${organizationId}`);
  }
}
