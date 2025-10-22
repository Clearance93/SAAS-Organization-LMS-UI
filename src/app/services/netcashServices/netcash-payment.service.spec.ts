import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { NetcashPaymentService } from './netcash-payment.service';

describe('NetcashPaymentService', () => {
  let service: NetcashPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(NetcashPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
