import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StudentDashboardService } from './student-dashboard.service';
import { environment } from '../../../environments/environment';

describe('StudentDashboardService', () => {
  let service: StudentDashboardService;
  let httpMock: HttpTestingController;
  const base = environment.apiUrl;
  const studentId = 'student-123';
  const orgId = 'org-456';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [StudentDashboardService]
    });
    service = TestBed.inject(StudentDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getStudentDashboard should GET correct URL', () => {
    service.getStudentDashboard(orgId, studentId).subscribe();
    const req = httpMock.expectOne(`${base}/SchoolDashboards/dashboard/${orgId}/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getStudentDashboardData should GET correct URL', () => {
    service.getStudentDashboardData(studentId).subscribe();
    const req = httpMock.expectOne(`${base}/SchoolDashboards/studentDashboard/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getStudentAssignments should GET correct URL', () => {
    service.getStudentAssignments(studentId).subscribe();
    const req = httpMock.expectOne(`${base}/Assingment/getStudentAssignments/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getStudentSubjects should GET correct URL', () => {
    service.getStudentSubjects(studentId).subscribe();
    const req = httpMock.expectOne(`${base}/School/allStudentSubjectById/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('submitStudentAssignment should POST to correct URL', () => {
    const payload = { assignmentId: 'a1', studentId, assignmentPdfSubmission: 'base64' };
    service.submitStudentAssignment(payload).subscribe();
    const req = httpMock.expectOne(`${base}/Assingment/assignmentSubmission`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(true);
  });

  it('getStudentAttendanceRecords should GET correct URL', () => {
    service.getStudentAttendanceRecords(studentId).subscribe();
    const req = httpMock.expectOne(`${base}/Attendance/studentAttendance/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getOrganizationEvents should GET correct URL', () => {
    service.getOrganizationEvents(orgId).subscribe();
    const req = httpMock.expectOne(`${base}/OrganizationActivities/allEvents/${orgId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getStudentVideos should GET correct URL', () => {
    service.getStudentVideos(studentId).subscribe();
    const req = httpMock.expectOne(`${base}/VideoUpload/studentVideos/${studentId}`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('addStudentSubject should POST to correct URL', () => {
    const payload = { studentId, subject: 'Math' };
    service.addStudentSubject(payload).subscribe();
    const req = httpMock.expectOne(`${base}/School/addStudentSubject`);
    expect(req.request.method).toBe('POST');
    req.flush(true);
  });
});
