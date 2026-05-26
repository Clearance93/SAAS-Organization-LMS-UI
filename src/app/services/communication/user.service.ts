import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'staff' | 'guest' | 'learner' | 'admin';
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/School`;

  constructor(private http: HttpClient) {}

  getUsersByRole(organizationId: string, role: string): Observable<User[]> {
    const endpoint = this.getRoleEndpoint(role);
    console.log(`Fetching users from: ${this.apiUrl}/${endpoint}/${organizationId}`);
    return this.http.get<any[]>(`${this.apiUrl}/${endpoint}/${organizationId}`)
      .pipe(
        map(users => {
          console.log(`Received ${users.length} ${role}s:`, users);
          return users.map(user => {
            console.log('Processing user:', user);
            const mappedUser = {
              id: this.getRoleSpecificId(user, role),
              name: user.name || user.fullName || `${user.firstName} ${user.lastName}` || user.userName,
              email: user.email || user.studentEmail || user.teacherEmail || user.staffEmail,
              role: role as any
            };
            console.log('Mapped user:', mappedUser);
            return mappedUser;
          });
        }),
        catchError(error => {
          console.error(`Error loading ${role}s:`, error);
          return of([]);
        })
      );
  }

  getAllUsers(organizationId: string): Observable<User[]> {
    const requests = [
      this.getUsersByRole(organizationId, 'student'),
      this.getUsersByRole(organizationId, 'learner'),
      this.getUsersByRole(organizationId, 'teacher'),
      this.getUsersByRole(organizationId, 'staff'),
      this.getUsersByRole(organizationId, 'guest')
    ];

    return forkJoin(requests).pipe(
      map(results => results.flat())
    );
  }

  private getRoleEndpoint(role: string): string {
    const endpoints: { [key: string]: string } = {
      'student': 'getAllStudents',
      'learner': 'getAllLearners',
      'teacher': 'getAllTeachers',
      'staff': 'getAllStuffMembers',
      'guest': 'getAllGuests'
    };
    return endpoints[role] || 'getAllStudents';
  }

  private getRoleSpecificId(user: any, role: string): string {
    // Based on the API response, use the role-specific ID field
    const roleIdMap: { [key: string]: string } = {
      'student': user.studentId,
      'teacher': user.teacherId,
      'staff': user.staffId,
      'learner': user.learnerId,
      'guest': user.guestId
    };
    
    const id = roleIdMap[role];
    console.log(`Found ${role} ID: ${id}`);
    return id;
  }

  getUserById(id: string): Observable<User | undefined> {
    // This would need to be implemented based on your API
    return new Observable(observer => {
      observer.next(undefined);
      observer.complete();
    });
  }
}
