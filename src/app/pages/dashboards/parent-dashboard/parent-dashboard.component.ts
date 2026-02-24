import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../services/authServices/auth.service';
import Swal from 'sweetalert2';

interface Child {
  id: string;
  name: string;
  grade: string;
  profilePicture: string;
  overallGrade: number;
  attendancePercentage: number;
}

interface SubjectGrade {
  subject: string;
  grade: number;
  teacher: string;
  lastAssignment: string;
  trend: 'up' | 'down' | 'stable';
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: Date;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
  teacher: string;
}

interface TeacherCommunication {
  teacherId: string;
  teacherName: string;
  subject: string;
  lastMessage: string;
  lastMessageDate: Date;
  unreadCount: number;
  inquiryCount: number;
  canEscalate: boolean;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: Date;
  type: 'academic' | 'event' | 'urgent';
  from: string;
}

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrls: ['./parent-dashboard.component.css']
})
export class ParentDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Parent Profile
  parentName = 'Sarah Johnson';
  parentEmail = 'sarah.johnson@email.com';
  
  // Children Data
  children: Child[] = [
    {
      id: '1',
      name: 'Emma Johnson',
      grade: 'Grade 10',
      profilePicture: '',
      overallGrade: 87,
      attendancePercentage: 94
    },
    {
      id: '2',
      name: 'Michael Johnson',
      grade: 'Grade 8',
      profilePicture: '',
      overallGrade: 82,
      attendancePercentage: 89
    },
    {
      id: '3',
      name: 'Sophie Johnson',
      grade: 'Grade 6',
      profilePicture: '',
      overallGrade: 91,
      attendancePercentage: 96
    }
  ];
  
  selectedChild: Child = this.children[0];
  
  // Academic Performance
  subjectGrades: SubjectGrade[] = [
    { subject: 'Mathematics', grade: 92, teacher: 'Mr. Smith', lastAssignment: 'Algebra Test', trend: 'up' },
    { subject: 'Physics', grade: 88, teacher: 'Ms. Johnson', lastAssignment: 'Lab Report', trend: 'stable' },
    { subject: 'Chemistry', grade: 85, teacher: 'Dr. Brown', lastAssignment: 'Chemical Bonds', trend: 'down' },
    { subject: 'English', grade: 90, teacher: 'Mrs. Davis', lastAssignment: 'Essay Writing', trend: 'up' },
    { subject: 'History', grade: 82, teacher: 'Mr. Wilson', lastAssignment: 'World War II', trend: 'stable' }
  ];
  
  // Assignments
  assignments: Assignment[] = [
    {
      id: '1',
      title: 'Quadratic Equations Worksheet',
      subject: 'Mathematics',
      dueDate: new Date('2025-01-20T23:59:00'),
      status: 'pending',
      teacher: 'Mr. Smith'
    },
    {
      id: '2',
      title: 'Physics Lab Report',
      subject: 'Physics',
      dueDate: new Date('2025-01-22T17:00:00'),
      status: 'submitted',
      teacher: 'Ms. Johnson'
    },
    {
      id: '3',
      title: 'Essay on World War II',
      subject: 'History',
      dueDate: new Date('2025-01-15T23:59:00'),
      status: 'graded',
      grade: '88%',
      teacher: 'Mr. Wilson'
    }
  ];
  
  // Teacher Communications
  teacherCommunications: TeacherCommunication[] = [
    {
      teacherId: '1',
      teacherName: 'Mr. Smith',
      subject: 'Mathematics',
      lastMessage: 'Alex is doing well in algebra but needs help with geometry.',
      lastMessageDate: new Date('2025-01-15'),
      unreadCount: 2,
      inquiryCount: 3,
      canEscalate: false
    },
    {
      teacherId: '2',
      teacherName: 'Dr. Brown',
      subject: 'Chemistry',
      lastMessage: 'Please discuss Alex\'s lab safety with him.',
      lastMessageDate: new Date('2025-01-10'),
      unreadCount: 0,
      inquiryCount: 6,
      canEscalate: true
    }
  ];
  
  // Announcements
  announcements: Announcement[] = [
    {
      id: '1',
      title: 'Parent-Teacher Conference',
      message: 'Scheduled for January 28th. Please book your slot.',
      date: new Date('2025-01-15'),
      type: 'event',
      from: 'School Administration'
    },
    {
      id: '2',
      title: 'Mid-term Results Available',
      message: 'Mid-term examination results are now available for review.',
      date: new Date('2025-01-14'),
      type: 'academic',
      from: 'Academic Office'
    }
  ];
  
  // Modal States
  isCommunicationModalOpen = false;
  isEscalationModalOpen = false;
  isReportModalOpen = false;
  selectedTeacher: TeacherCommunication | null = null;
  
  // Forms
  messageForm: FormGroup;
  escalationForm: FormGroup;
  
  // Quick Stats
  totalSubjects = this.subjectGrades.length;
  pendingAssignments = this.assignments.filter(a => a.status === 'pending').length;
  unreadMessages = this.teacherCommunications.reduce((sum, tc) => sum + tc.unreadCount, 0);
  
  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.messageForm = this.fb.group({
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
    
    this.escalationForm = this.fb.group({
      reason: ['', Validators.required],
      details: ['', [Validators.required, Validators.minLength(20)]]
    });
  }

  ngOnInit(): void {
    this.loadParentDashboard();
    this.loadChildData(this.selectedChild.id); // Load data for initially selected child
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadParentDashboard(): void {
    // Load parent and children data from localStorage or API
    if (typeof localStorage !== 'undefined') {
      const parentProfile = JSON.parse(localStorage.getItem('parentProfile') || '{}');
      if (parentProfile.name) {
        this.parentName = parentProfile.name;
        this.parentEmail = parentProfile.email;
      }
    }
  }

  selectChild(child: Child): void {
    this.selectedChild = child;
    // Reload data for selected child
    this.loadChildData(child.id);
  }

  private loadChildData(childId: string): void {
    // Load specific child's academic data based on selected child
    const childDataMap: { [key: string]: any } = {
      '1': {
        subjectGrades: [
          { subject: 'Mathematics', grade: 92, teacher: 'Mr. Smith', lastAssignment: 'Algebra Test', trend: 'up' },
          { subject: 'Physics', grade: 88, teacher: 'Ms. Johnson', lastAssignment: 'Lab Report', trend: 'stable' },
          { subject: 'Chemistry', grade: 85, teacher: 'Dr. Brown', lastAssignment: 'Chemical Bonds', trend: 'down' },
          { subject: 'English', grade: 90, teacher: 'Mrs. Davis', lastAssignment: 'Essay Writing', trend: 'up' }
        ],
        assignments: [
          { id: '1', title: 'Quadratic Equations', subject: 'Mathematics', dueDate: new Date('2025-01-20'), status: 'pending', teacher: 'Mr. Smith' },
          { id: '2', title: 'Physics Lab Report', subject: 'Physics', dueDate: new Date('2025-01-22'), status: 'submitted', teacher: 'Ms. Johnson' }
        ]
      },
      '2': {
        subjectGrades: [
          { subject: 'Mathematics', grade: 78, teacher: 'Mr. Anderson', lastAssignment: 'Fractions Test', trend: 'up' },
          { subject: 'English', grade: 85, teacher: 'Ms. Taylor', lastAssignment: 'Book Report', trend: 'stable' },
          { subject: 'Science', grade: 80, teacher: 'Dr. Lee', lastAssignment: 'Plant Study', trend: 'up' },
          { subject: 'Geography', grade: 82, teacher: 'Mr. Clark', lastAssignment: 'Map Reading', trend: 'stable' }
        ],
        assignments: [
          { id: '3', title: 'Geometry Problems', subject: 'Mathematics', dueDate: new Date('2025-01-18'), status: 'pending', teacher: 'Mr. Anderson' },
          { id: '4', title: 'Book Review', subject: 'English', dueDate: new Date('2025-01-25'), status: 'submitted', teacher: 'Ms. Taylor' }
        ]
      },
      '3': {
        subjectGrades: [
          { subject: 'Mathematics', grade: 95, teacher: 'Mrs. White', lastAssignment: 'Addition Quiz', trend: 'up' },
          { subject: 'English', grade: 88, teacher: 'Ms. Green', lastAssignment: 'Reading Test', trend: 'stable' },
          { subject: 'Science', grade: 92, teacher: 'Mr. Blue', lastAssignment: 'Animal Study', trend: 'up' },
          { subject: 'Art', grade: 90, teacher: 'Ms. Red', lastAssignment: 'Drawing Project', trend: 'stable' }
        ],
        assignments: [
          { id: '5', title: 'Math Worksheet', subject: 'Mathematics', dueDate: new Date('2025-01-19'), status: 'graded', grade: '95%', teacher: 'Mrs. White' },
          { id: '6', title: 'Science Project', subject: 'Science', dueDate: new Date('2025-01-21'), status: 'pending', teacher: 'Mr. Blue' }
        ]
      }
    };

    const childData = childDataMap[childId];
    if (childData) {
      this.subjectGrades = childData.subjectGrades;
      this.assignments = childData.assignments;
      this.updateQuickStats();
    }
  }

  private updateQuickStats(): void {
    this.totalSubjects = this.subjectGrades.length;
    this.pendingAssignments = this.assignments.filter(a => a.status === 'pending').length;
  }

  getGradeClass(grade: number): string {
    if (grade >= 90) return 'excellent';
    if (grade >= 80) return 'good';
    if (grade >= 70) return 'average';
    return 'needs-improvement';
  }

  getTrendIcon(trend: string): string {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  }

  getAssignmentStatusClass(status: string): string {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'submitted': return 'status-submitted';
      case 'graded': return 'status-graded';
      default: return '';
    }
  }

  openCommunication(teacher: TeacherCommunication): void {
    this.selectedTeacher = teacher;
    this.isCommunicationModalOpen = true;
    this.messageForm.patchValue({
      subject: `Inquiry about ${this.selectedChild.name} - ${teacher.subject}`
    });
  }

  closeCommunicationModal(): void {
    this.isCommunicationModalOpen = false;
    this.selectedTeacher = null;
    this.messageForm.reset();
  }

  sendMessage(): void {
    if (this.messageForm.valid && this.selectedTeacher) {
      const formData = this.messageForm.value;
      
      // Increment inquiry count
      this.selectedTeacher.inquiryCount++;
      
      // Check if escalation should be enabled
      if (this.selectedTeacher.inquiryCount >= 5) {
        this.selectedTeacher.canEscalate = true;
      }
      
      Swal.fire({
        title: 'Message Sent!',
        text: `Your message has been sent to ${this.selectedTeacher.teacherName}.`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
      
      this.closeCommunicationModal();
    }
  }

  escalateToAdmin(teacher: TeacherCommunication): void {
    this.selectedTeacher = teacher;
    this.isEscalationModalOpen = true;
  }

  closeEscalationModal(): void {
    this.isEscalationModalOpen = false;
    this.selectedTeacher = null;
    this.escalationForm.reset();
  }

  submitEscalation(): void {
    if (this.escalationForm.valid && this.selectedTeacher) {
      Swal.fire({
        title: 'Matter Escalated',
        text: 'Your concern has been escalated to the administration with chat history as evidence.',
        icon: 'info',
        confirmButtonText: 'OK'
      });
      
      this.closeEscalationModal();
    }
  }

  viewFullReport(): void {
    this.isReportModalOpen = true;
  }

  closeReportModal(): void {
    this.isReportModalOpen = false;
  }

  downloadReport(): void {
    Swal.fire({
      title: 'Downloading Report',
      text: 'Academic report is being prepared for download.',
      icon: 'info',
      timer: 2000,
      showConfirmButton: false
    });
  }

  scheduleParentTeacherMeeting(): void {
    Swal.fire({
      title: 'Schedule Meeting',
      text: 'Redirecting to meeting scheduler...',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  viewAttendanceDetails(): void {
    Swal.fire({
      title: 'Attendance Details',
      html: `
        <div style="text-align: left;">
          <p><strong>Present:</strong> 142 days</p>
          <p><strong>Absent:</strong> 8 days</p>
          <p><strong>Late:</strong> 3 days</p>
          <p><strong>Total School Days:</strong> 153 days</p>
          <p><strong>Attendance Rate:</strong> ${this.selectedChild.attendancePercentage}%</p>
        </div>
      `,
      confirmButtonText: 'Close'
    });
  }

  viewTimetable(): void {
    this.router.navigate(['/timetable'], { queryParams: { childId: this.selectedChild.id } });
  }

  openLibrary(): void {
    this.router.navigate(['/library'], { queryParams: { childId: this.selectedChild.id } });
  }

  viewAllAnnouncements(): void {
    const announcementsHtml = this.announcements.map(announcement => 
      `<div style="padding: 15px; border-bottom: 1px solid #eee; text-align: left;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          <strong>${announcement.title}</strong>
          <span style="margin-left: auto; font-size: 12px; color: #666;">${announcement.date.toLocaleDateString()}</span>
        </div>
        <p style="margin: 0; color: #666;">${announcement.message}</p>
        <small style="color: #999;">From: ${announcement.from}</small>
      </div>`
    ).join('');
    
    Swal.fire({
      title: 'All Announcements',
      html: `<div style="max-height: 400px; overflow-y: auto;">${announcementsHtml}</div>`,
      width: 700,
      confirmButtonText: 'Close'
    });
  }

  logout(): void {
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  settings(): void {
    this.router.navigate(['/parent-settings']);
  }

  getParentInitials(): string {
    return this.parentName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString();
  }
}