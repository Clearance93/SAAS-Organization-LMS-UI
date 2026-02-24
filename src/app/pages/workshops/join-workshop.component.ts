import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

interface Workshop {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: number;
}

@Component({
  selector: 'app-join-workshop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="join-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Join Workshop</h1>
        <p>Browse and join available workshops</p>
      </header>

      <div class="workshops-list">
        <div class="workshop-item" *ngFor="let workshop of sortedWorkshops" [ngClass]="getWorkshopStatusClass(workshop)">
          <div class="status-indicator" [ngClass]="getStatusIndicatorClass(workshop)">
            <span class="status-icon">{{ getStatusIcon(workshop) }}</span>
            <span class="status-text">{{ getStatusText(workshop) }}</span>
          </div>
          
          <div class="workshop-info">
            <h3>{{ workshop.title }}</h3>
            <p>{{ workshop.description }}</p>
            
            <div class="countdown" *ngIf="getCountdown(workshop) && !isWorkshopInProgress(workshop)">
              <span class="countdown-label">Starts in:</span>
              <span class="countdown-time">{{ getCountdown(workshop) }}</span>
            </div>
            
            <div class="workshop-meta">
              <span>📅 {{ formatDate(workshop.date) }}</span>
              <span>⏰ {{ workshop.time }}</span>
              <span>👥 {{ workshop.participants }}/{{ workshop.maxParticipants }} participants</span>
            </div>
          </div>
          
          <button class="btn-join" 
                  (click)="joinWorkshop(workshop)" 
                  [disabled]="isWorkshopInProgress(workshop) || isWorkshopPast(workshop)">
            {{ getJoinButtonText(workshop) }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .join-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .workshops-list { display: flex; flex-direction: column; gap: 1rem; }
    .workshop-item { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; gap: 1rem; position: relative; border-left: 4px solid transparent; }
    .workshop-item.in-progress { border-left-color: #ef4444; background: #fef2f2; }
    .workshop-item.upcoming-soon { border-left-color: #f59e0b; background: #fffbeb; }
    .workshop-item.upcoming { border-left-color: #10b981; background: #f0fdf4; }
    .workshop-item.scheduled { border-left-color: #6b7280; background: #f9fafb; }
    .status-indicator { display: flex; flex-direction: column; align-items: center; min-width: 80px; }
    .status-icon { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .status-text { font-size: 0.75rem; font-weight: 500; text-align: center; }
    .status-indicator.in-progress .status-text { color: #ef4444; }
    .status-indicator.upcoming-soon .status-text { color: #f59e0b; }
    .status-indicator.upcoming .status-text { color: #10b981; }
    .status-indicator.scheduled .status-text { color: #6b7280; }
    .workshop-info { flex: 1; }
    .workshop-info h3 { margin: 0 0 0.5rem 0; color: #1f2937; }
    .workshop-info p { margin: 0 0 1rem 0; color: #6b7280; }
    .countdown { margin-bottom: 0.5rem; padding: 0.5rem; background: #dbeafe; border-radius: 0.25rem; }
    .countdown-label { font-size: 0.875rem; color: #1e40af; font-weight: 500; }
    .countdown-time { font-size: 1rem; color: #1e40af; font-weight: bold; margin-left: 0.5rem; }
    .workshop-meta { display: flex; gap: 1rem; font-size: 0.875rem; color: #6b7280; }
    .btn-join { background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; min-width: 120px; }
    .btn-join:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class JoinWorkshopComponent implements OnInit, OnDestroy {
  workshops: Workshop[] = [
    {
      id: '1',
      title: 'Digital Teaching Methods',
      description: 'Learn modern digital teaching techniques',
      date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
      time: '2:00 PM',
      participants: 25,
      maxParticipants: 50
    },
    {
      id: '2',
      title: 'Student Assessment Strategies',
      description: 'Effective methods for student evaluation',
      date: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // 1.5 hours from now
      time: '10:00 AM',
      participants: 15,
      maxParticipants: 30
    },
    {
      id: '3',
      title: 'Classroom Management',
      description: 'Best practices for classroom organization',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
      time: '3:00 PM',
      participants: 40,
      maxParticipants: 60
    }
  ];

  private timerSubscription?: Subscription;
  private notificationPermission: NotificationPermission = 'default';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.requestNotificationPermission();
    this.startTimer();
    this.checkUpcomingWorkshops();
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  get sortedWorkshops(): Workshop[] {
    return [...this.workshops].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });
  }

  private startTimer(): void {
    this.timerSubscription = interval(60000).subscribe(() => {
      this.checkUpcomingWorkshops();
    });
  }

  private async requestNotificationPermission(): Promise<void> {
    if ('Notification' in window) {
      this.notificationPermission = await Notification.requestPermission();
    }
  }

  private checkUpcomingWorkshops(): void {
    const now = new Date().getTime();
    
    this.workshops.forEach(workshop => {
      const workshopTime = new Date(workshop.date).getTime();
      const timeDiff = workshopTime - now;
      const twoHours = 2 * 60 * 60 * 1000;
      
      if (timeDiff > 0 && timeDiff <= twoHours && timeDiff > (twoHours - 60000)) {
        this.showNotification(workshop);
      }
    });
  }

  private showNotification(workshop: Workshop): void {
    if (this.notificationPermission === 'granted') {
      new Notification(`Workshop Starting Soon! 📢`, {
        body: `"${workshop.title}" starts in 2 hours at ${workshop.time}`,
        icon: '/assets/workshop-icon.png',
        tag: workshop.id
      });
    }
  }

  getWorkshopStatusClass(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return 'in-progress';
    if (this.isUpcomingSoon(workshop)) return 'upcoming-soon';
    if (this.isUpcoming(workshop)) return 'upcoming';
    return 'scheduled';
  }

  getStatusIndicatorClass(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return 'in-progress';
    if (this.isUpcomingSoon(workshop)) return 'upcoming-soon';
    if (this.isUpcoming(workshop)) return 'upcoming';
    return 'scheduled';
  }

  getStatusIcon(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return '🔴'; // Red circle
    if (this.isUpcomingSoon(workshop)) return '🟡'; // Yellow circle
    if (this.isUpcoming(workshop)) return '🟢'; // Green circle
    return '⚪'; // White circle
  }

  getStatusText(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return 'In Progress';
    if (this.isUpcomingSoon(workshop)) return 'Starting Soon';
    if (this.isUpcoming(workshop)) return 'Upcoming';
    return 'Scheduled';
  }

  isWorkshopInProgress(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = now - workshopTime;
    return timeDiff >= 0 && timeDiff <= (2 * 60 * 60 * 1000); // Within 2 hours of start
  }

  isUpcomingSoon(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = workshopTime - now;
    return timeDiff > 0 && timeDiff <= (2 * 60 * 60 * 1000); // Within 2 hours
  }

  isUpcoming(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = workshopTime - now;
    return timeDiff > (2 * 60 * 60 * 1000) && timeDiff <= (24 * 60 * 60 * 1000); // 2-24 hours
  }

  isWorkshopPast(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    return (now - workshopTime) > (2 * 60 * 60 * 1000); // More than 2 hours past
  }

  getCountdown(workshop: Workshop): string | null {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = workshopTime - now;
    
    if (timeDiff <= 0) return null;
    
    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getJoinButtonText(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return 'Join Now';
    if (this.isWorkshopPast(workshop)) return 'Ended';
    return 'Join Workshop';
  }

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  joinWorkshop(workshop: Workshop): void {
    if (this.isWorkshopInProgress(workshop)) {
      Swal.fire({
        title: '🟢 Joining Live Workshop!',
        html: `<strong>Workshop:</strong> ${workshop.title}<br><br>Redirecting you to the live session...`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        title: '✅ Successfully Registered!',
        html: `<strong>Workshop:</strong> ${workshop.title}<br><strong>Date:</strong> ${this.formatDate(workshop.date)}<br><strong>Time:</strong> ${workshop.time}<br><br>You will receive notifications before the workshop starts.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    }
  }
}