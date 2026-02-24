import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationType, ServiceType, ServiceDuration } from '../../features/organization/models/organization.enums';
import Swal from 'sweetalert2';

interface OrganizationData {
  organizationName: string;
  organizationType: OrganizationType;
  organizationAddress: string;
  organizationContactNumber: string;
  website?: string;
  serviceDuration: ServiceDuration;
  serviceType: ServiceType[];
  adminEmail: string;
}

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
  selector: 'app-join-workshop-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" *ngIf="isVisible" (click)="closeModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Join Workshop</h2>
          <button class="close-btn" (click)="closeModal()">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Organization Info Section -->
          <div class="organization-info" *ngIf="organizationData">
            <h3>Organization Details</h3>
            <div class="info-grid">
              <div class="info-item">
                <label>Organization Name:</label>
                <span>{{ organizationData.organizationName }}</span>
              </div>
              <div class="info-item">
                <label>Type:</label>
                <span>{{ organizationData.organizationType }}</span>
              </div>
              <div class="info-item">
                <label>Address:</label>
                <span>{{ organizationData.organizationAddress }}</span>
              </div>
              <div class="info-item">
                <label>Contact:</label>
                <span>{{ organizationData.organizationContactNumber }}</span>
              </div>
              <div class="info-item" *ngIf="organizationData.website">
                <label>Website:</label>
                <span>{{ organizationData.website }}</span>
              </div>
              <div class="info-item">
                <label>Admin Email:</label>
                <span>{{ organizationData.adminEmail }}</span>
              </div>
              <div class="info-item">
                <label>Service Duration:</label>
                <span>{{ getServiceDurationLabel(organizationData.serviceDuration) }}</span>
              </div>
              <div class="info-item">
                <label>Service Types:</label>
                <span>{{ organizationData.serviceType.join(', ') }}</span>
              </div>
            </div>
          </div>

          <!-- Available Workshops Section -->
          <div class="workshops-section">
            <h3>Available Workshops</h3>
            <div class="workshops-list">
              <div class="workshop-item" *ngFor="let workshop of workshops" [ngClass]="getWorkshopStatusClass(workshop)">
                <div class="status-indicator" [ngClass]="getStatusIndicatorClass(workshop)">
                  <span class="status-icon">{{ getStatusIcon(workshop) }}</span>
                  <span class="status-text">{{ getStatusText(workshop) }}</span>
                </div>
                
                <div class="workshop-info">
                  <h4>{{ workshop.title }}</h4>
                  <p>{{ workshop.description }}</p>
                  
                  <div class="countdown" *ngIf="getCountdown(workshop) && !isWorkshopInProgress(workshop)">
                    <span class="countdown-label">Starts in</span>
                    <span class="countdown-time">{{ getCountdown(workshop) }}</span>
                  </div>
                  
                  <div class="workshop-meta">
                    <span>📅 {{ formatDate(workshop.date) }}</span>
                    <span>⏰ {{ workshop.time }}</span>
                    <span>👥 {{ workshop.participants }}/{{ workshop.maxParticipants }}</span>
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
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" (click)="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background: white;
      border-radius: 0.5rem;
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
    
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .organization-info {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 0.5rem;
    }
    
    .organization-info h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }
    
    .info-item {
      display: flex;
      flex-direction: column;
    }
    
    .info-item label {
      font-weight: 500;
      color: #374151;
      margin-bottom: 0.25rem;
    }
    
    .info-item span {
      color: #6b7280;
    }
    
    .workshops-section h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
    }
    
    .workshops-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .workshop-item {
      background: white;
      padding: 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 1.5rem;
      border-left: 6px solid transparent;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .workshop-item::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .workshop-item:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    }
    
    .workshop-item:hover::before {
      opacity: 1;
    }
    
    .workshop-item.in-progress { 
      border-left-color: #ef4444; 
      background: linear-gradient(135deg, #fef2f2, #ffffff);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
    }
    .workshop-item.upcoming-soon { 
      border-left-color: #f59e0b; 
      background: linear-gradient(135deg, #fffbeb, #ffffff);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
    }
    .workshop-item.upcoming { 
      border-left-color: #10b981; 
      background: linear-gradient(135deg, #f0fdf4, #ffffff);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    }
    .workshop-item.scheduled { 
      border-left-color: #6b7280; 
      background: linear-gradient(135deg, #f9fafb, #ffffff);
      box-shadow: 0 4px 20px rgba(107, 114, 128, 0.2);
    }
    
    .status-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 90px;
      padding: 0.75rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }
    
    .status-indicator:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
    
    .status-icon {
      font-size: 1.75rem;
      margin-bottom: 0.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
    
    .status-text {
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1.2;
    }
    
    .status-indicator.in-progress .status-text { 
      color: #ffffff; 
      background: linear-gradient(135deg, #ef4444, #dc2626);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
      position: relative;
      overflow: hidden;
      animation: pulse-red 2s infinite;
    }
    
    @keyframes pulse-red {
      0%, 100% { box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
      50% { box-shadow: 0 4px 25px rgba(239, 68, 68, 0.7), 0 0 15px rgba(239, 68, 68, 0.3); }
    }
    
    .status-indicator.upcoming-soon .status-text { 
      color: #ffffff; 
      background: linear-gradient(135deg, #f59e0b, #d97706);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
      position: relative;
      overflow: hidden;
      animation: pulse-orange 2s infinite;
    }
    
    @keyframes pulse-orange {
      0%, 100% { box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4); }
      50% { box-shadow: 0 4px 25px rgba(245, 158, 11, 0.7), 0 0 15px rgba(245, 158, 11, 0.3); }
    }
    
    .status-indicator.upcoming .status-text { 
      color: #ffffff; 
      background: linear-gradient(135deg, #10b981, #059669);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
      position: relative;
      overflow: hidden;
      animation: pulse-green 2s infinite;
    }
    
    @keyframes pulse-green {
      0%, 100% { box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4); }
      50% { box-shadow: 0 4px 25px rgba(16, 185, 129, 0.7), 0 0 15px rgba(16, 185, 129, 0.3); }
    }
    
    .status-indicator.scheduled .status-text { 
      color: #ffffff; 
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      padding: 0.5rem 1rem;
      border-radius: 25px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      position: relative;
      overflow: hidden;
      animation: pulse-blue 2s infinite;
    }
    
    @keyframes pulse-blue {
      0%, 100% { box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 4px 25px rgba(99, 102, 241, 0.7), 0 0 15px rgba(99, 102, 241, 0.3); }
    }
    
    .status-text::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      animation: status-shimmer 3s infinite;
    }
    
    @keyframes status-shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .workshop-info {
      flex: 1;
    }
    
    .workshop-info h4 {
      margin: 0 0 0.75rem 0;
      color: #1f2937;
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #1f2937, #374151);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .workshop-info p {
      margin: 0 0 1rem 0;
      color: #6b7280;
      font-size: 0.95rem;
      line-height: 1.5;
      font-weight: 500;
    }
    
    .countdown {
      margin-bottom: 1rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(15px);
      position: relative;
      overflow: hidden;
      animation: glow 3s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      0% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); }
      100% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.7), 0 0 20px rgba(102, 126, 234, 0.3); }
    }
    
    .countdown::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      animation: shimmer 3s infinite;
    }
    
    @keyframes shimmer {
      0% { left: -100%; }
      100% { left: 100%; }
    }
    
    .countdown-label {
      font-size: 0.9rem;
      color: #ffffff;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .countdown-label::before {
      content: '⏰';
      font-size: 1.2rem;
      animation: bounce 2s infinite;
    }
    
    @keyframes bounce {
      0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-3px); }
      60% { transform: translateY(-2px); }
    }
    
    .countdown-time {
      font-size: 1.4rem;
      color: #ffffff;
      font-weight: 900;
      text-shadow: 0 3px 6px rgba(0, 0, 0, 0.4);
      font-family: 'Segoe UI', 'Arial', monospace;
      letter-spacing: 2px;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }
    
    .workshop-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.85rem;
      color: #6b7280;
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    
    .workshop-meta span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      background: linear-gradient(135deg, #f8fafc, #f1f5f9);
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .workshop-meta span:hover {
      background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .btn-join {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      cursor: pointer;
      min-width: 120px;
      font-size: 0.9rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    
    .btn-join::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }
    
    .btn-join:hover::before {
      width: 300px;
      height: 300px;
    }
    
    .btn-join:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
    
    .btn-join:active {
      transform: translateY(0);
    }
    
    .btn-join:disabled {
      background: linear-gradient(135deg, #9ca3af, #6b7280);
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
    }
    
    .btn-secondary {
      background: #6b7280;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 0.25rem;
      cursor: pointer;
    }
  `]
})
export class JoinWorkshopModalComponent {
  @Input() isVisible = false;
  @Input() organizationData: OrganizationData | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() workshopJoined = new EventEmitter<Workshop>();

  workshops: Workshop[] = [
    {
      id: '1',
      title: 'Digital Teaching Methods',
      description: 'Learn modern digital teaching techniques',
      date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      time: '2:00 PM',
      participants: 25,
      maxParticipants: 50
    },
    {
      id: '2',
      title: 'Student Assessment Strategies',
      description: 'Effective methods for student evaluation',
      date: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
      time: '10:00 AM',
      participants: 15,
      maxParticipants: 30
    },
    {
      id: '3',
      title: 'Classroom Management',
      description: 'Best practices for classroom organization',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      time: '3:00 PM',
      participants: 40,
      maxParticipants: 60
    }
  ];

  closeModal(): void {
    this.close.emit();
  }

  getServiceDurationLabel(duration: ServiceDuration): string {
    const durationMap: Record<ServiceDuration, string> = {
      [ServiceDuration.ONE_MONTH]: '1 Month',
      [ServiceDuration.THREE_MONTHS]: '3 Months',
      [ServiceDuration.SIX_MONTHS]: '6 Months',
      [ServiceDuration.ONE_YEAR]: '1 Year',
      [ServiceDuration.TWO_YEARS]: '2 Years',
      [ServiceDuration.THREE_YEARS]: '3 Years',
      [ServiceDuration.FOUR_YEARS]: '4 Years',
      [ServiceDuration.FIVE_YEARS]: '5 Years',
      [ServiceDuration.FIVE_PLUS]: '5+ Years'
    };
    return durationMap[duration] || String(duration);
  }

  getWorkshopStatusClass(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return 'in-progress';
    if (this.isUpcomingSoon(workshop)) return 'upcoming-soon';
    if (this.isUpcoming(workshop)) return 'upcoming';
    return 'scheduled';
  }

  getStatusIndicatorClass(workshop: Workshop): string {
    return this.getWorkshopStatusClass(workshop);
  }

  getStatusIcon(workshop: Workshop): string {
    if (this.isWorkshopInProgress(workshop)) return '🔴';
    if (this.isUpcomingSoon(workshop)) return '🟡';
    if (this.isUpcoming(workshop)) return '🟢';
    return '⚪';
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
    return timeDiff >= 0 && timeDiff <= (2 * 60 * 60 * 1000);
  }

  isUpcomingSoon(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = workshopTime - now;
    return timeDiff > 0 && timeDiff <= (2 * 60 * 60 * 1000);
  }

  isUpcoming(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    const timeDiff = workshopTime - now;
    return timeDiff > (2 * 60 * 60 * 1000) && timeDiff <= (24 * 60 * 60 * 1000);
  }

  isWorkshopPast(workshop: Workshop): boolean {
    const now = new Date().getTime();
    const workshopTime = new Date(workshop.date).getTime();
    return (now - workshopTime) > (2 * 60 * 60 * 1000);
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
    return 'Join';
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
    this.workshopJoined.emit(workshop);
  }
}