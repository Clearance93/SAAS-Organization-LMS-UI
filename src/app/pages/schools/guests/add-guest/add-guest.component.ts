import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolsService } from '../../../../services/schoolServices/schools.service';
import { CreateGuestDto } from '../../../../interfaces/schools/guests/create-guest-dto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-guest',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-guest.component.html',
  styleUrl: './add-guest.component.css'
})
export class AddGuestComponent implements OnInit{
  guestForm!: FormGroup
  isSubmitting = false
  errorMessage = '';
  successMessage = '';
  organizationId = '';
  previewImage: string | null = null

  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadingOrganizationId();
  }

  initializeForm(): void {
    this.guestForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      guestEmail: ['', [Validators.required, Validators.email]],
      guestProfilePicture: [''],
      isActive: [true]
    });
  }

  loadingOrganizationId(): void {
    this.route.queryParams.subscribe(params => {
      console.log("All URL Params");

      if (params['organizationId']) {
        this.organizationId = params['organizationId']
        console.log('organization Id from Ur;:', this.organizationId)
      } else {
        const storeProfile = localStorage.getItem('adminProfile');
    if (storeProfile) {
      try {
        const profile = JSON.parse(storeProfile);
        this.organizationId = profile.organizationId || '';
      }
      catch (error) {
        console.error('Error loading organization Id:', error)
      }
    }
      }
    })
  }

  onSubmit(): void {
    if (this.guestForm.invalid) {
      this.markFormGroupTouched(this.guestForm);
      return;
    }

    if (!this.organizationId) {
      this.errorMessage = 'Organization ID not found. Please log in again'
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = ''

    const formValue = this.guestForm.value;
    const now = new Date();

    const guestDto: CreateGuestDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      guestEmail: formValue.guestEmail.trim().toLowerCase(),
      guestProfilePicture: formValue.guestProfilePicture || '',
      isDeleted: false,
      isActive: formValue.isActive,
      createdAt: now,
      updatedAt: now,
      organizationSetupId: this.organizationId
    };

    this.schoolService.createGuest(guestDto).subscribe({
      next: (response) => {
        this.successMessage = 'Guest added successfully!';
        this.isSubmitting = false;
      }
    });
  }

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image.';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB.';
        return
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewImage = e.target?.result as string;
        this.guestForm.patchValue ({
          guestProfilePicture: this.previewImage
        });
      };

      reader.readAsDataURL(file)
    }
  }

  removeImage(): void {
    this.previewImage = null;
    this.guestForm.patchValue({
      guestProfilePictire: ''
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
    const field = this.guestForm.get(fileName);
    if (!field)
      return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.guestForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`
    }

    if (field.errors['minLength']) {
      const minLength = field.errors['minLength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`
    }

    return 'Invalid input'
  }

  getFieldLabel(fieldName: string) {
    const labels: { [key: string]: string} = {
      firstName: 'First Name',
      lastName: 'Last Name',
      teacherEmail: 'Email'
    }
  }
}
