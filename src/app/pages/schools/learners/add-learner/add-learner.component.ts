import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolsService } from '../../../../services/schoolServices/schools.service';
import { CreateLearnerDto } from '../../../../interfaces/schools/learners/create-learner-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-learner',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-learner.component.html',
  styleUrl: './add-learner.component.css'
})
export class AddLearnerComponent implements OnInit{
  learnersForm!: FormGroup
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  organizationId = '';
  previewImage: string | null = null

  constructor (
    private fb: FormBuilder,
    private schoolService: SchoolsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadingOrganizationId()
  }

  initializeForm(): void {
    this.learnersForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      learnerEmail: ['', [Validators.required, Validators.email]],
      learnerProfilePicture: [''],
      isActive: [true]
    })
  }

  loadingOrganizationId(): void {
    const storeProfile = localStorage.getItem('adminProfile');
      if (storeProfile) {
        try{
          const profile = JSON.parse(storeProfile);
          this.organizationId = profile.organizationId || ''
        }
        catch (error) {
          console.error('Error loading organization ID:', error)
        }
      }
  }

  onSubmit(): void {
    if (this.learnersForm.invalid) {
      this.markFormGroupTouched(this.learnersForm);
      return;
    }

    if (!this.organizationId) {
      this.errorMessage = 'Organization Id not found. Please log in again'
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = ''

    const formValue = this.learnersForm.value;
    const now = new Date();

    const learnerDto: CreateLearnerDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      learnerEmail: formValue.learnerEmail.trim().toLowerCase(),
      learnerProfilePicture: formValue.learnerProfilePicture || '',
      isDeleted: false,
      isActive: formValue.isActive,
      createdAt: now,
      updatedAt: now,
      organizationSetupId: this.organizationId
    }

    this.schoolService.createLearner(learnerDto).subscribe({
      next: (response) => {
        this.successMessage = "Learner added successfully.";
        this.isSubmitting = false;

        setTimeout(() => {
          this.learnersForm.reset({
            isActive: true
          })
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to add learner please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if(input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image.';
        return;
      }

      if (file.size > 5 * 1024 * 1024 ){
        this.errorMessage = 'Image size must be less than 5MB.';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewImage = e.target?.result as string;
        this.learnersForm.patchValue({
          learnerProfilePicture: this.previewImage
        });
      };

      reader.readAsDataURL(file)
    }
  }

  removeImage(): void {
    this.previewImage = null;
    this.learnersForm.patchValue({
      learnerProfilePicture: ''
    });
  }

  onCancel(): void {
    this.router.navigate(['/school-admin-dashboard'], {
      queryParams: {
        organizationId: this.organizationId
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  hasError(fileName: string, errorType?: string): boolean {
    const field = this.learnersForm.get(fileName);

    if (!field) {
      return false;
    }

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.learnersForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`
    }

    if (field.errors['email']) {
      return 'please enter a valid email address.';
    }

    if (field.errors['minLength']) {
      const minLength = field.errors['minLength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must bet at least ${minLength} characters`;
    }

    return 'Invalid input'
  }

  getFieldLabel(fieldName: string) {
    const labels: {
      [key: string]: string
    } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      learnerEmail: 'Email'
    };

    return labels[fieldName] || fieldName
  }
}
