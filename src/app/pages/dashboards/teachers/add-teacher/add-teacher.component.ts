import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TeacherService } from '../../../../services/teacherServices/teacher.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CreateTeacherDto } from '../../../../interfaces/schools/teachers/create-teacher-dto';
import { MatDialog } from '@angular/material/dialog';
import { AddGradeModalComponent } from '../../../modals/add-grade-modal/add-grade-modal.component';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { SchoolsService } from '../../../../services/schoolServices/schools.service';
import { MediaCompressionUtil } from '../../../../utils/media-compression.util';

@Component({
  selector: 'app-add-teacher',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-teacher.component.html',
  styleUrl: './add-teacher.component.css'
})
export class AddTeacherComponent implements OnInit{
  teacherForm!: FormGroup 
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';
  organizationId = '';
  previewImage: string | null = null;
  selectedFile: File | null = null;

  constructor (
   private fb: FormBuilder,
   private teacherService: TeacherService,
   private schoolsService: SchoolsService,
   private router: Router,
   private route: ActivatedRoute,
   public dialog: MatDialog
 ) {}

ngOnInit(): void {
  this.initializeForm();
  this.loadingOrganizationId()
  }

  initializeForm(): void {
    this.teacherForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3)]],
      lastName: ['', [Validators.required, Validators.minLength(3)]],
      teacherEmail: ['', [Validators.required, Validators.email]],
      teacherProfilePicture: [''],
      isActive: [true]
    });
  }

  loadingOrganizationId(): void {
    this.route.queryParams.subscribe(params => {
      console.log('All URL params')

      if (params['organizationId']){
        this.organizationId = params['organizationId'];
        console.log('organization Id from URL:', this.organizationId)
      } else {
        console.log("organizationId not found in the URL params, checking localStorage");
         const storeProfile = localStorage.getItem('adminProfile');
      if (storeProfile) {
        try {
          const profile = JSON.parse(storeProfile);
          this.organizationId = profile.organizationId || '';
        }
        catch (error) {
          console.error('Error loading organization ID:', error)
        }
      }
    }  

    if (!this.organizationId) {
      this.errorMessage = 'Organization Id not found please ensure you accessed this page correctly';
      console.log('No organization Id found in the URL or localStorage');
    } else {
      console.log('Final Organization Id:', this.organizationId);
      this.errorMessage = '';
    }
    })
  }

  onSubmit(): void {
    if (this.teacherForm.invalid) {
      this.markFormGroupTouched(this.teacherForm);
      return;
    }

    if (!this.organizationId) {
      this.errorMessage = 'Organization ID not found. Please log in again.'
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = ''

    const formValue = this.teacherForm.value;
    const now = new Date();

    const teacherDto: CreateTeacherDto = {
      firstName: formValue.firstName.trim(),
      lastName: formValue.lastName.trim(),
      teacherEmail: formValue.teacherEmail.trim().toLowerCase(),
      teacherProfilePicture: formValue.teacherProfilePicture || '',
      isDeleted: false,
      isActive: formValue.isActive,
      createdAt: now,
      updatedAt: now,
      organizationSetupId: this.organizationId
    };

    this.schoolsService.createTeacher(teacherDto, this.selectedFile || undefined).subscribe({
      next: () => {
        this.successMessage = 'Teacher added successfully!';
        this.isSubmitting = false;

        // Show a confirmation modal instructing the user to check email
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          html: 'Teacher registered successfully. A confirmation email with login instructions and the initial password has been sent to the teacher\'s email address — please check the inbox and confirm the account to access the platform.',
          confirmButtonText: 'OK',
          allowOutsideClick: false
        }).then(() => {
          // After user acknowledges, open Add Grade modal and preselect the created teacher's email
          try {
            this.dialog.open(AddGradeModalComponent, {
              width: '500px',
              disableClose: true,
              panelClass: 'custom-dialog-container',
              data: { organizationId: this.organizationId, selectedTeacherEmail: teacherDto.teacherEmail }
            });
          } catch (dialogErr) {
            console.error('Failed to open Add Grade modal:', dialogErr);
          }
        });

        setTimeout(() => {
          this.teacherForm.reset({
            isActive: true
          });
          this.previewImage = null;
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.message || 'Failed to add teacher. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  onImageSelect(event: Event): void {
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
      this.teacherForm.patchValue({ teacherProfilePicture: file.name });
      const reader = new FileReader();
      reader.onload = (e) => { this.previewImage = e.target?.result as string; };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.previewImage = null;
    this.selectedFile = null;
    this.teacherForm.patchValue({ teacherProfilePicture: '' });
  }

  onCancel(): void {
    this.router.navigate(['/school-admin-dashboard'], {
      queryParams: {
        organizationId: this.organizationId
      }
    })
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
    const field = this.teacherForm.get(fileName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.teacherForm.get(fieldName);

    if (!field || !field.errors) return '';

    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`
    }

    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }

    if (field.errors['minLength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return`${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return 'Invalid input';
  }

  getFieldLabel(fieldName: string) {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      teacherEmail: 'Email'
    };

    return labels[fieldName] || fieldName
  }
}

