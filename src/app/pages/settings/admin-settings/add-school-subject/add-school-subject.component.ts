import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../../../services/settings/settings.service';

@Component({
  selector: 'app-add-school-subject',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-school-subject.component.html',
  styleUrl: './add-school-subject.component.css'
})
export class AddSchoolSubjectComponent implements OnInit {
  subjectForm!: FormGroup;
  courseStreamId: string = '';
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string = '';
  organizationId: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.courseStreamId = params['courseStreamId'] || '';
      this.organizationId = params['organizationId'] || this.getOrganizationId();
      
      console.log('Course Stream ID:', this.courseStreamId);
      console.log('Organization ID:', this.organizationId);
      
      if (!this.courseStreamId) {
        this.submitError = 'No course stream specified. Please select a course stream first.';
      }
    });
  }

  initializeForm(): void {
    this.subjectForm = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      gradeLevel: ['', [Validators.required]]
    });
  }

  getOrganizationId(): string {
    if (typeof window !== 'undefined' && localStorage) {
      return localStorage.getItem('organizationId') || '';
    }
    return this.route.snapshot.queryParams['organizationId'] || '';
  }

  onSubmit(): void {
    if (this.subjectForm.invalid || !this.courseStreamId) {
      this.markFormGroupTouched(this.subjectForm);
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const subjectPayload = {
      courseStreamId: this.courseStreamId,
      organizationId: this.organizationId,
      subjectName: this.subjectForm.value.subjectName.trim(),
      gradeLevel: this.subjectForm.value.gradeLevel.trim()
    };

    console.log('Submitting subject:', subjectPayload);

    this.settingsService.addSchoolSubject(subjectPayload).subscribe({
      next: (response) => {
        console.log('Subject added successfully:', response);
        this.submitSuccess = true;
        this.isSubmitting = false;
        
        this.subjectForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/settings/admin-settings/details'], { 
            queryParams: { courseStreamId: this.courseStreamId } 
          }); 
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding subject:', error);
        this.submitError = error.message || 'Failed to add subject. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/details'], { 
      queryParams: { courseStreamId: this.courseStreamId } 
    }); 
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.subjectForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.subjectForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['maxlength']) return `${fieldName} cannot exceed ${field.errors['maxlength'].requiredLength} characters`;
    }
    return '';
  }
}