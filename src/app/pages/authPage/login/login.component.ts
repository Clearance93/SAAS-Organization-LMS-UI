import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/authServices/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoleNavigationService } from '../../../services/role-navigation.service';
import { TeacherDashboardService } from '../../../services/schoolDashboards/teacher-dashboard.service';
import { StudentService } from '../../../services/student.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  submitted = false;
  errorMessage = '';
  hidePassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private roleNavigation: RoleNavigationService
    , private teacherDashboardService: TeacherDashboardService,
    private studentService: StudentService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value)
    .subscribe({
      next: (response) => {
        console.log('Login successful', response);
        localStorage.setItem('adminEmail', this.loginForm.value.email);

        const role = (localStorage.getItem('userRole') || '').toLowerCase();

        if (role === 'teacher') {
          const orgId = localStorage.getItem('organizationId');
          const teacherId = localStorage.getItem('userId') || localStorage.getItem('teacherId');

          if (orgId && teacherId) {
            this.teacherDashboardService.getTeacherDashboard(orgId, teacherId).subscribe({
              next: (stats) => {
                localStorage.setItem('teacherDashboard', JSON.stringify(stats));
                this.router.navigate(['/teacher-dashboard']);
              },
              error: (err) => {
                console.error('Failed to load teacher dashboard', err);
                this.router.navigate(['/teacher-dashboard']);
              }
            });
            return;
          }
        }

        if (role === 'student') {
          const email = this.loginForm.value.email;
          this.studentService.getStudentByEmail(email).subscribe({
            next: (studentProfile) => {
              localStorage.setItem('studentProfile', JSON.stringify(studentProfile));
              this.router.navigate(['/student-dashboard']);
            },
            error: (err) => {
              console.error('Failed to load student profile', err);
              this.router.navigate(['/student-dashboard']);
            }
          });
          return;
        }

        // default navigation for other roles
        this.roleNavigation.navigateToDashboard();
      },
      error: (error) => {
        console.error('Login error', error);
        this.errorMessage = error.error?.errorMessage || 'Invalid email pr password. Please try again.';
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
