import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-training-programs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="training-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Training Programs</h1>
        <p>Manage and create training programs for your organization</p>
      </header>

      <div class="programs-grid">
        <div class="program-card">
          <div class="program-icon">🎯</div>
          <h3>Staff Development</h3>
          <p>Professional development programs for staff members</p>
          <button class="btn-primary" (click)="createProgram('staff')">Create Program</button>
        </div>

        <div class="program-card">
          <div class="program-icon">📚</div>
          <h3>Skills Training</h3>
          <p>Technical and soft skills training modules</p>
          <button class="btn-primary" (click)="createProgram('skills')">Create Program</button>
        </div>

        <div class="program-card">
          <div class="program-icon">🏆</div>
          <h3>Leadership Training</h3>
          <p>Leadership development and management training</p>
          <button class="btn-primary" (click)="createProgram('leadership')">Create Program</button>
        </div>
      </div>

      <div class="templates-section">
        <h2>Program Templates</h2>
        <div class="templates-grid">
          <div class="template-card" (click)="selectTemplate('onboarding')">
            <div class="template-icon">🚀</div>
            <h4>New Employee Onboarding</h4>
            <p>Complete orientation program for new hires</p>
          </div>
          <div class="template-card" (click)="selectTemplate('compliance')">
            <div class="template-icon">📋</div>
            <h4>Compliance Training</h4>
            <p>Regulatory compliance and safety training</p>
          </div>
          <div class="template-card" (click)="selectTemplate('technical')">
            <div class="template-icon">💻</div>
            <h4>Technical Skills</h4>
            <p>Technology and software training programs</p>
          </div>
          <div class="template-card" (click)="selectTemplate('soft-skills')">
            <div class="template-icon">🤝</div>
            <h4>Soft Skills Development</h4>
            <p>Communication and interpersonal skills</p>
          </div>
        </div>
      </div>

      <div class="active-programs">
        <h2>Active Training Programs</h2>
        <div class="program-item">
          <div class="program-info">
            <h4>Digital Literacy Training</h4>
            <p>Ongoing • 15 participants • Progress: 60%</p>
          </div>
          <button class="btn-manage">Manage</button>
        </div>
        <div class="program-item">
          <div class="program-info">
            <h4>Customer Service Excellence</h4>
            <p>Starting Jan 2025 • 12 enrolled</p>
          </div>
          <button class="btn-manage">Manage</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .training-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .programs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .program-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .program-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .templates-section { margin-bottom: 3rem; }
    .templates-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
    .template-card { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); cursor: pointer; text-align: center; transition: transform 0.2s; }
    .template-card:hover { transform: translateY(-2px); }
    .template-icon { font-size: 2rem; margin-bottom: 1rem; }
    .template-card h4 { margin: 0 0 0.5rem 0; }
    .template-card p { margin: 0; color: #6b7280; font-size: 0.875rem; }
    .active-programs h2 { margin-bottom: 1rem; }
    .program-item { background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .program-info h4 { margin: 0 0 0.25rem 0; }
    .program-info p { margin: 0; color: #6b7280; font-size: 0.875rem; }
    .btn-manage { background: #10b981; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
  `]
})
export class TrainingProgramsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createProgram(type: string): void {
    const programs = {
      staff: { title: 'Staff Development Program', duration: '8 weeks', modules: ['Leadership Skills', 'Communication', 'Time Management'] },
      skills: { title: 'Technical Skills Training', duration: '12 weeks', modules: ['Digital Literacy', 'Software Training', 'Data Analysis'] },
      leadership: { title: 'Leadership Excellence Program', duration: '16 weeks', modules: ['Strategic Thinking', 'Team Building', 'Decision Making'] }
    };
    const program = programs[type as keyof typeof programs];
    Swal.fire({
      title: '✅ Program Created!',
      html: `<strong>${program.title}</strong><br>Duration: ${program.duration}<br>Modules: ${program.modules.join(', ')}`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  selectTemplate(template: string): void {
    const templates = {
      onboarding: 'New Employee Onboarding template selected - 4 week program with orientation modules',
      compliance: 'Compliance Training template selected - Regulatory requirements and safety protocols',
      technical: 'Technical Skills template selected - Technology and software training modules',
      'soft-skills': 'Soft Skills template selected - Communication and interpersonal development'
    };
    Swal.fire({
      title: '📋 Template Selected',
      text: templates[template as keyof typeof templates],
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }
}