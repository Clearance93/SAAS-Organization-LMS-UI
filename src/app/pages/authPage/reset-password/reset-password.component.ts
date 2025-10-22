import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/authServices/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResetPasswordRequest } from '../../../interfaces/forgot-password/reset-password-request';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  form: FormGroup;

  isLoading = false;
  successMessage: string | null = null;
  showPassword = false;
  showToken = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      token: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    this.route.queryParams.subscribe(params => {
      if (params['email']) this.form.get('email')?.setValue(params['email']);
      if (params['token']) this.form.get('token')?.setValue(params['token']);
    });
   }
   
  private passwordMatchValidator(group: any) {
   const password = group.get('password')?.value;
   const confirmPassword = group.get('confirmPassword')?.value;

   return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  toggleShowPassword() {
   this.showPassword = !this.showPassword;
  }

  toggleShowToken() {
    this.showToken = !this.showToken;
  }

  // Prevent copy/cut/paste on the token input to avoid leaking the token
  preventClipboard(e: ClipboardEvent) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

   navigateToLogin(replace = false) {
    this.router.navigate(['/login'], { replaceUrl: replace });
   }

   onSubmit() {
    this.successMessage = null;
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      if (this.form.errors?.['passwordsMismatch']) {
        this.errorMessage = 'Passwords do not match.';
      }
      else {
        this.errorMessage = 'Please fill in all required fields correctly.';
      }

      return;
    }

    const payload: ResetPasswordRequest = {
      email: this.form.get('email')!.value,
      token: this.form.get('token')!.value,
      password: this.form.get('password')!.value
    };

    this.isLoading = true;  
    this.authService.resetPassword(payload).subscribe({
      next: (res: string) => {
        this.isLoading = false;
        this.successMessage = res || 'Your password has been successfully reset. You can now log in with your new password.';
        setTimeout(() => this.navigateToLogin(true), 3000);
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
