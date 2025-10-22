import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/authServices/auth.service';
import { RegisterRequest } from '../../../features/organization/models/auth/register-request';
import { UserRole } from '../../../features/organization/models/auth/UserRole';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  imageBase64: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      profilePicture: [null, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['mustMatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mustMatch: true });
      return { mustMatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getPasswordStrength(): number {
    const password = this.f['password'].value;
    if (!password) return 0;

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    return strength;
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      const maxSize = 5 * 1024 * 1024; 
      if (file.size > maxSize) {
        this.errorMessage = 'Image size must be less than 5MB';
        input.value = '';
        return;
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Only JPG, PNG, and GIF images are allowed';
        input.value = '';
        return;
      }

      this.selectedFile = file;
      if (this.registerForm && this.registerForm.controls['profilePicture']) {
        this.registerForm.controls['profilePicture'].setValue(file.name);
        this.registerForm.controls['profilePicture'].markAsDirty();
        this.registerForm.controls['profilePicture'].updateValueAndValidity();
      }
      this.errorMessage = '';

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      const base64Reader = new FileReader();
      base64Reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64String = e.target?.result as string;
        this.imageBase64 = base64String.split(',')[1];
      };
      base64Reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.imageBase64 = null;
    if (this.registerForm && this.registerForm.controls['profilePicture']) {
      this.registerForm.controls['profilePicture'].setValue(null);
      this.registerForm.controls['profilePicture'].markAsPristine();
      this.registerForm.controls['profilePicture'].updateValueAndValidity();
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;

    const registerRequest = new RegisterRequest({
      firstName: this.f['firstName'].value.trim(),
      lastName: this.f['lastName'].value.trim(),
      email: this.f['email'].value.trim(),
      password: this.f['password'].value,
      image: this.imageBase64 || undefined,
      ProfileImage: this.imageBase64 || undefined,
      role: UserRole.ADMIN 
    });

    this.authService.register(registerRequest)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (response: any) => {
          console.log('Registration successful', response);
          this.router.navigate(['/organization-setup']);
        },
        error: (error: any) => {
          console.error('Registration error', error);
          this.handleRegistrationError(error);
        }
      });
  }

  private handleRegistrationError(error: any): void {
    if (error.error?.errorMessage) {
      this.errorMessage = error.error.errorMessage;
    } else if (error.error) {
      this.errorMessage = typeof error.error === 'string' 
        ? error.error 
        : 'Registration failed. Please try again.';
    } else if (error.status === 400) {
      this.errorMessage = 'Invalid registration data. Please check your inputs.';
    } else if (error.status === 409) {
      this.errorMessage = 'An account with this email already exists.';
    } else if (error.status === 500) {
      this.errorMessage = 'Unable to connect to server. Please check your internet connection.';
    } else {
      this.errorMessage = 'An unexpected error occurred. Please try again later.';
    }
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}