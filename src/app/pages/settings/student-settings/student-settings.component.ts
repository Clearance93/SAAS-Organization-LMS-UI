import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/authServices/auth.service';

declare var Swal: any;

@Component({
  selector: 'app-student-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './student-settings.component.html',
  styleUrl: './student-settings.component.css'
})
export class StudentSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  notificationForm!: FormGroup;
  
  activeTab = 'profile';
  isLoading = false;
  
  studentProfile = {
    firstName: 'Alex',
    lastName: 'Johnson',
    email: 'alex.johnson@school.edu',
    phone: '+1234567890',
    dateOfBirth: '2005-03-15',
    address: '123 Main Street, City, State',
    emergencyContact: 'Jane Johnson - +1234567891',
    profilePicture: '',
    studentId: 'STU2024001',
    grade: 'Grade 10',
    stream: 'Science Stream',
    enrollmentDate: '2023-09-01'
  };
  
  notificationSettings = {
    emailNotifications: true,
    assignmentReminders: true,
    gradeUpdates: true,
    announcements: true,
    eventReminders: true,
    libraryDueReminders: true
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadStudentProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      firstName: [this.studentProfile.firstName, [Validators.required]],
      lastName: [this.studentProfile.lastName, [Validators.required]],
      phone: [this.studentProfile.phone],
      address: [this.studentProfile.address],
      emergencyContact: [this.studentProfile.emergencyContact]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.notificationForm = this.fb.group({
      emailNotifications: [this.notificationSettings.emailNotifications],
      assignmentReminders: [this.notificationSettings.assignmentReminders],
      gradeUpdates: [this.notificationSettings.gradeUpdates],
      announcements: [this.notificationSettings.announcements],
      eventReminders: [this.notificationSettings.eventReminders],
      libraryDueReminders: [this.notificationSettings.libraryDueReminders]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  loadStudentProfile(): void {
    if (typeof localStorage === 'undefined') return;
    
    const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    if (studentProfile.firstName) {
      // Handle profile picture with proper formatting
      let profilePicture = '';
      if (studentProfile.studentProfilePicture) {
        const profilePic = studentProfile.studentProfilePicture;
        if (profilePic && !profilePic.startsWith('data:')) {
          profilePicture = `data:image/jpeg;base64,${profilePic}`;
        } else {
          profilePicture = profilePic;
        }
      }
      
      this.studentProfile = {
        firstName: studentProfile.firstName,
        lastName: studentProfile.lastName,
        email: studentProfile.studentEmail,
        phone: '',
        dateOfBirth: studentProfile.dateOfBirth ? studentProfile.dateOfBirth.split('T')[0] : '',
        address: '',
        emergencyContact: '',
        profilePicture: profilePicture,
        studentId: studentProfile.studentId,
        grade: 'Grade 10', // This would come from grade lookup
        stream: 'Science Stream', // This would come from stream lookup
        enrollmentDate: studentProfile.createdAt ? studentProfile.createdAt.split('T')[0] : ''
      };
      this.profileForm.patchValue(this.studentProfile);
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'File size should not exceed 5MB', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.studentProfile.profilePicture = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  updateProfile(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      
      const formData = this.profileForm.value;
      
      // TODO: Implement API call to update profile
      setTimeout(() => {
        this.studentProfile = { ...this.studentProfile, ...formData };
        this.isLoading = false;
        
        Swal.fire({
          title: 'Success!',
          text: 'Profile updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }, 1000);
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      this.isLoading = true;
      
      const profile = this.authService.getUserProfile();
      const email = profile?.email || localStorage.getItem('userEmail') || this.studentProfile.email;
      
      const payload = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
        email: email
      };
      
      this.authService.changePassword(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            this.passwordForm.reset();
            
            Swal.fire({
              title: 'Success!',
              text: 'Password changed successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          },
          error: (error) => {
            this.isLoading = false;
            
            Swal.fire({
              title: 'Error!',
              text: error || 'Failed to change password',
              icon: 'error'
            });
          }
        });
    }
  }

  updateNotifications(): void {
    this.isLoading = true;
    
    const formData = this.notificationForm.value;
    
    // TODO: Implement API call to update notification settings
    setTimeout(() => {
      this.notificationSettings = { ...this.notificationSettings, ...formData };
      this.isLoading = false;
      
      Swal.fire({
        title: 'Success!',
        text: 'Notification settings updated successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }, 1000);
  }

  exportData(): void {
    Swal.fire({
      title: 'Export Data',
      text: 'This will download your academic data as a PDF report.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Export',
      cancelButtonText: 'Cancel'
    }).then((result: any) => {
      if (result.isConfirmed) {
        // TODO: Implement data export functionality
        Swal.fire('Success', 'Data export initiated. You will receive an email when ready.', 'success');
      }
    });
  }

  viewUsage(): void {
    Swal.fire({
      title: 'Data Usage Information',
      html: `
        <div style="text-align: left; padding: 10px;">
          <h4>How your data is used:</h4>
          <ul>
            <li>Academic records for progress tracking</li>
            <li>Personal information for school communication</li>
            <li>Assignment submissions for grading</li>
            <li>Library usage for book management</li>
            <li>Attendance records for compliance</li>
          </ul>
          <p><strong>Note:</strong> Your data is protected and only used for educational purposes.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Got it'
    });
  }

  deleteAccount(): void {
    Swal.fire({
      title: 'Delete Account',
      text: 'This action cannot be undone. Are you sure you want to delete your account?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33'
    }).then((result: any) => {
      if (result.isConfirmed) {
        // TODO: Implement account deletion
        Swal.fire('Deleted!', 'Your account has been scheduled for deletion.', 'success');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/student-dashboard']);
  }

  getStudentInitials(): string {
    const firstName = this.studentProfile.firstName || '';
    const lastName = this.studentProfile.lastName || '';
    return (firstName[0] || '') + (lastName[0] || '');
  }
}