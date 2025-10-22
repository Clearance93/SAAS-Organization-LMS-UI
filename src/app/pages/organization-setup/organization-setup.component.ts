import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrganizationType, ServiceType, ServiceDuration } from '../../features/organization/models/organization.enums';
import { CreateOrganizationDto } from '../../features/organization/models/organization.interface';
import { OrganizationService } from '../../services/organization.service';
import { finalize } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organization-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './organization-setup.component.html',
  styleUrls: ['./organization-setup.component.css']
})
export class OrganizationSetupComponent implements OnInit {
  organizationForm!: FormGroup;
  submitted = false;
  loading= false;
  errorMessage = ''

  organizationTypes = Object.values(OrganizationType);
  serviceTypes = Object.values(ServiceType);
  serviceDurations = [
    { value: ServiceDuration.ONE_MONTH, label: '1 Month' },
    { value: ServiceDuration.THREE_MONTHS, label: '3 Months' },
    { value: ServiceDuration.SIX_MONTHS, label: '6 Months' },
    { value: ServiceDuration.ONE_YEAR, label: '1 Year' },
    { value: ServiceDuration.TWO_YEARS, label: '2 Years' },
    { value: ServiceDuration.THREE_YEARS, label: '3 Years' },
    { value: ServiceDuration.FOUR_YEARS, label: '4 Years' },
    { value: ServiceDuration.FIVE_YEARS, label: '5 Years'},
    { value: ServiceDuration.FIVE_PLUS, label: '5+ Years'}
  ];

  constructor(
    private formBuilder: FormBuilder,
    private organizationService: OrganizationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.organizationForm = this.formBuilder.group({
      organizationName: ['', [Validators.required, Validators.minLength(3)]],
      organizationType: ['', Validators.required],
      organizationAddress: ['', [Validators.required, Validators.minLength(10)]],
      organizationContactNumber: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      website: ['', [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]],
      serviceDuration: ['', Validators.required],
      serviceType: [[], Validators.required],
      adminEmail: ['', [Validators.email]]
    });
  }

  get f() {
    return this.organizationForm.controls;
  }

  onServiceTypeChange(serviceType: ServiceType, event: any): void {
    const serviceTypeArray: ServiceType[] = this.organizationForm.get('serviceType')?.value || [];
    
    if (event.target.checked) {
      if (!serviceTypeArray.includes(serviceType)) {
        serviceTypeArray.push(serviceType);
      }
    } else {
      const index = serviceTypeArray.indexOf(serviceType);
      if (index > -1) {
        serviceTypeArray.splice(index, 1);
      }
    }
    
    this.organizationForm.patchValue({ serviceType: serviceTypeArray });
  }

  isServiceTypeSelected(serviceType: ServiceType): boolean {
    const serviceTypeArray: ServiceType[] = this.organizationForm.get('serviceType')?.value || [];
    return serviceTypeArray.includes(serviceType);
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.organizationForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    this.loading = true;

    const formValue = this.organizationForm.value;
    const formData: CreateOrganizationDto = {
      organizationName: formValue.organizationName,
      organizationType: formValue.organizationType,
      organizationAddress: formValue.organizationAddress,
      organizationContactNumber: formValue.organizationContactNumber,
      website: formValue.website,
      serviceDuration: formValue.serviceDuration,
      serviceType: formValue.serviceType,
      adminEmail: formValue.adminEmail,
      
    };

    console.debug('[OrganizationSetup] Sending DTO:', formData);

    this.organizationService.createOrganization(formData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response: any) => {
            console.log('Organization was successfully added in our database', response);
            this.router.navigate(['/thank-you'])
          },
          error: (error: any) => {
            console.error('Error sending the data', error)
            this.handleOrganizationError(error, formData);
          }
        })
  }
  handleOrganizationError(error: any, formData: CreateOrganizationDto) {
    var email = formData.adminEmail;

    if (error.error?.errorMessage) {
      this.errorMessage = error.error.errorMessage;
    }
    else if (error.error) {
      this.errorMessage = typeof error.error === 'string'
        ? error.error
        : 'Organization failed to be created please try again'
    }
    else if (error.status === 400) {
      this.errorMessage = 'Invalid organization data. please check the data you provided and try again';
    }
    else if (error.status === 500) {
      this.errorMessage = 'Unable to connect to the server, Please check your internet connection';
    }
    else {
      this.errorMessage = 'An unexpected error occured. Please try again later'
    }
  }

  onReset(): void {
    this.submitted = false;
    this.organizationForm.reset();
  }

  onCancel(): void {
    console.log('Cancel clicked');
  }
}