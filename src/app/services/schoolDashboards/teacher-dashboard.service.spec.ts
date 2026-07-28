import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherDashboardService } from './teacher-dashboard.service';
import { environment } from '../../../environments/environment';

describe('TeacherDashboardService', () => {
  let service: TeacherDashboardService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;
  const teacherId = 'teacher-123';
  const orgId = 'org-456';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherDashboardService]
    });
    service = TestBed.inject(TeacherDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTeacherDashboard should GET correct URL', () => {
    service.getTeacherDashboard(orgId, teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/SchoolDashboards/teacherDashboard/${orgId}/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTeacherByEmail should GET correct URL', () => {
    const email = 'teacher@school.com';
    service.getTeacherByEmail(email).subscribe();
    const req = httpMock.expectOne(`${base}/School/getTeacherByEmail/${email}`);
    expect(req.request.method).toBe('GET');
    req.flush({ teacherId, firstName: 'John', lastName: 'Doe' });
  });

  it('getTeacherAssignments should GET correct URL', () => {
    service.getTeacherAssignments(teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/Assingment/getTeacherAssignments/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTeacherStudents should GET correct URL', () => {
    service.getTeacherStudents(teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/School/teacherSubject/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTeacherSubjectsWithGrades should GET correct URL', () => {
    service.getTeacherSubjectsWithGrades(teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/TeachersSchedule/teacherSubjestGrade/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTeacherVideos should GET correct URL', () => {
    service.getTeacherVideos(teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/VideoUpload/teacherVideos/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('createAssignment should POST FormData to correct URL', () => {
    const payload = { organizationId: orgId, teacherId, assignmentTitle: 'Test', assignmentDescription: 'Desc', dueDate: '2026-01-01', assignmentMarks: 100, gradeStreamId: 'gs-1', assignmentSubject: 'Math' };
    service.createAssignment(payload).subscribe();
    const req = httpMock.expectOne(`${base}/Assingment/createAssignment`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(true);
  });

  it('submitAttendance should POST one record per student', () => {
    const payload = [
      { studentAttendanceId: '00000000-0000-0000-0000-000000000000', organizationId: orgId, studentId: 's1', presentCount: 1, absentCount: 0, lateCount: 0, termAttendanceOverview: 0 },
      { studentAttendanceId: '00000000-0000-0000-0000-000000000000', organizationId: orgId, studentId: 's2', presentCount: 0, absentCount: 1, lateCount: 0, termAttendanceOverview: 0 }
    ];
    service.submitAttendance(payload).subscribe();
    const reqs = httpMock.match(`${base}/StudentAcademicAttendance/studentAttendance`);
    expect(reqs.length).toBe(2);
    reqs.forEach(r => { expect(r.request.method).toBe('POST'); r.flush(true); });
  });

  it('updateTeacherProfile should PUT to correct URL', () => {
    const updateData = { firstName: 'Jane', lastName: 'Smith' };
    service.updateTeacherProfile(teacherId, updateData).subscribe();
    const req = httpMock.expectOne(`${base}/School/update-teacher/${teacherId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);
    req.flush(true);
  });

  it('getTeacherDashboardAttendance should GET correct URL', () => {
    service.getTeacherDashboardAttendance(teacherId).subscribe();
    const req = httpMock.expectOne(`${base}/Attendance/teacheDashboard/${teacherId}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
