import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authServices/auth.service';
import { TeachingClassService } from '../../../services/teaching-class.service';
import { TeacherDashboardService } from '../../../services/schoolDashboards/teacher-dashboard.service';

declare var Swal: any;

@Component({
  selector: 'app-teacher-report',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './teacher-report.component.html',
  styleUrl: './teacher-report.component.css'
})
export class TeacherReportComponent implements OnInit {
  teacherId: string | null = null;
  teacherName = '';
  organizationId: string | null = null;
  
  // Report Types
  activeTab: 'my-reports' | 'student-reports' = 'my-reports';
  
  // My Reports Data
  teachingClasses: any[] = [];
  selectedClass = '';
  reportPeriod: 'term' | 'year' = 'term';
  selectedTerm = '1';
  selectedYear = new Date().getFullYear().toString();
  
  // Student Reports
  studentReportForm: FormGroup;
  students: any[] = [];
  reportTemplates = [
    { id: 'standard', name: 'Standard Report Card', description: 'Traditional report card with grades and comments' },
    { id: 'detailed', name: 'Detailed Progress Report', description: 'Comprehensive report with subject breakdown and analysis' },
    { id: 'summary', name: 'Summary Report', description: 'Brief overview of student performance' },
    { id: 'narrative', name: 'Narrative Report', description: 'Descriptive assessment with detailed feedback' }
  ];
  
