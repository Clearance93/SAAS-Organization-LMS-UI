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
  private baseUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/apiSchool';

  constructor(private http: HttpClient) {}

  getAllTeachers(organizationId: string): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.baseUrl}/getAllTeachers/${organizationId}`);
  }
}
