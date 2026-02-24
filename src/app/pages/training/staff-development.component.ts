import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-staff-development',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="staff-dev-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Staff Development</h1>
        <p>Professional development programs for staff members</p>
      </header>

      <div class="development-grid">
        <div class="dev-card">
          <div class="dev-icon">📈</div>
          <h3>Performance Enhancement</h3>
          <p>Programs to improve staff performance and productivity</p>
          <button class="btn-primary" (click)="createProgram('performance')">Create Program</button>
        </div>

        <div class="dev-card">
          <div class="dev-icon">💼</div>
          <h3>Career Advancement</h3>
          <p>Career growth and advancement opportunities</p>
          <button class="btn-primary" (click)="createProgram('career')">Create Program</button>
        </div>

        <div class="dev-card">
          <div class="dev-icon">🎓</div>
          <h3>Skills Training</h3>
          <p>Technical and soft skills development programs</p>
          <button class="btn-primary" (click)="createProgram('skills')">Create Program</button>
        </div>

        <div class="dev-card">
          <div class="dev-icon">🤝</div>
          <h3>Team Building</h3>
          <p>Collaborative team building activities and workshops</p>
          <button class="btn-primary" (click)="createProgram('team-building')">Create Program</button>
        </div>
      </div>

      <div class="active-programs">
        <h2>Active Development Programs</h2>
        <div class="program-item">
          <div class="program-info">
            <h4>Digital Literacy Training</h4>
            <p>Ongoing • 15 participants</p>
          </div>
          <button class="btn-manage">Manage</button>
        </div>
        <div class="program-item">
          <div class="program-info">
            <h4>Leadership Workshop Series</h4>
            <p>Starting Jan 2025 • 8 participants</p>
          </div>
          <button class="btn-manage">Manage</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .staff-dev-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .development-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 3rem; }
    .dev-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .dev-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #059669; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .active-programs h2 { margin-bottom: 1rem; }
    .program-item { background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .program-info h4 { margin: 0 0 0.25rem 0; }
    .program-info p { margin: 0; color: #6b7280; font-size: 0.875rem; }
    .btn-manage { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; }
  `]
})
export class StaffDevelopmentComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createProgram(type: string): void {
    const programs = {
      performance: { name: 'Performance Enhancement Program', description: 'Productivity improvement and performance optimization training' },
      career: { name: 'Career Advancement Program', description: 'Professional growth pathways and career development planning' },
      skills: { name: 'Skills Training Program', description: 'Technical and soft skills development workshops' },
      'team-building': { name: 'Team Building Program', description: 'Collaborative activities and team cohesion exercises' }
    };
    const program = programs[type as keyof typeof programs];
    Swal.fire({
      title: '🚀 Staff Development Program Created!',
      html: `<strong>Program:</strong> ${program.name}<br><strong>Description:</strong> ${program.description}<br><br>Program has been added to your staff development curriculum.`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
}