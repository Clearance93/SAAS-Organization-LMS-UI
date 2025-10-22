import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationSetupComponent } from './organization-setup.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('OrganizationSetupComponent', () => {
  let component: OrganizationSetupComponent;
  let fixture: ComponentFixture<OrganizationSetupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        OrganizationSetupComponent,
         HttpClientTestingModule,
          RouterTestingModule,
          ReactiveFormsModule
        ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizationSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
