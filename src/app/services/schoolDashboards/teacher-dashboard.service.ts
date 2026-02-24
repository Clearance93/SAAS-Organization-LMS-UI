import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StreamResponse, ClassScheduleDto } from '../../interfaces/class-schedule';
import { AssignmentDto } from '../../interfaces/assignment';

@Injectable({
  providedIn: 'root'
})
export class TeacherDashboardService {
  private apiUrl = 'https://localhost:7270/api/SchoolDashboards';
  private teacherScheduleUrl = 'https://localhost:7270/api/TeachersSchedule';
  private assignmentUrl = 'https://localhost:7270/api/Assingment/createAssignment';

  constructor(private http: HttpClient) { }

  getTeacherDashboard(organizationId: string, teacherId: string): Observable<any> {
    const url = `${this.apiUrl}/teacherDashboard/${organizationId}/${teacherId}`;
    console.log('TeacherDashboardService.getTeacherDashboard - URL:', url);
    console.log('TeacherDashboardService.getTeacherDashboard - organizationId:', organizationId, 'teacherId:', teacherId);
    return this.http.get<any>(url);
  }

  // Fetch all streams for a teacher.
  // Uses: GET https://localhost:7270/api/TeachersSchedule/getAllStreams/{teacherId}
  getAllStreams(teacherId: string): Observable<StreamResponse[]> {
    const url = `${this.teacherScheduleUrl}/getAllStreams/${teacherId}`;
    return this.http.get<StreamResponse[]>(url);
  }

  // Create a new class schedule
  // POST https://localhost:7270/api/TeachersSchedule/classSchedule
  createClassSchedule(payload: ClassScheduleDto, streamName: string): Observable<any> {
    const url = `${this.teacherScheduleUrl}/classSchedule`;
    return this.http.post<any>(url, payload);
  }

  // Create a new assignment
  // POST https://localhost:7270/api/Assingment/createAssignment
  createAssignment(payload: any): Observable<any> {
    const url = this.assignmentUrl;
    return this.http.post<any>(url, payload);
  }

  // Get teacher assignments
  // GET https://localhost:7270/api/Assingment/getTeacherAssignments/{teacherId}
  getTeacherAssignments(teacherId: string): Observable<AssignmentDto[]> {
    const url = `https://localhost:7270/api/Assingment/getTeacherAssignments/${teacherId}`;
    return this.http.get<AssignmentDto[]>(url);
  }

  // Get all submitted assignments for teacher
  // GET https://localhost:7270/api/Assingment/getAllTeacherAssignments/{teacherId}
  // DEPRECATED - Use getAllTeacherAssignmentSubmissions instead
  getAllTeacherSubmittedAssignments(teacherId: string): Observable<any[]> {
    const url = `https://localhost:7270/api/Assingment/getAllTeacherAssignments/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get all teacher performance
  // GET https://localhost:7270/api/ClassPerformance/getAllTeacherPerformance/{teacherId}
  getAllTeacherPerformance(teacherId: string): Observable<any[]> {
    const url = `https://localhost:7270/api/ClassPerformance/getAllTeacherPerformance/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get teacher by email
  // GET https://localhost:7270/api/School/getTeacherByEmail/{teacherEmail}
  getTeacherByEmail(teacherEmail: string): Observable<any> {
    const url = `https://localhost:7270/api/School/getTeacherByEmail/${teacherEmail}`;
    return this.http.get<any>(url);
  }

  // Update teacher profile
  // PUT https://localhost:7270/api/School/update-teacher/{teacherId}
  updateTeacherProfile(teacherId: string, payload: any): Observable<any> {
    const url = `https://localhost:7270/api/School/update-teacher/${teacherId}`;
    return this.http.put<any>(url, payload);
  }

  // Get teacher subjects with grades
  // GET https://localhost:7270/api/TeachersSchedule/teacherSubjestGrade/{teacherId}
  getTeacherSubjectsWithGrades(teacherId: string): Observable<any[]> {
    const url = `${this.teacherScheduleUrl}/teacherSubjestGrade/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get upcoming sessions by role
  // GET https://localhost:7270/api/MeetingsUrl/upcommingSession/{role}
  getUpcomingSessionsByRole(role: string): Observable<any[]> {
    const url = `https://localhost:7270/api/MeetingsUrl/upcommingSession/${role}`;
    return this.http.get<any[]>(url);
  }

  // Get all teacher assignment submissions (with PDF data)
  // GET https://localhost:7270/api/Assingment/getAllTeacherAssignSubm/{teacherId}
  getAllTeacherAssignmentSubmissions(teacherId: string): Observable<any[]> {
    const url = `https://localhost:7270/api/Assingment/getAllTeacherAssignSubm/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get submission details including PDF
  // GET https://localhost:7270/api/Assingment/submissionAssignment/{assignmentSubmissionId}
  getSubmissionDetails(assignmentSubmissionId: string): Observable<any> {
    const url = `https://localhost:7270/api/Assingment/submissionAssignment/${assignmentSubmissionId}`;
    return this.http.get<any>(url);
  }

  // Submit assignment grade
  // POST https://localhost:7270/api/Assingment/addAssignmentGrades
  submitAssignmentGrade(payload: any): Observable<any> {
    const url = 'https://localhost:7270/api/Assingment/addAssignmentGrades';
    return this.http.post<any>(url, payload);
  }

  // Get AI grade assistance
  // POST https://localhost:7270/api/AIAssistance/aiGradeAssistance
  getAiGradeAssistance(assignmentId: string, studentId: string): Observable<any> {
    const url = `https://localhost:7270/api/AIAssistance/aiGradeAssistance?assignmentId=${assignmentId}&studentId=${studentId}`;
    return this.http.post<any>(url, {});
  }

  // Get plagiarism result
  // GET https://localhost:7270/api/AIAssistance/getPlagiarismResult
  getPlagiarismResult(assignmentId: string, studentId: string): Observable<any> {
    const url = `https://localhost:7270/api/AIAssistance/getPlagiarismResult?assignmentId=${assignmentId}&studentId=${studentId}`;
    return this.http.get<any>(url);
  }

  // Upload video
  // POST https://localhost:7270/api/VideoUpload/uploadVideo
  uploadVideo(payload: any): Observable<any> {
    const url = 'https://localhost:7270/api/VideoUpload/uploadVideo';
    return this.http.post<any>(url, payload);
  }

  // Get teacher videos
  // GET https://localhost:7270/api/VideoUpload/teacherVideos/{teacherId}
  getTeacherVideos(teacherId: string): Observable<any[]> {
    const url = `https://localhost:7270/api/VideoUpload/teacherVideos/${teacherId}`;
    return this.http.get<any[]>(url);
  }

  // Get video by ID (with full video data)
  // GET https://localhost:7270/api/VideoUpload/video/{videoId}
  getVideoById(videoId: string): Observable<any> {
    const url = `https://localhost:7270/api/VideoUpload/video/${videoId}`;
    return this.http.get<any>(url);
  }

  // Get teacher schedule
  // GET https://localhost:7270/api/TeachersSchedule/teacherSchedule/{teacherId}
  getTeacherSchedule(teacherId: string): Observable<any[]> {
    const url = `${this.teacherScheduleUrl}/teacherSchedule/${teacherId}`;
    return this.http.get<any[]>(url);
  }
}