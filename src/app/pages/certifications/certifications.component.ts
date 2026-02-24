import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-certifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cert-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Certifications</h1>
        <p>Manage certificates and compliance requirements</p>
      </header>

      <div class="cert-grid">
        <div class="cert-card">
          <div class="cert-icon">🏆</div>
          <h3>Course Completion</h3>
          <p>Generate certificates for completed courses</p>
          <button class="btn-primary" (click)="createCertificate('course')">Create Certificate</button>
        </div>

        <div class="cert-card">
          <div class="cert-icon">📜</div>
          <h3>Achievement Awards</h3>
          <p>Recognition certificates for achievements</p>
          <button class="btn-primary" (click)="createCertificate('achievement')">Create Certificate</button>
        </div>

        <div class="cert-card">
          <div class="cert-icon">✅</div>
          <h3>Compliance Certificates</h3>
          <p>Regulatory compliance documentation</p>
          <button class="btn-primary" (click)="createCertificate('compliance')">Create Certificate</button>
        </div>
      </div>

      <div class="templates-section">
        <h2>Certificate Templates</h2>
        <div class="templates-grid">
          <div class="template-card" (click)="selectTemplate('modern')">
            <div class="template-preview modern">Modern Design</div>
            <h4>Modern Template</h4>
          </div>
          <div class="template-card" (click)="selectTemplate('classic')">
            <div class="template-preview classic">Classic Design</div>
            <h4>Classic Template</h4>
          </div>
          <div class="template-card" (click)="selectTemplate('elegant')">
            <div class="template-preview elegant">Elegant Design</div>
            <h4>Elegant Template</h4>
          </div>
        </div>
      </div>

      <div class="recent-certificates">
        <h2>Recent Certificates</h2>
        <div class="cert-item">
          <span>Mathematics Course Completion - John Doe</span>
          <button class="btn-download" (click)="downloadExisting('Mathematics_Course_Completion_John_Doe')">Download</button>
        </div>
        <div class="cert-item">
          <span>Excellence Award - Jane Smith</span>
          <button class="btn-download" (click)="downloadExisting('Excellence_Award_Jane_Smith')">Download</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cert-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .cert-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .cert-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .cert-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #f59e0b; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .templates-section { margin-bottom: 3rem; }
    .templates-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .template-card { background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; text-align: center; }
    .template-preview { height: 120px; border-radius: 0.25rem; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; margin-bottom: 1rem; }
    .template-preview.modern { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .template-preview.classic { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .template-preview.elegant { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .recent-certificates h2 { margin-bottom: 1rem; }
    .cert-item { background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .btn-download { background: #6b7280; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
  `]
})
export class CertificationsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createCertificate(type: string): void {
    const certificates = {
      course: { name: 'Course Completion Certificate', template: 'Academic achievement template with course details' },
      achievement: { name: 'Achievement Award Certificate', template: 'Recognition template with achievement details' },
      compliance: { name: 'Compliance Certificate', template: 'Regulatory compliance template with validation' }
    };
    const cert = certificates[type as keyof typeof certificates];
    Swal.fire({
      title: '🏆 Certificate Generated!',
      html: `<strong>Type:</strong> ${cert.name}<br><strong>Template:</strong> ${cert.template}<br><br>Certificate is ready for download and distribution.`,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Download PDF',
      cancelButtonText: 'Close'
    }).then((result) => {
      if (result.isConfirmed) {
        this.downloadCertificate(cert.name);
      }
    });
  }

  selectTemplate(template: string): void {
    const templates = {
      modern: 'Modern template selected - Clean design with gradient backgrounds',
      classic: 'Classic template selected - Traditional formal certificate design',
      elegant: 'Elegant template selected - Sophisticated design with premium styling'
    };
    Swal.fire({
      title: '🎨 Template Applied',
      text: `${templates[template as keyof typeof templates]}\n\nTemplate applied to certificate generator.`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  downloadCertificate(certName: string): void {
    // Generate sample PDF content
    const pdfContent = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(${certName}) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n299\n%%EOF`;
    
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${certName.replace(/\s+/g, '_')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    Swal.fire({
      title: '📥 Download Started!',
      text: 'Certificate PDF has been downloaded to your device.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  }

  downloadExisting(fileName: string): void {
    this.downloadCertificate(fileName.replace(/_/g, ' '));
  }
}