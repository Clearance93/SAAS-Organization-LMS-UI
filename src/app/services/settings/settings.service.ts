import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
import { SchoolProfile } from '../../interfaces/schools/settings/school-profile';
import { GradeLevel } from '../../interfaces/schools/settings/grade-level';
import { Course } from '../../interfaces/schools/settings/course';
import { ExamType } from '../../interfaces/schools/settings/exam-type';
import { Services } from '../../interfaces/schools/settings/services';
import { UserRole } from '../../interfaces/schools/settings/user-role';
import { LibraryItem } from '../../interfaces/schools/settings/library-item';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SchoolProfileModel } from '../../features/organization/models/settings/school-profile-model';
import { GradeLevelModel } from '../../features/organization/models/settings/grade-level-model';
import { CourseModel } from '../../features/organization/models/settings/course-model';
import { ExamTypeModel } from '../../features/organization/models/settings/exam-type-model';
import { ServiceModel } from '../../features/organization/models/settings/service-model';
import { UserRoleModel } from '../../features/organization/models/settings/user-role-model';
import { LibraryItemModel } from '../../features/organization/models/settings/library-item-model';
import { SchoolAdminSettingsDto } from '../../interfaces/settings/school-admin-settings-dto';
import { SchoolAdminGeneralSettings } from '../../features/organization/models/settings/school-admin-general-settings';
import { GradeWithStreamModel } from '../../features/organization/models/settings/grade-with-stream-model';
import { GradeWithStreamDto } from '../../interfaces/settings/grade-with-stream-dto-';
import { TeacherModel, Teacher } from '../../pages/modals/add-grade-modal/teacher.model';
import { StreamsModels } from '../../features/organization/models/settings/streams-models';
import { Streams } from '../../interfaces/settings/streams';
import { SchoolSubject } from '../../interfaces/settings/school-subject';
import { SchoolSubjectModel } from '../../features/organization/models/settings/school-subject-model';
import { CourseStream } from '../../interfaces/settings/course-stream';
import { CourseStreamModel } from '../../features/organization/models/settings/course-stream-model';
import { IExamGradeScale } from '../../interfaces/settings/iexam-grade-scale';
import { ExamGradesScaleModel } from '../../features/organization/models/settings/exam-grades-scale-model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = 'https://localhost:7270/api/Settings';
  private schoolApiUrl = 'https://localhost:7270/api/School/'



  private schoolSettingsSubject = new BehaviorSubject<SchoolAdminGeneralSettings | null>(null)

  public schoolSetting$ = this.schoolSettingsSubject.asObservable();

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  private schoolProfileSubject = new BehaviorSubject<SchoolProfile | null>(null);
  private gradesSubject = new BehaviorSubject<GradeLevel[]>([]);
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  private examtypesSubject = new BehaviorSubject<ExamType[]>([]);
  private serviceSubject = new BehaviorSubject<Services[]>([]);
  private userRolesSubjet = new BehaviorSubject<UserRole[]>([]);
  private libraryItemsSubject = new BehaviorSubject<LibraryItem[]>([])
  private _streams = new BehaviorSubject<Streams[]>([]);
  private _courseStreams = new BehaviorSubject<CourseStream[]>([]);
  private examGradeScalesSubject = new BehaviorSubject<IExamGradeScale[]>([]);

  public schoolProfile$ = this.schoolProfileSubject.asObservable();
  public grades$ = this.gradesSubject.asObservable();
  public courses$ = this.coursesSubject.asObservable();
  public examTypes$ = this.examtypesSubject.asObservable();
  public services$ = this.serviceSubject.asObservable();
  public userRoles$ = this.userRolesSubjet.asObservable();
  public libraryItems$ = this.libraryItemsSubject.asObservable();
  public streams$ = this._streams.asObservable();
  public courseStreams$ = this._courseStreams.asObservable();
  public examGradeScales$ = this.examGradeScalesSubject.asObservable();

  constructor(private http: HttpClient) {}

  getSchoolSettings(organizationId: string): Observable<SchoolAdminGeneralSettings> {
    return this.http.get<any>(`${this.apiUrl}/adminSchoolSettingsById/${organizationId}`, this.httpOptions)
      .pipe(
        map(response => SchoolAdminGeneralSettings.fromJson(response)),
        tap(settings => {
          this.schoolSettingsSubject.next(settings);
          console.log('School settings loaded:', settings)
        }),
        catchError(this.handleError<SchoolAdminGeneralSettings>('getSchoolSettings'))
      )
  }

  createSchoolSettings(settings: SchoolAdminSettingsDto): Observable<SchoolAdminGeneralSettings> {
    const model = new SchoolAdminGeneralSettings(settings);
    const payload = model.toApiRequest();

    console.log('Creating school settings with payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/adminSchoolSettings`, payload, this.httpOptions)
      .pipe(
        map(response => SchoolAdminGeneralSettings.fromJson(response)),
        tap(newSettings => {
          this.schoolSettingsSubject.next(newSettings);
          console.log('School settings created successfully:', newSettings);
        }),
        catchError(this.handleError<SchoolAdminGeneralSettings>(''))
      )
  }

  getCurrentSettings(): SchoolAdminGeneralSettings | null {
    return this.schoolSettingsSubject.value
  }

   getSchoolProfile(): Observable<SchoolProfile> {
    return this.http.get<SchoolProfile>(`${this.apiUrl}/getSettingsData`)
      .pipe (
        map(data => SchoolProfileModel.fromJson(data)),
        tap(profile => this.schoolProfileSubject.next(profile)),

        catchError(this.handleError<SchoolProfile>('getSchoolprofile'))
      );
   }

   updateSchoolProfile(profile: SchoolProfile): Observable<SchoolProfile> {
    return this.http.put<SchoolProfile>(`${this.apiUrl}/updateSettings`, profile)
      .pipe (
        map(data => SchoolProfileModel.fromJson(data)),
        tap(profile => this.schoolProfileSubject.next(profile)),

        catchError(this.handleError<SchoolProfile>('updateSchoolProfile'))
      )
   }

   getGrades(): Observable<GradeLevel[]> {
    return this.http.get<GradeLevel[]>(`${this.apiUrl}/getAllGrades`)
      .pipe(
        map(grades => grades.map(g => GradeLevelModel.fromJson(g))),
        tap(grades => this.gradesSubject.next(grades)),

        catchError(this.handleError<GradeLevel[]>('getGrades', []))
      )
   }

   createGrade(grade: Partial<GradeLevel>): Observable<GradeLevel> {
    return this.http.post<GradeLevel>(`${this.apiUrl}/createGrades`, grade)
      .pipe(
        map(data => GradeLevelModel.fromJson(data)),
        tap(newGrade => {
        const current = this.gradesSubject.value;
        this.gradesSubject.next([...current, newGrade]);
      }),
      catchError(this.handleError<GradeLevel>('createGrade'))
      )
   }

   updateGrade(id: string, grade: Partial<GradeLevel>): Observable<GradeLevel> {
    return this.http.put<GradeLevel>(`${this.apiUrl}/updateGrades/${id}`, grade)
      .pipe (
        map(data => GradeLevelModel.fromJson(data)),
        tap(updateGrade => {
          const current = this.gradesSubject.value;
          const index = current.findIndex(g => g.id === id);
          if (index !== -1) {
            current[index] = updateGrade;
            this.gradesSubject.next([...current]);
          }
        }),
        catchError(this.handleError<GradeLevel>('updateGrade'))
      );
   }

   deleteGrade(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/deleteGrade/${id}`)
      .pipe(
        tap(() => {
          const current = this.gradesSubject.value;
          this.gradesSubject.next(current.filter(g => g.id !== id));
        }),
        catchError(this.handleError<void>('deleteGrade'))
      );
   }

   getCourses(): Observable<Course[]> {
    console.log('Fetching courses...');
    return this.http.get<Course[]>(`${this.apiUrl}/getCourses`)
      .pipe(
        map(courses => courses.map(c => CourseModel.fromJson(c))),
        tap(courses => this.coursesSubject.next(courses)),
        tap(courses => console.log(`Courses fetched successfully, ${courses}`)),

        catchError(this.handleError<Course[]>('getCourses', []))
      )
   }

   createCourse(course: Partial<Course>): Observable<Course> {
    return this.http.post<Course>(`${this.apiUrl}/createCourse`, course)
      .pipe(
        map(data => CourseModel.fromJson(data)),
        tap(newCourse => {
          const current = this.coursesSubject.value;
          this.coursesSubject.next([...current, newCourse]);
        }),

        catchError(this.handleError<Course>('createCourse'))
      )
   }

   updateCourse(id: string, course: Partial<Course>): Observable<Course> {
    return this.http.put<Course>(`${this.apiUrl}/updateCourse/${id}`, course)
      .pipe(
        map(data => CourseModel.fromJson(data)),
        tap(updatedCourse => {
          const current = this.coursesSubject.value;
          const index = current.findIndex(c => c.id === id);
          if (index !== -1) {
            current[index] = updatedCourse;
            this.coursesSubject.next([...current])
          }
        }),
        catchError(this.handleError<Course>('updateCourse'))
      )
   }

   getExamTypes(): Observable<ExamType[]> {
    return this.http.get<ExamType[]>(`${this.apiUrl}/getExamType`)
      .pipe(
        map(types => types.map(t => ExamTypeModel.fromJson(t))),
        tap(types => this.examtypesSubject.next(types)),

        catchError(this.handleError<ExamType[]>('getExamTypes', []))
      )
   }

   createExamType(examType: Partial<ExamType>): Observable<ExamType> {
    return this.http.post<ExamType>(`${this.apiUrl}/createExamType`, examType)
      .pipe(
        map(data => ExamTypeModel.fromJson(data)),
        tap(newType => {
          const current = this.examtypesSubject.value;
          this.examtypesSubject.next([...current, newType]);
        }),
        catchError(this.handleError<ExamType>('createExamType'))
      );
   }

   getServices(): Observable<Services[]> {
    return this.http.get<Services[]>(`${this.apiUrl}/getServices`)
      .pipe(
        map(services => services.map(s => ServiceModel.fromJson(s))),
        tap(services => this.serviceSubject.next(services)),

        catchError(this.handleError<Services[]>('getServices', []))
      );
   }

   toggleService(id: string, enabled: boolean): Observable<Services> {
    return this.http.patch<Services>(`${this.apiUrl}/updateServices/${id}`, { enabled })
      .pipe(
        map(data => ServiceModel.fromJson(data)),
        tap(updatedService => {
          const current = this.serviceSubject.value;
          const index = current.findIndex(s => s.id === id);
          if (index !== -1) {
            current[index] = updatedService;
            this.serviceSubject.next([...current]);
          }
        }),
        catchError(this.handleError<Services>('toggleService'))
      )
   }

   getUserRoles(): Observable<UserRole[]> {
    return this.http.get<UserRole[]>(`${this.apiUrl}/getUsers`)
      .pipe(
        map(roles => roles.map(r => UserRoleModel.fromJson(r))),
        tap(roles => this.userRolesSubjet.next(roles)),

        catchError(this.handleError<UserRole[]>('getUserRoles', []))
      );
    }

    updateRolePersmission(id: string, permission: string[]): Observable<UserRole> 
    {
      return this.http.patch<UserRole>(`${this.apiUrl}/updateRoles/${id}`, { permission })
        .pipe (
          map(data => UserRoleModel.fromJson(data)),
          tap(updatedRole => {
            const current = this.userRolesSubjet.value;
            const index = current.findIndex(r => r.id === id);

            if (index !== 1) {
              current[index] = updatedRole;
              this.userRolesSubjet.next([...current])
            }
          }),
          catchError(this.handleError<UserRole>('updateRolePermissions'))
        );
    }

    getLibraryItems(): Observable<LibraryItem[]> {
      return this.http.get<LibraryItem[]>(`${this.apiUrl}/getLibrary`)
        .pipe(
          map(items => items.map(i => LibraryItemModel.fromJson(i))),
          tap(items => this.libraryItemsSubject.next(items)),

          catchError(this.handleError<LibraryItem[]>('getLibraryItems', []))
        );
    }

    addLibraryItem(item: Partial<LibraryItem>): Observable<LibraryItem> {
      return this.http.post<LibraryItem>(`${this.apiUrl}/createLibrary`, item)
        .pipe(
          map(data => LibraryItemModel.fromJson(data)),
          tap(newItem => {
            const current = this.libraryItemsSubject.value;
            this.libraryItemsSubject.next([...current, newItem]);
          }),
          catchError(this.handleError<LibraryItem>('addLibraryItem'))
        );
    }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);

      return of(result as T)
    }
  }

  addGradeWithStream(payload: any): Observable<GradeWithStreamModel> {
    console.log('Adding grade with stream with payload:', payload);

    return this.http.post<any>(`${this.apiUrl}/addingGradesAndStream`, payload, this.httpOptions)
      .pipe(
        map(response => GradeWithStreamModel.fromJson(response)),
        tap(newGradeStream => {
          console.log("Grade with stream added successfully:", newGradeStream);

          this.getGrades().subscribe();
        }),
        catchError(this.handleError<GradeWithStreamModel>('addGradeWithStream'))
      ); 
  }

  getTeachersByOrganization(organizationId: string): Observable<Teacher[]> {
    const url = `${this.schoolApiUrl}getAllTeachers/${organizationId}`;
    console.log('Fetching teachers from:', url);
    
    return this.http.get<any[]>(url).pipe(
      map(teachers => {
        console.log('Raw teachers response:', teachers);
        return teachers.map(t => TeacherModel.fromJson(t));
      }),
      catchError(error => {
        console.error('Error fetching teachers:', error);
        return this.handleError<Teacher[]>('getTeachersByOrganization', [])(error);
      })
    );
  }

  getAllStreamsbyOrganizationId(organizationId: string): Observable<Streams[]> {
    const url = `${this.apiUrl}/getAllStreams/${organizationId}`;

    return this.http.get<Streams[]>(url).pipe(
      map(streams => streams.map(s => StreamsModels.fromJson(s))),
      tap(streams => this._streams.next(streams)),
      catchError(this.handleError<StreamsModels[]>('getAllStreamsByOrganizationId', []))
    );
  }

  updateCourseStream(courseStreamId: string, data: Partial<CourseStream>): Observable<CourseStream> {
    const url = `${this.apiUrl}/updateCourseStream/${courseStreamId}`;
    return this.http.put<any>(url, data, this.httpOptions).pipe(
      map(response => CourseStreamModel.fromJson(response)),
      tap((updatedStream: CourseStreamModel) => {
        const current = this._courseStreams.value || [];
        const idx = current.findIndex(s => (s.courseStreamId || (s as any).id) === (updatedStream.courseStreamId || (updatedStream as any).id));
        if (idx !== -1) {
          current[idx] = updatedStream as any;
          this._courseStreams.next([...current]);
        } else {
          this._courseStreams.next([...current, updatedStream as any]);
        }
      }),
      catchError(this.handleError<CourseStream>('updateCourseStream'))
    );
  }

  deleteCourseStream(courseStreamId: string): Observable<void> {
    const url = `${this.apiUrl}/deleteCourseStream/${courseStreamId}`;
    return this.http.delete<void>(url)
      .pipe(
        tap(() => {
          const currentStreams = this._courseStreams.value || [];
          const updatedStreams = currentStreams.filter(s => (s.courseStreamId || (s as any).id) !== courseStreamId);
          this._courseStreams.next([...updatedStreams]);
        }),
        catchError(this.handleError<void>('deleteCourseStream'))
      );
  }

  addSchoolSubject(subjectPayload: any): Observable<SchoolSubject> {
    console.log('Adding school subject with payload:', subjectPayload);

    return this.http.post<any>(`${this.apiUrl}/addSchoolSubject`, subjectPayload, this.httpOptions)
      .pipe(
        map(response => SchoolSubjectModel.fromJson(response)),
        tap(newSubject => {
          console.log('School subject added successfully:', newSubject);

          this.getSchoolProfile().subscribe();
        }),
        catchError(this.handleError<SchoolSubject>('addSchoolSubject'))
      );
  }

  addExamGradeScales(examPayload: any): Observable<IExamGradeScale> {
    console.log('Adding exam grade scale with payload:', examPayload);

    return this.http.post<any>(`${this.apiUrl}/examGrades`, examPayload, this.httpOptions)
      .pipe(
        map(response => ExamGradesScaleModel.fromJson(response)),
        tap(newScale => {
          console.log('Exam grade scale added successfully:', newScale);
        }),
        catchError(this.handleError<IExamGradeScale>('addExamGradeScales'))
      );
  }

  getExamGradeScales(organizationId: string): Observable<IExamGradeScale[]> {
    const url = `${this.apiUrl}/getExamGrades/${organizationId}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('Raw API response:', response);
        
        let scales: any[] = [];
        
        if (Array.isArray(response)) {
          scales = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            scales = response.data;
          } else if (response.$values && Array.isArray(response.$values)) {
            scales = response.$values;
          } else {
            scales = [response];
          }
        }
        
        console.log('Processed scales array:', scales);
        return scales.map(s => ExamGradesScaleModel.fromJson(s));
      }),
      tap(scales => {
        console.log('Exam grade scales fetched:', scales);
        this.examGradeScalesSubject.next(scales);
      }),
      catchError(error => {
        console.error('getExamGradeScales failed:', error);
        if (error.name === 'HttpErrorResponse' && error.status === 0) {
          console.warn('SSL certificate error - using empty array for exam grade scales');
        }
        return this.handleError<IExamGradeScale[]>('getExamGradeScales', [])(error);
      })
    );
  }

  deleteExamGradeScale(examGradeScaleId: string): Observable<void> {
    const url = `${this.apiUrl}/deleteExamGradeScale/${examGradeScaleId}`;
    return this.http.delete<void>(url).pipe(
      tap(() => {
        const currentScales = this.examGradeScalesSubject.value || [];
        const updatedScales = currentScales.filter(s => s.examGradeScaleId !== examGradeScaleId);
        this.examGradeScalesSubject.next(updatedScales);
      }),
      catchError(this.handleError<void>('deleteExamGradeScale'))
    );
  }

  addCourseStream(courseStreamPayload: any): Observable<CourseStream> {
    console.log('Adding course stream with payload:', courseStreamPayload);

    return this.http.post<any>(`${this.apiUrl}/addCourseStream`, courseStreamPayload, this.httpOptions)
      .pipe(
        map(response => CourseStreamModel.fromJson(response)),
        tap(newCourseStream => { 
          const currentStreams = this._courseStreams.value;
          this._courseStreams.next([...currentStreams, newCourseStream]);
        }), 
        catchError(this.handleError<CourseStream>('addCourseStream'))
      );
  }

  getAllCoursesStreamsByOrganizationId(organizationId: string): Observable<CourseStream[]> {
    const url = `${this.apiUrl}/getAllCourse/${organizationId}`;

    return this.http.get<CourseStream[]>(url).pipe(  
      map(streams => streams.map(s => CourseStreamModel.fromJson(s))),
      tap(streams => this._courseStreams.next(streams)),
      catchError(this.handleError<CourseStream[]>('getAllCoursesStreamsByOrganizationId', []))
    );
  }

  getCourseStreamById(courseStreamId: string): Observable<CourseStream> {
    const url = `${this.apiUrl}/getById/${courseStreamId}`;
    return this.http.get<any>(url).pipe(
      map(stream => CourseStreamModel.fromJson(stream)),
      catchError(this.handleError<CourseStream>('getCourseStreamById'))
    );
  }
}