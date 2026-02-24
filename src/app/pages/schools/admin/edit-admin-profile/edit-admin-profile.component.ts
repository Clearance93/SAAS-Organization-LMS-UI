import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminDashboardService } from '../../../../services/schoolDashboards/admin-dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateAdminDto } from '../../../../interfaces/schools/admin/update-admin-dto';
import { MediaCompressionUtil } from '../../../../utils/media-compression.util';

@Component({
  selector: 'app-edit-admin-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-admin-profile.component.html',
  styleUrl: './edit-admin-profile.component.css'
})
export class EditAdminProfileComponent implements OnInit{

  adminForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  adminId = '';
  organizationId = '';
  adminEmail = '';
  previewImage: string | null = null;
  originalProfilePicture: string | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private adminDashboardService: AdminDashboardService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      adminBusinessEmail: [{ value: '', disabled: true }],
      adminProfilePicture: [''],
      organizationId: [{ value: '', disabled: true }]
    });

    this.loadAdminData();
  }

  loadAdminData(): void {
    this.route.queryParams.subscribe(params => {
      this.adminId = params['adminId'];

      if (!this.adminId) {
        if (isPlatformBrowser(this.platformId)) {
          const storedProfile = localStorage.getItem('adminProfile');
          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              this.adminId = profile.adminId || profile.AdminId;
            }
            catch (error) {
              console.error('Error parsing admin profile:', error);
            }
          }
        }
      }

      if (this.adminId) {
        this.fetchAdminProfile(this.adminId);
      } else {
        this.errorMessage = 'Admin Id not found. please go back to the dashboard'
      }
    })
  }

  fetchAdminProfile(adminId: string) {
    this.adminDashboardService.getAdminById(adminId).subscribe({
      next: (admin) => {
        this.organizationId = admin.organizationSetupId;
        this.adminEmail = admin.adminBusinessEmail;
        
        // Format profile picture with proper base64 prefix
        let formattedPicture = admin.adminProfilePicture;
        if (formattedPicture && !formattedPicture.startsWith('data:')) {
          formattedPicture = `data:image/jpeg;base64,${formattedPicture}`;
        }
        
        this.originalProfilePicture = formattedPicture;
        this.previewImage = formattedPicture;
        
        this.adminForm.patchValue({
          firstName: admin.firstName,
          lastName: admin.lastName,
          adminBusinessEmail: admin.adminBusinessEmail,
          organizationId: admin.organizationSetupId,
          adminProfilePicture: formattedPicture
        });
      },
      error: (error) => {
        this.errorMessage = 'Failed to load admin profile. please try again.';
        console.error('Error loading admin:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.markFormGroupTouched(this.adminForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    if (!this.adminId) {
      this.errorMessage = 'Admin ID not found. Cannot update profile.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.adminForm.getRawValue();
    const now = new Date();

    // Get the profile picture - strip the data URI prefix for API
    let profilePictureForApi = formValue.adminProfilePicture || this.originalProfilePicture || '';
    if (profilePictureForApi && profilePictureForApi.startsWith('data:')) {
      // Extract only the base64 string without the prefix
      const base64Match = profilePictureForApi.match(/,(.+)$/);
      if (base64Match) {
        profilePictureForApi = base64Match[1];
      }
    }

    const updateDto: UpdateAdminDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      adminProfilePicture: profilePictureForApi,
      updatedAt: now
    };

    console.log('Updating admin profile with:', { ...updateDto, adminProfilePicture: 'base64...' });

    this.adminDashboardService.updateAdmin(this.adminId, updateDto).subscribe({
      next: (response) => {
        this.successMessage = 'Profile updated successfully!';
        this.isSubmitting = false;

        // Update localStorage with the full data URI format
        if (isPlatformBrowser(this.platformId)) {
          const storedProfile = localStorage.getItem('adminProfile');

          if (storedProfile) {
            try {
              const profile = JSON.parse(storedProfile);
              profile.firstName = updateDto.firstName;
              profile.lastName = updateDto.lastName;
              // Store with data URI prefix for display
              profile.adminProfilePicture = formValue.adminProfilePicture;
              profile.name = `${updateDto.firstName} ${updateDto.lastName}`;
              localStorage.setItem('adminProfile', JSON.stringify(profile));
            } catch (error) {
              console.error('Error updating localStorage:', error);
            }
          }
        }

        setTimeout(() => {
          this.router.navigate(['/school-admin-dashboard'], {
            queryParams: {
              organizationId: this.organizationId
            }
          });
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || error.message || 'Failed to update profile. Please try again.';
        this.isSubmitting = false;
        console.error('Update error:', error);
      }
    });
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
        this.errorMessage = 'Image size must be less that 5MB.';
        return;
      }

      try {
        // Compress image to reduce base64 size by ~75%
        const compressed = await MediaCompressionUtil.compressImage(file, 300, 0.6);
        this.previewImage = `data:image/jpeg;base64,${compressed}`;
        this.adminForm.patchValue({
          adminProfilePicture: this.previewImage
        });
        this.selectedFile = file;
        this.errorMessage = '';
      } catch (error) {
        console.warn('Image compression failed, using original:', error);
        // Fallback to original if compression fails
        this.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          this.previewImage = e.target?.result as string;
          this.adminForm.patchValue({
            adminProfilePicture: this.previewImage
          });
          this.errorMessage = '';
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(): void {
    this.previewImage = this.originalProfilePicture;
    this.selectedFile = null;
    this.adminForm.patchValue({
      adminProfilePicture: this.originalProfilePicture || ''
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
    const field = this.adminForm.get(fileName);

    if (!field) {
      return false;
    }

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string{
    const field = this.adminForm.get(fieldName);

    if (!field || !field.errors) {
      return '';
    }

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (field.errors['minLength']) {
      const minLength = field.errors['minLength'].requiredLength;

      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return 'Invalid input'
  }

  getFieldLabel(fieldName: string) {
    const labels: {
      [key: string]: string
    } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      adminBusinessEmail: 'Email Address'
    };

    return labels[fieldName] || fieldName
  }
}
