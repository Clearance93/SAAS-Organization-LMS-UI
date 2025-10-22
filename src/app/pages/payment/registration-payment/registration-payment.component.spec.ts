import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPaymentComponent } from './registration-payment.component';

describe('RegistrationPaymentComponent', () => {
  let component: RegistrationPaymentComponent;
  let fixture: ComponentFixture<RegistrationPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrationPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrationPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
