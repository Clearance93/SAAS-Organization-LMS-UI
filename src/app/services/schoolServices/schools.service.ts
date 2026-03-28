import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CreateGuestDto } from '../../interfaces/schools/guests/create-guest-dto';
import { AddGuest } from '../../interfaces/schools/guests/add-guest';
import { catchError, Observable, throwError } from 'rxjs';
import { CreateLearnerDto } from '../../interfaces/schools/learners/create-learner-dto';
import { AddLearner } from '../../interfaces/schools/learners/add-learner';
import { CreateStudentDto } from '../../interfaces/schools/students/create-student-dto';
import { AddStudent } from '../../interfaces/schools/students/add-student';
import { CreateStuffMemberDto } from '../../interfaces/schools/stuff-members/create-stuff-member-dto';
import { AddStuffMember } from '../../interfaces/schools/stuff-members/add-stuff-member';
import { CreateTeacherDto } from '../../interfaces/schools/teachers/create-teacher-dto';
import { AddTeacher } from '../../interfaces/schools/teachers/add-teacher';

@Injectable({
  providedIn: 'root'
})
export class SchoolsService {
 private apiUrl = 'https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School'

  constructor(private http: HttpClient) { }

  createGuest(guestData: CreateGuestDto) : Observable<AddGuest> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AddGuest>(`${this.apiUrl}/guest`, guestData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  createTeacher(teacherData: CreateTeacherDto): Observable<AddTeacher> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AddTeacher>(`${this.apiUrl}/teacher`, teacherData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  updateTeacher(id: string, guestData: Partial<CreateGuestDto>): Observable<AddGuest> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<AddGuest>(`${this.apiUrl}/update-guest/${id}`, guestData, { headers })
      .pipe(catchError(this.handleError))
  }

  private handleError = (error: any): Observable<never> => {
    let errorMessage = 'An error occurred';

    console.error('Full error object:', error);
    console.error('Error status:', error.status);
    console.error('Error body:', error.error);

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      // Handle different types of error responses
      if (typeof error.error === 'string') {
        // Direct string error message from API - could be stack trace
        errorMessage = this.extractErrorMessage(error.error);
      } else if (error.error instanceof SyntaxError) {
        // JSON parsing error - the response is likely plain text
        const syntaxErrorMsg = error.error.message;
        if (syntaxErrorMsg.includes('"') && syntaxErrorMsg.includes('...')) {
          // Extract text between quotes
          const match = syntaxErrorMsg.match(/"([^"]+)"/); 
          if (match && match[1]) {
            errorMessage = match[1];
          } else {
            errorMessage = 'Server returned an unexpected response format';
          }
        } else {
          errorMessage = 'Server returned an unexpected response format';
        }
      } else if (error.error?.message) {
        errorMessage = this.extractErrorMessage(error.error.message);
      } else if (error.error?.title) {
        errorMessage = this.extractErrorMessage(error.error.title);
      } else if (error.message) {
        errorMessage = this.extractErrorMessage(error.message);
      } else {
        errorMessage = `Server error (${error.status})`;
      }
    }

    console.error('Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private extractErrorMessage(fullError: string): string {
    // Handle stack traces and extract meaningful error messages
    if (fullError.includes('System.Exception:')) {
      // Extract message after System.Exception:
      const parts = fullError.split('System.Exception:');
      if (parts.length > 1) {
        const messagePart = parts[1].split('\n')[0].trim();
        return messagePart || fullError;
      }
    }
    
    if (fullError.includes('InvalidOperationException:')) {
      // Extract message after InvalidOperationException:
      const parts = fullError.split('InvalidOperationException:');
      if (parts.length > 1) {
        const messagePart = parts[1].split('\n')[0].trim();
        return messagePart || fullError;
      }
    }
    
    // If it's a stack trace, try to extract the first line which usually contains the error message
    if (fullError.includes('at ') && fullError.includes('\n')) {
      const firstLine = fullError.split('\n')[0].trim();
      // Remove common prefixes
      if (firstLine.includes(': ')) {
        const messagePart = firstLine.split(': ').slice(1).join(': ');
        return messagePart || firstLine;
      }
      return firstLine;
    }
    
    return fullError;
  }

  createLearner(learnerData: CreateLearnerDto): Observable<AddLearner> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AddLearner>(`${this.apiUrl}/learner`, learnerData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  updateLearner(id: string, learnerData: Partial<CreateLearnerDto>): Observable<AddLearner> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<AddLearner>(`${this.apiUrl}/update-learn/${id}`, learnerData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  createStudent(studentData: CreateStudentDto): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/student`, studentData, { headers, responseType: 'text' })
      .pipe(
        catchError(this.handleError)
      )
  }

  updateStudent(id: string, studentData: Partial<CreateStudentDto>): Observable<AddStudent> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    return this.http.put<AddStudent>(`${this.apiUrl}/update-student/${id}`, studentData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  createStuffMember(stuffMemberData: CreateStuffMemberDto): Observable<AddStuffMember> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<AddStuffMember>(`${this.apiUrl}/stuffMember`, stuffMemberData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }

  updateStuffMember(id: string, stuffMemberData: Partial<CreateStuffMemberDto>): Observable<AddStuffMember> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<AddStuffMember>(`${this.apiUrl}/update-stuff-member/${id}`, stuffMemberData, { headers })
      .pipe(
        catchError(this.handleError)
      )
  }
}
