import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-compliance-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="compliance-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Compliance Reports</h1>
        <p>Generate and manage regulatory compliance reports</p>
      </header>

      <div class="reports-grid">
        <div class="report-card">
          <div class="report-icon">📋</div>
          <h3>Safety Compliance</h3>
          <p>Health and safety regulation reports</p>
          <button class="btn-primary" (click)="generateReport('safety')">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon">📊</div>
          <h3>Academic Standards</h3>
          <p>Educational standards compliance reports</p>
          <button class="btn-primary" (click)="generateReport('academic')">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon">🔒</div>
          <h3>Data Protection</h3>
          <p>GDPR and data privacy compliance reports</p>
          <button class="btn-primary" (click)="generateReport('data')">Generate Report</button>
        </div>

        <div class="report-card">
          <div class="report-icon">⚖️</div>
          <h3>Legal Compliance</h3>
          <p>Legal and regulatory requirement reports</p>
          <button class="btn-primary" (click)="generateReport('legal')">Generate Report</button>
        </div>
      </div>

      <div class="recent-reports">
        <h2>Recent Reports</h2>
        <div class="report-item">
          <span>Safety Compliance Report - December 2024</span>
          <button class="btn-download" (click)="downloadReport('Safety Compliance Report December 2024')">Download</button>
        </div>
        <div class="report-item">
          <span>Academic Standards Report - November 2024</span>
          <button class="btn-download" (click)="downloadReport('Academic Standards Report November 2024')">Download</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .compliance-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .report-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .report-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #ef4444; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .recent-reports h2 { margin-bottom: 1rem; }
    .report-item { background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .btn-download { background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
  `]
})
export class ComplianceReportsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  generateReport(type: string): void {
    const reports = {
      safety: { name: 'Safety Compliance Report', details: 'Health & safety regulations, incident reports, emergency procedures' },
      academic: { name: 'Academic Standards Report', details: 'Curriculum compliance, assessment standards, learning outcomes' },
      data: { name: 'Data Protection Report', details: 'GDPR compliance, data handling procedures, privacy policies' },
      legal: { name: 'Legal Compliance Report', details: 'Regulatory requirements, legal obligations, policy adherence' }
    };
    const report = reports[type as keyof typeof reports];
    Swal.fire({
      title: '📄 Report Generated Successfully!',
      html: `<strong>Report:</strong> ${report.name}<br><strong>Includes:</strong> ${report.details}<br><br>Report has been generated and is ready for download.`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Download PDF',
      cancelButtonText: 'Close'
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadReport(report.name);
      }
    });
  }

  downloadReport(reportName: string): void {
    const reportContent = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 50\n>>\nstream\nBT\n/F1 14 Tf\n50 750 Td\n(${reportName}) Tj\n0 -20 Td\n(Generated: ${new Date().toLocaleDateString()}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n320\n%%EOF`;
    
    const blob = new Blob([reportContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    Swal.fire({
      title: '📥 Download Started!',
      text: 'Report PDF has been downloaded to your device.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }
}