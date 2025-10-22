import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.component.html',
  styleUrls: ['./thank-you.component.css']
})
export class ThankYouComponent {
  resendInProgress = false;
  message: string | null = null;

  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  resendVerification() {
    if (this.resendInProgress) return;
    this.resendInProgress = true;
    this.message = null;

    // TODO: wire this to AuthService.resendVerification(email) when available.
    // For now simulate network call with a timeout and show a success message.
    setTimeout(() => {
      this.resendInProgress = false;
      this.message = 'Verification email resent. Please check your inbox.';
    }, 1200);
  }
}
