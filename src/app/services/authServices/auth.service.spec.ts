import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/Auth`;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getToken should return null when not logged in', () => {
    expect(service.getToken()).toBeNull();
  });

  it('isAuthenticated should return false when not logged in', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('logout should clear currentUser from localStorage', () => {
    localStorage.setItem('currentUser', JSON.stringify({ email: 'test@test.com', token: 'abc', expiration: new Date() }));
    service.logout();
    expect(localStorage.getItem('currentUser')).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('getUserProfile should return null when not logged in', () => {
    expect(service.getUserProfile()).toBeNull();
  });

  it('setRoleTableId should store id in localStorage', () => {
    localStorage.setItem('userProfile', JSON.stringify({ email: 'test@test.com', role: 'teacher' }));
    service.setRoleTableId('role-table-123');
    expect(localStorage.getItem('roleTableId')).toBe('role-table-123');
  });

  it('getRoleTableId should return stored id', () => {
    localStorage.setItem('roleTableId', 'role-table-456');
    expect(service.getRoleTableId()).toBe('role-table-456');
  });

  it('forgetPassword should POST to forgot-password endpoint', () => {
    const payload = { email: 'test@school.com' };
    service.forgetPassword(payload).subscribe(res => {
      expect(res).toBe('Reset link sent');
    });
    const req = httpMock.expectOne(`${apiUrl}/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush('Reset link sent');
  });

  it('changePassword should PUT to changepassword endpoint', () => {
    const payload = { currentPassword: 'old', newPassword: 'new123!', email: 'test@school.com' };
    service.changePassword(payload).subscribe(res => {
      expect(res).toBeTruthy();
    });
    const req = httpMock.expectOne(`${apiUrl}/changepassword`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush('Password changed');
  });

  it('confirmEmail should PUT to confirm-email endpoint', () => {
    service.confirmEmail('user-1', 'token-abc').subscribe();
    const req = httpMock.expectOne(r => r.url.includes('/Auth/confirm-email'));
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true });
  });
});
