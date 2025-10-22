import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';

interface ForgetPasswordRequest {
  email: string;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should post forget-password and return response', () => {
    const payload: ForgetPasswordRequest = { email: 'clearancemorumudi@thutonet.co.za' };
    const mockResponse = 'Password reset link sent to email';

    service.forgetPassword(payload).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    // The service builds the full URL using its private apiUrl; match that path
    const req = httpMock.expectOne(`${(service as any)['apiUrl']}/forgot-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    // flush plain text response (server returns text)
    req.flush(mockResponse);
  })

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
