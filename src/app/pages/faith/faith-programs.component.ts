import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-faith-programs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="faith-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Faith Programs</h1>
        <p>Spiritual growth and faith-based learning programs</p>
      </header>

      <div class="programs-grid">
        <div class="program-card">
          <div class="program-icon">✝️</div>
          <h3>Bible Study</h3>
          <p>Weekly Bible study sessions and discussions</p>
          <button class="btn-primary" (click)="createProgram('bible-study')">Create Program</button>
        </div>

        <div class="program-card">
          <div class="program-icon">🙏</div>
          <h3>Prayer Groups</h3>
          <p>Community prayer and meditation sessions</p>
          <button class="btn-primary" (click)="createProgram('prayer-groups')">Create Program</button>
        </div>

        <div class="program-card">
          <div class="program-icon">📖</div>
          <h3>Scripture Learning</h3>
          <p>Memorization and understanding of scriptures</p>
          <button class="btn-primary" (click)="createProgram('scripture-learning')">Create Program</button>
        </div>

        <div class="program-card">
          <div class="program-icon">🕊️</div>
          <h3>Spiritual Counseling</h3>
          <p>One-on-one spiritual guidance and support</p>
          <button class="btn-primary" (click)="createProgram('spiritual-counseling')">Create Program</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faith-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .programs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
    .program-card { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .program-icon { font-size: 3rem; margin-bottom: 1rem; }
    .btn-primary { background: #8b5cf6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
  `]
})
export class FaithProgramsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createProgram(type: string): void {
    const programs = {
      'bible-study': { name: 'Bible Study Program', description: 'Weekly sessions with scripture reading and group discussions' },
      'prayer-groups': { name: 'Prayer Groups Program', description: 'Community prayer meetings and meditation sessions' },
      'scripture-learning': { name: 'Scripture Learning Program', description: 'Memorization and deep study of religious texts' },
      'spiritual-counseling': { name: 'Spiritual Counseling Program', description: 'Individual guidance and spiritual support sessions' }
    };
    const program = programs[type as keyof typeof programs];
    Swal.fire({
      title: '✨ Faith Program Created!',
      html: `<strong>Program:</strong> ${program.name}<br><strong>Description:</strong> ${program.description}<br><br>Program has been added to your faith-based curriculum.`,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
}