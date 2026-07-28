import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SchoolsService } from './schools.service';
import { environment } from '../../../environments/environment';

describe('SchoolsService', () => {
  let service: SchoolsService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/School`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SchoolsService]
    });
    service = TestBed.inject(SchoolsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('createTeacher should POST FormData to /School/teacher', () => {
    const teacherData = {
      firstName: 'John',
      lastName: 'Doe',
      teacherEmail: 'john@school.com',
      teacherProfilePicture: '',
      isDeleted: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationSetupId: 'org-123'
    };
    service.createTeacher(teacherData).subscribe();
    const req = httpMock.expectOne(`${base}/teacher`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush({ teacherId: 'new-teacher-id' });
  });

  it('createTeacher should append formFileTeacherProfilePicture when file provided', () => {
    const teacherData = {
      firstName: 'Jane',
      lastName: 'Smith',
      teacherEmail: 'jane@school.com',
      teacherProfilePicture: '',
      isDeleted: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationSetupId: 'org-123'
    };
    const mockFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    service.createTeacher(teacherData, mockFile).subscribe();
    const req = httpMock.expectOne(`${base}/teacher`);
    expect(req.request.method).toBe('POST');
    const formData = req.request.body as FormData;
    expect(formData.get('formFileTeacherProfilePicture')).toBeTruthy();
    req.flush({ teacherId: 'new-teacher-id' });
  });

  it('createStudent should POST FormData to /School/student', () => {
    const studentData = {
      firstName: 'Alice',
      lastName: 'Brown',
      studentEmail: 'alice@school.com',
      password: 'Pass123!',
      dateOfBirth: new Date('2005-01-01'),
      gender: 'Female',
      studentProfilePicture: '',
      isDeleted: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationSetupId: 'org-123',
      registrationLinkId: '00000000-0000-0000-0000-000000000000'
    };
    service.createStudent(studentData).subscribe();
    const req = httpMock.expectOne(`${base}/student`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush('Student created');
  });
});
