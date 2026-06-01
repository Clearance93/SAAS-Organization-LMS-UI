import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../../../services/settings/settings.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

interface Grade {
  gradeId: string;
  gradeName: string;
  gradeLevel: string;
}

@Component({
  selector: 'app-add-school-subject',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-school-subject.component.html',
  styleUrl: './add-school-subject.component.css'
})
export class AddSchoolSubjectComponent implements OnInit {
  subjectForm!: FormGroup;
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string = '';
  organizationId: string = 'AB3B79E8-100B-448B-8258-F330B36A0937';
  grades: Grade[] = [];
  loadingGrades: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private settingsService: SettingsService,
    private http: HttpClient
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.organizationId = this.getOrganizationId();
    this.loadGrades();
  }

  initializeForm(): void {
    this.subjectForm = this.fb.group({
      subjectName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      gradeId: ['', [Validators.required]]
    });
  }

  getOrganizationId(): string {
    // First try to get from route params
    const routeOrgId = this.route.snapshot.queryParams['organizationId'];
    if (routeOrgId) {
      return routeOrgId;
    }

    // Then try localStorage
    if (typeof window !== 'undefined' && localStorage) {
      const storedOrgId = localStorage.getItem('organizationId');
      if (storedOrgId) {
        return storedOrgId;
      }
    }

    // Use fallback ID if none found
    console.warn('No organization ID found, using fallback');
    return this.organizationId;
  }

  loadGrades(): void {
    this.loadingGrades = true;
    const url = `${environment.apiUrl}/Settings/getAllGrades/${this.organizationId}`;
    
    this.http.get<any>(url).subscribe({
      next: (response) => {
        this.grades = response || [];
        this.loadingGrades = false;
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.loadingGrades = false;
        this.submitError = 'Failed to load grades. Please try again.';
      }
    });
  }

  onSubmit(): void {
    if (this.subjectForm.invalid) {
      this.markFormGroupTouched(this.subjectForm);
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';
    this.submitSuccess = false;

    const selectedGrade = this.grades.find(g => g.gradeId === this.subjectForm.value.gradeId);
    
    const subjectPayload = {
      subjectName: this.subjectForm.value.subjectName.trim(),
      gradeLevel: selectedGrade?.gradeLevel || '',
      gradeId: this.subjectForm.value.gradeId,
      organizationId: this.organizationId
    };

    console.log('Submitting subject:', subjectPayload);

    const url = `${environment.apiUrl}/Settings/addSchoolSubject`;
    this.http.post(url, subjectPayload).subscribe({
      next: (response) => {
        console.log('Subject added successfully:', response);
        this.submitSuccess = true;
        this.isSubmitting = false;
        this.subjectForm.reset();
        
        setTimeout(() => {
          this.router.navigate(['/admin-settings']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error adding subject:', error);
        this.submitError = error.error?.message || 'Failed to add subject. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin-settings']);
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