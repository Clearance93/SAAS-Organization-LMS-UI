import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SchoolsService } from '../../../../services/schoolServices/schools.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateStuffMemberDto } from '../../../../interfaces/schools/stuff-members/create-stuff-member-dto';

@Component({
  selector: 'app-add-stuff-member',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-stuff-member.component.html',
  styleUrl: './add-stuff-member.component.css'
})
export class AddStuffMemberComponent implements OnInit{
  stuffMemberForm!: FormGroup
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  organizationId = '';
  previousImage: string | null = null
  constructor(
    private fb: FormBuilder,
    private schoolService: SchoolsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadingOrganizationId()
  }

  initializeForm(): void {
  this.stuffMemberForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(3)]],
    lastName: ['', [Validators.required, Validators.minLength(3)]],
    stuffMemberEmail: ['', [Validators.required, Validators.email]],
    stuffMemberPosition: ['', [Validators.required]],
    stuffMemberProfilePicture: [''],
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
  if (this.stuffMemberForm.invalid) {
    this.markFormGroupTouched(this.stuffMemberForm);
    this.errorMessage = 'Please fill in all required fields correctly.';
    return;
  }

  if (!this.organizationId) {
    this.errorMessage = 'Organization Id not found. Please log in again.';
    return;
  }

  this.isSubmitting = true;
  this.errorMessage = '';
  this.successMessage = '';

  const formValue = this.stuffMemberForm.value;
  const now = new Date();

  const stuffMemberDto: CreateStuffMemberDto = {
    firstName: formValue.firstName.trim(),
    lastName: formValue.lastName.trim(),
    stuffMemberEmail: formValue.stuffMemberEmail.trim().toLowerCase(),
    stuffMemberProfilePicture: formValue.stuffMemberProfilePicture || '',
    stuffMemberPosition: formValue.stuffMemberPosition.trim(),
    isDeleted: false,
    isActive: formValue.isActive,
    createdAt: now,
    updatedAt: now,
    organizationSetupId: this.organizationId
  };

  this.schoolService.createStuffMember(stuffMemberDto).subscribe({
    next: () => {
      this.successMessage = 'Stuff Member added Successfully.';
      this.isSubmitting = false;

      setTimeout(() => {
        this.stuffMemberForm.reset({
          isActive: true
        });
        this.previousImage = null;
      }, 2000);
    },
    error: (error) => {
      this.errorMessage = error.error?.message || error.message || 'Failed to add stuff Member. Please try again';
      this.isSubmitting = false;
    }
  });
}

  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please select a valid image file';
        return;
      }

      if (file.size > 5 *1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB'
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previousImage = e.target?.result as string;
        this.stuffMemberForm.patchValue({
          stuffMemberProfilePicture: this.previousImage
        });
      };

      reader.readAsDataURL(file)
    }
  }

  removeImage(): void {
    this.previousImage = null;
    this.stuffMemberForm.patchValue({
      stuffMemberProfilePicture: ''
    });
  }

  onCancel(): void {
    this.router.navigate(['/school-admin-dashboard'], {
      queryParams: {
        organizationId: this.organizationId
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

  hasError(fileName: string, errorType?: string): boolean {
    const field = this.stuffMemberForm.get(fileName);

    if (!field) {
      return false
    }

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.stuffMemberForm.get(fieldName);

    if (!field || !field.errors) {
      return ''
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (field.errors['minLength']) {
      const minLength = field.errors['minLength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characts`;
    }

    return 'Invalid input'
  }

  getFieldLabel(fieldName: string) {
    const labels: { [key: string]: string} = {
      firstName: 'First Name',
      lastName: 'Last Name',
      stuffMemberEmail: 'Email'
    };

    return labels[fieldName] || fieldName
  }
}
