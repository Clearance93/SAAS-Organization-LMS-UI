import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolsService } from '../../../../services/schoolServices/schools.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateStudentDto } from '../../../../interfaces/schools/students/create-student-dto';
import { AdminDashboardService } from '../../../../services/schoolDashboards/admin-dashboard.service';

@Component({
  selector: 'app-add-student',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css'
})
export class AddStudentComponent implements OnInit {
  studentForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  organizationId = '';
  linkId = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolsService,
    private router: Router,
    private route: ActivatedRoute,
    private adminDashboardService: AdminDashboardService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrganizationId();
  }

  initializeForm(): void {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      studentEmail: ['', [Validators.required, Validators.email]],
      studentProfilePicture: [''],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      isActive: [true]
    });
  }

  loadOrganizationId(): void {
    this.route.queryParams.subscribe(params => {
      if (params['organizationId']) {
        let orgId = params['organizationId'];
        if (orgId.includes('?')) {
          orgId = orgId.split('?')[0];
        }
        this.organizationId = orgId;
      } else {
        const storeProfile = localStorage.getItem('adminProfile');
        if (storeProfile) {
          try {
            const profile = JSON.parse(storeProfile);
            this.organizationId = profile.organizationId || '';
          } catch (error) {
            console.error('Error loading organization Id:', error);
          }
        }
      }

      if (params['linkId']) {
        this.linkId = params['linkId'];
      }

      if (!this.organizationId) {
        this.errorMessage = 'Organization ID not found. Please ensure you accessed this page correctly.';
      } else {
        this.errorMessage = '';
      }
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.markFormGroupTouched(this.studentForm);
      return;
    }

    if (!this.organizationId) {
      this.errorMessage = 'Organization ID not found. Please log in again';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.studentForm.value;
    const now = new Date();

    const studentDto: CreateStudentDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      studentEmail: formValue.studentEmail.trim().toLowerCase(),
      password: '', // Empty string - API will auto-generate
      studentProfilePicture: formValue.studentProfilePicture || '',
      dateOfBirth: new Date(formValue.dateOfBirth),
      gender: formValue.gender,
      isDeleted: false,
      isActive: formValue.isActive,
      createdAt: now,
      updatedAt: now,
      organizationSetupId: this.organizationId,
      registrationLinkId: this.isValidGuid(this.linkId) ? this.linkId : '00000000-0000-0000-0000-000000000000'
    };

    this.schoolService.createStudent(studentDto, this.selectedFile || undefined).subscribe({
      next: (response) => {
        if (this.linkId && typeof response === 'number') {
          this.adminDashboardService.notifyLinkUsed(this.linkId, response);
        }
        
        this.successMessage = 'Student added successfully.';
        this.isSubmitting = false;

        setTimeout(() => {
          this.studentForm.reset({
            isActive: true
          });
          this.previewImage = null;
        }, 2000);
      },
      error: (error) => {
        if (error.message && error.message.includes('max limit')) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = error.message || 'Failed to add student. Please try again.';
        }
        this.isSubmitting = false;
      }
    });
  }

  private isValidGuid(value: string): boolean {
    if (!value || value.trim() === '') return false;
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(value.trim());
  }

  async onImageSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file.';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB.';
        return;
      }
      this.selectedFile = file;
      this.studentForm.patchValue({ studentProfilePicture: file.name });
      const reader = new FileReader();
      reader.onload = (e) => { this.previewImage = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.previewImage = null;
    this.selectedFile = null;
    this.studentForm.patchValue({ studentProfilePicture: '' });
  }

  onCancel(): void {
    this.router.navigate(['/school-admin-dashboard'], {
      queryParams: {
        organization: this.organizationId
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup<any>) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.studentForm.get(fieldName);

    if (!field) {
      return false;
    }

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.studentForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return 'Invalid input';
  }
  
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      studentEmail: 'Email',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender'
    };

    return labels[fieldName] || fieldName;
  }
}