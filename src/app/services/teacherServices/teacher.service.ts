import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateTeacherDto } from '../../interfaces/schools/teachers/create-teacher-dto';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators'
import { AddTeacher } from '../../interfaces/schools/teachers/add-teacher';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {
  private apiUrl = `${environment.apiUrl}/School`

  constructor(private http: HttpClient) { }

  createTeacher(teacherData: CreateTeacherDto): Observable<AddTeacher> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AddTeacher>(`${this.apiUrl}/teacher`, teacherData, { headers })
        .pipe(
          catchError(this.handleError)
        )
  }

  updateTeacher(id: string, teacherData: Partial<CreateTeacherDto>): Observable<AddTeacher> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<AddTeacher>(`${this.apiUrl}/update-teacher/${id}`, teacherData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occured'; 

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    }
    else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    console.error(errorMessage)
    return throwError(() => new Error(errorMessage));
  }

}
