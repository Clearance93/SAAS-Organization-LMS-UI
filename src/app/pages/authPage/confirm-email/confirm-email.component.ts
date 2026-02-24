import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/authServices/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EmailMaskPipe } from '../../../shared/pipes/email-mask.pipe';

@Component({
  selector: 'app-confirm-email',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.css']
})
export class ConfirmEmailComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  isLoading = false;
  successMessage: string | null = null
  errorMessage: string | null = null;
  private redirectTimer: any = null;
  userId: string = '';
  token: string = '';
  isConfirmed: boolean = false;
  hasValidParams: boolean = false;
  showManualConfirm: boolean = false;

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.extractParameters();
  }

  private extractParameters(): void {
    // Check query params first
    const queryParams = this.route.snapshot.queryParams;
    this.userId = queryParams["userId"] || '';
    this.token = queryParams["token"] || '';

    // If not in query params, check route params
    if (!this.userId || !this.token) {
      this.route.params.subscribe(params => {
        this.userId = params['userId'] || this.userId;
        this.token = params['token'] || this.token;
        this.validateParameters();
      });
    } else {
      this.validateParameters();
    }
  }

  private validateParameters(): void {
    if (this.userId && this.token) {
      this.hasValidParams = true;
      console.log('Valid parameters found - User ID:', this.userId);
    } else {
      this.hasValidParams = false;
      this.showManualConfirm = true;
      console.log('Missing parameters - User ID:', this.userId, 'Token:', this.token ? 'Present' : 'Missing');
    }
  }

  confirmEmail(): void {
    if (!this.userId || !this.token) {
      this.errorMessage = 'Invalid confirmation link. Please check your email and try again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.confirmEmail(this.userId, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isConfirmed = true;
        this.successMessage = response.message || 'Email confirmed successfully!';

        this.redirectTimer = setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },

      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to confirm email. The link may be expired or invalid.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendConfirmation(): void {
    // This would typically call a resend confirmation email API
    this.router.navigate(['/login'], { 
      queryParams: { message: 'Please check your email for a new confirmation link.' }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }
}
