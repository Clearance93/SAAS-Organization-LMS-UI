import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  // Upload video
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/VideoUpload/uploadVideo
  uploadVideo(payload: any): Observable<any> {
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
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/School/teacherStudent/{teacherId}
  getTeacherStudents(teacherId: string): Observable<any[]> {
    const url = `${environment.apiUrl}/School/teacherStudent/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Submit student attendance
  // POST https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Attendance/addStduentAttendance
  submitAttendance(payload: any[]): Observable<any> {
    const url = `${environment.apiUrl}/Attendance/addStduentAttendance`;
    return this.http.post<any>(url, payload);
  }

  // Get teacher dashboard attendance overview
  // GET https://eduhubapi-g8a3atfufkgdfjhn.southafricanorth-01.azurewebsites.net/api/Attendance/teacheDashboard/{teacherId}
  getTeacherDashboardAttendance(teacherId: string): Observable<any> {
    const url = `${environment.apiUrl}/Attendance/teacheDashboard/${teacherId}`;
    return this.http.get<any>(url);
  }
}