  // Report Preview Data
  myReportData: any = null;
  isGeneratingReport = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private teachingClassService: TeachingClassService,
    private teacherDashboardService: TeacherDashboardService
  ) {
    this.studentReportForm = this.fb.group({
      classId: ['', Validators.required],
      studentId: ['', Validators.required],
      template: ['standard', Validators.required],
      period: ['term', Validators.required],
      term: ['1'],
      year: [new Date().getFullYear().toString(), Validators.required],
      includeAttendance: [true],
      includeGrades: [true],
      includeComments: [true],
      teacherComment: ['']
    });
  }

  ngOnInit(): void {
    const profile = this.authService.getUserProfile();
    this.teacherId = profile?.roleUserId || localStorage.getItem('roleUserId');
    this.teacherName = profile?.fullName || localStorage.getItem('userName') || 'Teacher';
    this.organizationId = profile?.organizationId || localStorage.getItem('organizationId');
    
    if (this.organizationId && this.teacherId) {
      this.loadTeachingClasses();
    }
  }

  loadTeachingClasses(): void {
    if (!this.organizationId || !this.teacherId) return;
    
    this.teachingClassService.getTeachingClasses(this.organizationId, this.teacherId)
      .subscribe({
        next: (classes) => {
          this.teachingClasses = classes;
          if (classes.length > 0) {
            this.selectedClass = classes[0].teachingClassId;
            this.studentReportForm.patchValue({ classId: classes[0].teachingClassId });
          }
        },
        error: (err) => console.error('Failed to load classes:', err)
      });
  }

  onClassChange(classId: string): void {
    // Load students for selected class
    this.students = [
      { id: '1', name: 'Student 1', grade: 85 },
      { id: '2', name: 'Student 2', grade: 92 },
      { id: '3', name: 'Student 3', grade: 78 }
    ];
  }

  generateMyReport(): void {
    if (!this.selectedClass) {
      Swal.fire('Error', 'Please select a class', 'error');
      return;
    }

    this.isGeneratingReport = true;
    
    // Simulate report generation
    setTimeout(() => {
      const selectedClassData = this.teachingClasses.find(c => c.teachingClassId === this.selectedClass);
      
      this.myReportData = {
        teacherName: this.teacherName,
        className: selectedClassData?.className || 'Class',
        subject: selectedClassData?.subject || 'Subject',
        period: this.reportPeriod === 'term' ? `Term ${this.selectedTerm}` : `Year ${this.selectedYear}`,
        year: this.selectedYear,
        totalStudents: 30,
        averageGrade: 78.5,
        passRate: 85,
        attendanceRate: 92,
        assignmentsGiven: 12,
        assignmentsCompleted: 10,
        topPerformers: [
          { name: 'Alice Johnson', grade: 95 },
          { name: 'Bob Smith', grade: 92 },
          { name: 'Carol Davis', grade: 89 }
        ],
        needsAttention: [
          { name: 'David Wilson', grade: 55, issue: 'Low attendance' },
          { name: 'Eve Brown', grade: 62, issue: 'Missing assignments' }
        ],
        subjectBreakdown: [
          { topic: 'Topic 1', average: 82 },
          { topic: 'Topic 2', average: 75 },
          { topic: 'Topic 3', average: 80 }
        ]
      };
      
      this.isGeneratingReport = false;
    }, 1500);
  }

  downloadMyReportPDF(): void {
    if (!this.myReportData) return;
    
    Swal.fire({
      title: 'Generating PDF...',
      text: 'Your report is being prepared for download',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
    
    setTimeout(() => {
      this.generatePDF(this.myReportData, 'teacher-report');
    }, 2000);
  }

  generateStudentReport(): void {
    if (!this.studentReportForm.valid) {
      Swal.fire('Validation', 'Please complete all required fields', 'warning');
      return;
    }

    const formData = this.studentReportForm.value;
    const student = this.students.find(s => s.id === formData.studentId);
    
    if (!student) return;

    Swal.fire({
      title: 'Generating Student Report...',
      text: `Creating ${formData.template} report for ${student.name}`,
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });

    setTimeout(() => {
      const reportData = {
        studentName: student.name,
        className: this.teachingClasses.find(c => c.teachingClassId === formData.classId)?.className,
        template: formData.template,
        period: formData.period === 'term' ? `Term ${formData.term}` : `Year ${formData.year}`,
        grade: student.grade,
        teacherComment: formData.teacherComment
      };
      
      this.generatePDF(reportData, `student-report-${student.name}`);
    }, 2000);
  }

  generatePDF(data: any, filename: string): void {
    // Create a printable HTML content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = this.activeTab === 'my-reports' 
      ? this.generateMyReportHTML(data)
      : this.generateStudentReportHTML(data);

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      Swal.fire('Success', 'Report ready for download. Use Print dialog to save as PDF.', 'success');
    }, 500);
  }

  generateMyReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Teacher Report - ${data.className}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #667eea; margin: 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #764ba2; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 20px 0; }
          .stat-box { border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .stat-label { color: #6b7280; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f9fafb; font-weight: 600; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Teacher Performance Report</h1>
          <p><strong>${data.teacherName}</strong> | ${data.className} - ${data.subject}</p>
          <p>${data.period} ${data.year}</p>
        </div>

        <div class="section">
          <h2>Class Overview</h2>
          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${data.totalStudents}</div>
              <div class="stat-label">Total Students</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.averageGrade}%</div>
              <div class="stat-label">Average Grade</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.passRate}%</div>
              <div class="stat-label">Pass Rate</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.attendanceRate}%</div>
              <div class="stat-label">Attendance Rate</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.assignmentsGiven}</div>
              <div class="stat-label">Assignments Given</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${data.assignmentsCompleted}</div>
              <div class="stat-label">Avg Completed</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Top Performers</h2>
          <table>
            <thead>
              <tr><th>Student Name</th><th>Grade</th></tr>
            </thead>
            <tbody>
              ${data.topPerformers.map((s: any) => `<tr><td>${s.name}</td><td>${s.grade}%</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Students Needing Attention</h2>
          <table>
            <thead>
              <tr><th>Student Name</th><th>Grade</th><th>Issue</th></tr>
            </thead>
            <tbody>
              ${data.needsAttention.map((s: any) => `<tr><td>${s.name}</td><td>${s.grade}%</td><td>${s.issue}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Subject Topic Performance</h2>
          <table>
            <thead>
              <tr><th>Topic</th><th>Class Average</th></tr>
            </thead>
            <tbody>
              ${data.subjectBreakdown.map((t: any) => `<tr><td>${t.topic}</td><td>${t.average}%</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} | Thutonet School Management System</p>
        </div>
      </body>
      </html>
    `;
  }

  generateStudentReportHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Report - ${data.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; border-bottom: 3px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { color: #667eea; margin: 0; }
          .section { margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; }
          .section h2 { color: #764ba2; margin-top: 0; }
          .grade-box { background: #f0fdf4; border: 2px solid #10b981; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .grade-value { font-size: 48px; font-weight: bold; color: #10b981; }
          .comment-box { background: #f9fafb; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { margin-top: 50px; text-align: center; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Progress Report</h1>
          <p><strong>${data.studentName}</strong></p>
          <p>${data.className} | ${data.period}</p>
        </div>

        <div class="section">
          <h2>Overall Performance</h2>
          <div class="grade-box">
            <div class="grade-value">${data.grade}%</div>
            <div>Overall Grade</div>
          </div>
        </div>

        <div class="section">
          <h2>Teacher's Comment</h2>
          <div class="comment-box">
            <p>${data.teacherComment || 'Good progress shown throughout the period.'}</p>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} | Thutonet School Management System</p>
          <p>Teacher: ${this.teacherName}</p>
        </div>
      </body>
      </html>
    `;
  }

  backToDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }
}
