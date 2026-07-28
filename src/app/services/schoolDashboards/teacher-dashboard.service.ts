import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, timeout, catchError, throwError } from 'rxjs';
import { StreamResponse, ClassScheduleDto } from '../../interfaces/class-schedule';
import { AssignmentDto } from '../../interfaces/assignment';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {
  private apiUrl = `${environment.apiUrl}/SchoolDashboards`;
  private teacherScheduleUrl = `${environment.apiUrl}/TeachersSchedule`;
  private assignmentUrl = `${environment.apiUrl}/Assingment/createAssignment`;

  constructor(private http: HttpClient) { }

  getTeacherDashboard(organizationId: string, teacherId: string): Observable<any> {
    const url = `${this.apiUrl}/teacherDashboard/${organizationId}/${teacherId}`;
    console.log('TeacherDashboardService.getTeacherDashboard - URL:', url);
    console.log('TeacherDashboardService.getTeacherDashboard - organizationId:', organizationId, 'teacherId:', teacherId);
    return this.http.get<any>(url);
  }

  // Fetch all streams for a teacher.
  // Uses: GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/TeachersSchedule/getAllStreams/{teacherId}
  getAllStreams(teacherId: string): Observable<StreamResponse[]> {
    const url = `${this.teacherScheduleUrl}/getAllStreams/${teacherId}`;
    return this.http.get<StreamResponse[]>(url);
  }

  // Create a new class schedule
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/TeachersSchedule/classSchedule
  createClassSchedule(payload: ClassScheduleDto, streamName: string): Observable<any> {
    const url = `${this.teacherScheduleUrl}/classSchedule`;
    return this.http.post<any>(url, payload);
  }

  // Create a new assignment
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/createAssignment
  createAssignment(payload: any, assignmentFile?: File, rubricFile?: File): Observable<any> {
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });
    if (assignmentFile) formData.append('assignmentFormFile', assignmentFile);
    if (rubricFile) formData.append('rubricFormFile', rubricFile);
    return this.http.post<any>(this.assignmentUrl, formData);
  }

  // Get teacher assignments
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/getTeacherAssignments/{teacherId}
  getTeacherAssignments(teacherId: string): Observable<AssignmentDto[]> {
    const url = `${environment.apiUrl}/Assingment/getTeacherAssignments/${teacherId}`;
    return this.http.get<AssignmentDto[]>(url);
  }

  // Get all submitted assignments for teacher
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/getAllTeacherAssignments/{teacherId}
  // DEPRECATED - Use getAllTeacherAssignmentSubmissions instead
  getAllTeacherSubmittedAssignments(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/Assingment/getAllTeacherAssignments/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get all teacher performance
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/ClassPerformance/getAllTeacherPerformance/{teacherId}
  getAllTeacherPerformance(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/ClassPerformance/getAllTeacherPerformance/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get teacher by email
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School/getTeacherByEmail/{teacherEmail}
  getTeacherByEmail(teacherEmail: string): Observable<any> {
    const url = `${environment.apiUrl}/School/getTeacherByEmail/${teacherEmail}`;
    return this.http.get<any>(url);
  }

  // Update teacher profile
  // PUT https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School/update-teacher/{teacherId}
  updateTeacherProfile(teacherId: string, payload: any): Observable<any> {
    const url = `${environment.apiUrl}/School/update-teacher/${teacherId}`;
    return this.http.put<any>(url, payload);
  }

  // Get teacher subjects with grades
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/TeachersSchedule/teacherSubjestGrade/{teacherId}
  getTeacherSubjectsWithGrades(teacherId: string): Observable<any[]> {
    const url = `${this.teacherScheduleUrl}/teacherSubjestGrade/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get upcoming sessions by role
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/MeetingsUrl/upcommingSession/{usrRole}
  getUpcomingSessionsByRole(usrRole: string): Observable<any[]> {
    const url = `${environment.apiUrl}/MeetingsUrl/upcommingSession/${usrRole}`;
    return this.http.get<any[]>(url);
  }

  // Get all teacher assignment submissions (with PDF data)
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/getAllTeacherAssignSubm/{teacherId}
  getAllTeacherAssignmentSubmissions(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/Assingment/getAllTeacherAssignSubm/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get submission details including PDF
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/submissionAssignment/{assignmentSubmissionId}
  getSubmissionDetails(assignmentSubmissionId: string): Observable<any> {
    const url = `${environment.apiUrl}/Assingment/submissionAssignment/${assignmentSubmissionId}`;
    return this.http.get<any>(url);
  }

  // Submit assignment grade
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Assingment/addAssignmentGrades
  submitAssignmentGrade(payload: any): Observable<any> {
    const url = `${environment.apiUrl}/Assingment/addAssignmentGrades`;
    return this.http.post<any>(url, payload);
  }

  // Get AI grade assistance
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/AIAssistance/aiGradeAssistance
  getAiGradeAssistance(assignmentId: string, studentId: string): Observable<any> {
    const url = `${environment.apiUrl}/AIAssistance/aiGradeAssistance?assignmentId=${assignmentId}&studentId=${studentId}`;
    return this.http.post<any>(url, {});
  }

  // Get plagiarism result
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/AIAssistance/getPlagiarismResult
  getPlagiarismResult(assignmentId: string, studentId: string): Observable<any> {
    const url = `${environment.apiUrl}/AIAssistance/getPlagiarismResult?assignmentId=${assignmentId}&studentId=${studentId}`;
    return this.http.get<any>(url);
  }

  // Upload video - POST /api/VideoUpload/uploadVideo [FromForm] with IFormFile
  uploadVideo(payload: any, videoFile?: File): Observable<any> {
    const url = `${environment.apiUrl}/VideoUpload/uploadVideo`;
    const formData = new FormData();
    formData.append('preRecordedVideoId', '00000000-0000-0000-0000-000000000000');
    formData.append('teacherId', payload.teacherId || '');
    formData.append('gradeStreamId', payload.gradeStreamId || '');
    formData.append('teacherFullNames', payload.teacherFullNames || '');
    formData.append('streamName', payload.streamName || '');
    formData.append('videoTitle', payload.videoTitle || '');
    formData.append('description', payload.description || '');
    formData.append('videoUpload', payload.videoUpload || '');
    formData.append('uploadedTime', new Date().toISOString());
    if (videoFile) {
      formData.append('formFileVideoFile', videoFile, videoFile.name);
    }
    return this.http.post<any>(url, formData).pipe(
      timeout(120000),
      catchError(err => {
        if (err.name === 'TimeoutError') {
          return throwError(() => new Error('Upload timed out after 2 minutes. Please try a smaller file or check your connection.'));
        }
        if (err.status === 0) {
          return throwError(() => new Error('Unable to reach the server. This may be a CORS or network issue. Please try from the production URL.'));
        }
        return throwError(() => err);
      })
    );
  }

  // Generate SAS upload URL for direct-to-blob upload
  generateUploadUrl(extension: string): Observable<{ uploadUrl: string; blobUrl: string }> {
    const url = `${environment.apiUrl}/VideoUpload/generate-upload-url`;
    return this.http.post<{ uploadUrl: string; blobUrl: string }>(url, { extension });
  }

  // Upload directly to blob using fetch (no Azure SDK needed)
  uploadToBlob(
    uploadUrl: string,
    file: File,
    onProgress: (percent: number, uploadedMB: number, speedMbps: number) => void
  ): Observable<void> {
    return new Observable(observer => {
      const startTime = Date.now();
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('x-ms-blob-type', 'BlockBlob');
      xhr.setRequestHeader('Content-Type', file.type || 'video/mp4');
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          const percent = Math.round((ev.loaded / ev.total) * 100);
          const uploadedMB = +(ev.loaded / 1024 / 1024).toFixed(1);
          const elapsedSec = (Date.now() - startTime) / 1000;
          const speedMbps = elapsedSec > 0 ? +((ev.loaded / 1024 / 1024) / elapsedSec).toFixed(1) : 0;
          onProgress(percent, uploadedMB, speedMbps);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) { observer.next(); observer.complete(); }
        else { observer.error(new Error(`Upload failed with status ${xhr.status}`)); }
      };
      xhr.onerror = () => observer.error(new Error('Network error during upload'));
      xhr.send(file);
    });
  }

  // Save video metadata after blob upload
  saveVideoMetadata(payload: any): Observable<any> {
    const url = `${environment.apiUrl}/VideoUpload/uploadVideo`;
    return this.http.post<any>(url, payload);
  }

  // Get teacher videos
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/VideoUpload/teacherVideos/{teacherId}
  getTeacherVideos(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/VideoUpload/teacherVideos/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get video by ID (with full video data)
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/VideoUpload/video/{videoId}
  getVideoById(videoId: string): Observable<any> {
    const url = `${environment.apiUrl}/VideoUpload/video/${videoId}`;
    return this.http.get<any>(url);
  }

  // Get teacher schedule
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/TeachersSchedule/teacherSchedule/{teacherId}
  getTeacherSchedule(teacherId: string): Observable<any[]> {
    const url = `${this.teacherScheduleUrl}/teacherSchedule/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get teacher students
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School/teacherSubject/{teacherId}
  getTeacherStudents(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/School/teacherSubject/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Submit student attendance - sends one record at a time
  // POST /api/StudentAcademicAttendance/studentAttendance
  submitAttendance(payload: any[]): Observable<any> {
    const url = `${environment.apiUrl}/StudentAcademicAttendance/studentAttendance`;
    return forkJoin(payload.map(record => this.http.post<any>(url, record)));
  }

  // Get teacher dashboard attendance overview
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Attendance/teacheDashboard/{teacherId}
  getTeacherDashboardAttendance(teacherId: string): Observable<any> {
    const url = `${environment.apiUrl}/Attendance/teacheDashboard/${teacherId}`;
    return this.http.get<any>(url);
  }
}
