import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AdminReportService } from '../../../services/reports/admin-report.service';
import { AuthService } from '../../../services/authServices/auth.service';

declare var Swal: any;

@Component({
  selector: 'app-admin-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-report.component.html',
  styleUrl: './admin-report.component.css'
})
export class AdminReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  organizationId: string = '';
  organizationName: string = '';
  reportData: any = null;
  isLoading = false;
  filterForm: FormGroup;
  Date = Date;
  isEmailModalOpen = false;
  emailForm: FormGroup;
  
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private reportService: AdminReportService,
    private authService: AuthService
  ) {
    this.filterForm = this.fb.group({
      reportType: ['full'],
      dateRange: ['all']
    });
    
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    const profile = this.authService.getUserProfile();
    this.organizationId = profile?.organizationId || 
      (typeof localStorage !== 'undefined' ? localStorage.getItem('organizationId') : null) || '';
    this.organizationName = profile?.organizationName || 
      (typeof localStorage !== 'undefined' ? localStorage.getItem('organizationName') : null) || 'School';
    
    if (this.organizationId) {
      this.loadReportData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReportData(): void {
    this.isLoading = true;
    this.reportService.getOrganizationReport(this.organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.reportData = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load report data:', err);
          this.isLoading = false;
          Swal.fire('Error', 'Failed to load report data', 'error');
        }
      });
  }

  downloadReport(): void {
    if (!this.reportData) return;
    
    window.print();
    
    Swal.fire('Info', 'Please select "Save as PDF" in the print dialog', 'info');
  }

  sendReportViaEmail(): void {
    this.isEmailModalOpen = true;
  }

  closeEmailModal(): void {
    this.isEmailModalOpen = false;
    this.emailForm.reset();
  }

  submitEmailReport(): void {
    if (!this.emailForm.valid) return;
    
    const email = this.emailForm.value.email;
    this.reportService.sendReportEmail(this.organizationId, email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.fire('Success', `Report sent to ${email}`, 'success');
          this.closeEmailModal();
        },
        error: (err) => {
          console.error('Failed to send email:', err);
          Swal.fire('Error', 'Failed to send report via email', 'error');
        }
      });
  }

  private generateReportHTML(): string {
    const date = new Date().toLocaleDateString();
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${this.organizationName} - School Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #6366f1; color: white; }
          .section { margin: 30px 0; }
        </style>
      </head>
      <body>
        <h1>${this.organizationName} - School Performance Report</h1>
        <p>Generated on: ${date}</p>
        
        <div class="section">
          <h2>Overview Statistics</h2>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Students</td><td>${this.reportData.totalStudents || 0}</td></tr>
            <tr><td>Total Teachers</td><td>${this.reportData.totalTeachers || 0}</td></tr>
            <tr><td>Total Staff</td><td>${this.reportData.totalStaff || 0}</td></tr>
            <tr><td>Average Attendance</td><td>${this.reportData.averageAttendance || 0}%</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Class Performance</h2>
          <table>
            <tr><th>Class Name</th><th>Performance %</th></tr>
            ${this.reportData.classPerformance?.map((c: any) => 
              `<tr><td>${c.className}</td><td>${c.performancePercentage}%</td></tr>`
            ).join('') || '<tr><td colspan="2">No data available</td></tr>'}
          </table>
        </div>
      </body>
      </html>
    `;
  }

  backToDashboard(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }
}
