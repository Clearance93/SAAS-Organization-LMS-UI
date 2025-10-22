import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/authServices/auth.service';
import { Router } from '@angular/router';
import { ForgotPasswordRequest } from '../../../interfaces/forgot-password/forgot-password-request';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  
navigateToLogin() {
  this.router.navigate(['/login']);
}
  form: FormGroup;

  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get email() {
    return this.form.get('email');
  }

  onSubmit() {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.form.invalid) {
      this.errorMessage = 'Please enter a valid email address.';
      this.form.markAllAsTouched();
      return;
    }

    const payload: ForgotPasswordRequest = { email: this.email?.value! };
    
    this.isLoading = true;
    this.authService.forgetPassword(payload).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.successMessage = res || `If an account with email ${payload.email} exists, a password reset link has been sent.`;
        this.form.reset();
      },
      error: (err: any) => {
        this.isLoading = false;
        const serverMessage = typeof err === 'string' ? err : err?.error ?? err?.message;
        this.errorMessage = serverMessage || 'An error occurred while processing your request. Please try again later.';
      }
    });
  }
}
