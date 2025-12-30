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

  constructor(private fb: FormBuilder,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    var snapshot = this.route.snapshot.queryParams;
    this.userId = snapshot["userId"] || '';
    this.token = snapshot["token"] || '';

    console.log('Snapshot - User Id:', this.userId)
    console.log('Snapshot - token:', this.token)

    if (this.userId && this.token) {
      this.confirmEmail();
      return;
    }

    this.route.params.subscribe(params => {
      this.userId = params['userId'];
      this.token = params['token'];

      console.log('User ID:', this.userId)
      console.log(`Token: ${this.token}`)

      if (this.userId && this.token) {
        this.confirmEmail();
      } else {
        this.errorMessage = 'Invalid confirmation link. Missing parameters.'
        console.log(`Missing paramters: User Id: ${this.userId}, token: ${this.token}`)
      }
    });
  }

  confirmEmail(): void {
    if (!this.userId || !this.token) {
      this.errorMessage = 'Invalid confirmation link. Please check your email and try again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.confirmEmail(this.userId, this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isConfirmed = true;
        this.successMessage = response.message || 'Email confirmed successfully!';

        setTimeout(() => {
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
  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
  }
}
