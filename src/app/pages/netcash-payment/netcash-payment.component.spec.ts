import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { NetcashPaymentComponent } from './netcash-payment.component';

describe('NetcashPaymentComponent', () => {
  let component: NetcashPaymentComponent;
  let fixture: ComponentFixture<NetcashPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NetcashPaymentComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetcashPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
