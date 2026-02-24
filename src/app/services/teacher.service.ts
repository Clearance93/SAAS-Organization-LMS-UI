import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private baseUrl = 'https://localhost:7270/apiSchool';

  constructor(private http: HttpClient) {}

  getAllTeachers(organizationId: string): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/getAllTeachers/${organizationId}`);
  }
}