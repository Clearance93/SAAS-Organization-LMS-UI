import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StreamData {
  gradeId: string;
  streamId: string;
  organizationId: string;
  streamTeacherId: string;
  teachingClassId: string;
  subjectTeacherId: string;
  subject: string;
  streamName: string;
  totalStudents: number;
  classRoomNumber: string;
  firstName: string;
  lastName: string;
  teacherProfilePicture: string;
  streamCreatedAt: string;
}

@Component({
  selector: 'app-stream-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stream-container">
      <div class="stream-card" *ngFor="let stream of streams">
        <div class="stream-header">
          <div class="teacher-info">
            <img [src]="'data:image/jpeg;base64,' + stream.teacherProfilePicture" 
                 [alt]="stream.firstName + ' ' + stream.lastName"
                 class="teacher-avatar">
            <div class="teacher-details">
              <h3>{{stream.firstName}} {{stream.lastName}}</h3>
              <p class="subject">{{stream.subject}}</p>
            </div>
          </div>
          <div class="stream-meta">
            <span class="stream-name">{{stream.streamName}}</span>
            <span class="room">{{stream.classRoomNumber}}</span>
          </div>
        </div>
        
        <div class="stream-stats">
          <div class="stat">
            <span class="stat-value">{{stream.totalStudents}}</span>
            <span class="stat-label">Students</span>
          </div>
          <div class="stat">
            <span class="stat-value">{{formatDate(stream.streamCreatedAt)}}</span>
            <span class="stat-label">Created</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stream-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1rem;
      padding: 1rem;
    }

    .stream-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      padding: 1.5rem;
      transition: transform 0.2s;
    }

    .stream-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stream-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .teacher-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .teacher-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      object-fit: cover;
    }

    .teacher-details h3 {
      margin: 0;
      font-size: 1.1rem;
      color: #333;
    }

    .subject {
      margin: 0.25rem 0 0 0;
      color: #666;
      font-size: 0.9rem;
    }

    .stream-meta {
      text-align: right;
    }

    .stream-name {
      display: block;
      font-weight: 600;
      color: #2563eb;
      margin-bottom: 0.25rem;
    }

    .room {
      font-size: 0.9rem;
      color: #666;
    }

    .stream-stats {
      display: flex;
      gap: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #333;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #666;
      margin-top: 0.25rem;
    }
  `]
})
export class StreamListComponent {
  @Input() streams: StreamData[] = [];

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}