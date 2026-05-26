import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StudentDashboardService } from '../../../services/studentServices/student-dashboard.service';
import { CommunicationService } from '../../../services/communication/communication.service';
import { StudentDashboardApiResponse } from '../../../interfaces/student-dashboard-api';
import { StudentAcademicProgress } from '../../../interfaces/student-academic-progress';
import { AiAssistantComponent } from '../../../components/ai-assistant/ai-assistant.component';
import { SettingsService } from '../../../services/settings/settings.service';
import Swal from 'sweetalert2';

interface SubjectGrade {
  subject: string;
  grade: string;
  percentage: number;
  color: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success';
}

interface ScheduleItem {
  time: string;
  subject: string;
  teacher: string;
  room: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  startTime?: string;
  endTime?: string;
  location: string;
  eventType?: string;
}

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, AiAssistantComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css'
})
export class StudentDashboardComponent implements OnInit {
  studentName: string = '';
  studentProfilePicture: string = '';
  overallGrade: number = 0;
  selectedTerm: string = 'current';
  availableTerms: string[] = ['current'];
  todaySchedule: ScheduleItem[] = [];
  subjectGrades: SubjectGrade[] = [];
  assignmentTab: 'pending' | 'submitted' | 'graded' = 'pending';
  assignments: Assignment[] = [];
  announcements: Announcement[] = [];
  announcementsPage: number = 1;
  announcementsPageSize: number = 5;
  announcementsCount: number = 0;
  upcomingEvents: Event[] = [];
  attendancePercentage: number = 0;
  dailyAttendance = { present: 0, absent: 0, percentage: 0 };
  weeklyAttendance = { present: 0, absent: 0, percentage: 0 };
  monthlyAttendance = { present: 0, absent: 0, percentage: 0 };
  yearlyAttendance = { present: 0, absent: 0, percentage: 0 };
  messagesCount: number = 0;
  studentId: string = '';
  isLoading: boolean = true;
  imageError: boolean = false;
  showAssignmentModal: boolean = false;
  showSubmissionModal: boolean = false;
  selectedAssignment: Assignment | null = null;
  selectedFile: File | null = null;
  isSubmitting: boolean = false;
  scheduleCurrentPage: number = 1;
  scheduleTotalPages: number = 1;
  assignmentsCurrentPage: number = 1;
  assignmentsTotalPages: number = 1;
  attendanceStats = { present: 0, absent: 0, late: 0 };
  quickActions = [
    { icon: '📚', label: 'Library', action: 'library' },
    { icon: '💬', label: 'Messages', action: 'messages' },
    { icon: '📊', label: 'Grades', action: 'grades' },
    { icon: '🎥', label: 'Join Class', action: 'joinclass' },
    { icon: '➕', label: 'Enroll Subject', action: 'enroll' },
    { icon: '📝', label: 'My Subjects', action: 'mysubjects' },
    { icon: '🎬', label: 'My Videos', action: 'myvideos' },
    { icon: '⚙️', label: 'Settings', action: 'settings' }
  ];
  recentAnnouncements: any[] = [];
  showSubjectEnrollmentModal: boolean = false;
  showGradesModal: boolean = false;
  showJoinClassModal: boolean = false;
  showMySubjectsModal: boolean = false;
  mySubjects: any[] = [];
  availableSubjects: any[] = [];
  filteredSubjects: any[] = [];
  selectedSubjects: Set<string> = new Set();
  searchQuery: string = '';
  subjectPage: number = 1;
  subjectPageSize: number = 6;
  organizationId: string = '';
  studentGrade: string = '';
  upcomingSessions: any[] = [];
  showMyVideosModal: boolean = false;
  studentVideos: any[] = [];
  isLoadingVideos: boolean = false;

  constructor(
    private router: Router,
    private studentDashboardService: StudentDashboardService,
    private communicationService: CommunicationService,
    private settingsService: SettingsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const studentProfileStr = localStorage.getItem('studentProfile');
      
      if (studentProfileStr) {
        const studentProfile = JSON.parse(studentProfileStr);
        this.studentId = studentProfile.studentId;
        this.studentName = `${studentProfile.firstName} ${studentProfile.lastName}`;
        this.organizationId = studentProfile.organizationId || localStorage.getItem('organizationId') || '';
        this.studentGrade = this.extractGrade(studentProfile.grade || '');
        
        if (studentProfile.studentProfilePicture) {
          const profilePic = studentProfile.studentProfilePicture;
          if (profilePic.startsWith('data:')) {
            this.studentProfilePicture = profilePic;
          } else if (profilePic.startsWith('http')) {
            this.studentProfilePicture = profilePic;
          } else {
            this.studentProfilePicture = `data:image/jpeg;base64,${profilePic}`;
          }
        }
      } else {
        // studentProfile not in localStorage — cannot proceed without a valid studentId GUID
        console.warn('No studentProfile found in localStorage. Please log in again.');
        this.router.navigate(['/login']);
        return;
      }
      
      if (this.studentId) {
        this.loadDashboardData();
        this.loadStudentAssignments();
        this.loadAcademicProgress();
        this.loadUnreadMessageCount();
        this.loadUpcomingSessions();
        this.loadBroadcastAnnouncements();
        this.loadStudentSchedule();
        this.loadStudentAttendance();
      }
      
      // Subscribe to unread count changes from communication service
      this.communicationService.unreadCount$.subscribe(count => {
        this.messagesCount = count;
      });
    }
  }

  loadStudentAssignments(): void {
    this.studentDashboardService.getStudentAssignments(this.studentId).subscribe({
      next: (data: any[]) => {
        if (!Array.isArray(data)) return;
        this.assignments = data.map(a => {
          let status: 'pending' | 'submitted' | 'graded' = 'pending';
          if (a.assignmentCompleted || a.assignmentMarksObtained > 0 || a.isGraded) {
            status = 'graded';
          } else if (a.assignmentIsSubmitted || a.isSubmitted) {
            status = 'submitted';
          }
          return {
            id: a.assignmentId,
            title: a.assignmentTitle || a.title || 'Untitled',
            subject: a.assignmentSubject || a.subject || '',
            dueDate: a.assignmentDueDate || a.dueDate || '',
            status,
            grade: a.assignmentMarksObtained ? `${a.assignmentMarksObtained}/${a.assignmentTotalMarks}` : undefined
          };
        });
      },
      error: (error) => console.error('Error loading student assignments:', error)
    });
  }

  loadUpcomingSessions(): void {
    this.studentDashboardService.getStudentUpcomingSessions(this.studentId).subscribe({
      next: (sessions) => {
        this.upcomingSessions = sessions.filter(s => !s.isDeleted);
      },
      error: (error) => {
        console.error('Error loading upcoming sessions:', error);
      }
    });
  }

  loadDashboardData(): void {
    this.studentDashboardService.getStudentDashboardData(this.studentId).subscribe({
      next: (data: StudentDashboardApiResponse[]) => {
        if (data.length > 0) {
          const firstRecord = data[0];
          this.studentName = 'Student';
          this.attendancePercentage = firstRecord.isPresent ? 100 : 0;
        }
        
        this.processAssignments(data);
        this.processAnnouncements(data);
        this.loadOrganizationEvents();
        this.processSchedule(data);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
      }
    });
  }

  loadUnreadMessageCount(): void {
    this.communicationService.getIndividualMessages(this.studentId).subscribe({
      next: (messages) => {
        this.messagesCount = messages.filter(m => !m.isRead && m.recipientId === this.studentId).length;
      },
      error: (error) => {
        console.error('Error loading unread messages:', error);
        this.messagesCount = 0;
      }
    });
  }

  loadAcademicProgress(): void {
    this.studentDashboardService.getStudentAcademicProgress(this.studentId).subscribe({
      next: (data: StudentAcademicProgress[]) => {
        // Get unique terms and add to dropdown
        const terms = [...new Set(data.map(d => d.schoolTerm))].sort();
        this.availableTerms = ['current', ...terms];
        
        this.processSubjectGrades(data);
      },
      error: (error) => {
        console.error('Error loading academic progress:', error);
      }
    });
  }

  processSubjectGrades(data: StudentAcademicProgress[]): void {
    let termData: StudentAcademicProgress[];
    
    if (this.selectedTerm === 'current') {
      termData = data.filter(item => item.isCurrentTerm);
    } else {
      termData = data.filter(item => item.schoolTerm === this.selectedTerm);
    }
    
    this.subjectGrades = termData.map(item => ({
      subject: item.subject,
      grade: `${item.percentage}%`,
      percentage: item.percentage,
      color: this.getGradeColor(item.percentage)
    }));
    
    if (this.subjectGrades.length > 0) {
      this.overallGrade = Math.round(this.subjectGrades.reduce((sum, g) => sum + g.percentage, 0) / this.subjectGrades.length);
    }
    
    // Save current term data to localStorage for historical reference
    if (this.selectedTerm === 'current' && termData.length > 0) {
      const currentTermName = termData[0].schoolTerm;
      const storageKey = `student_${this.studentId}_term_${currentTermName}`;
      localStorage.setItem(storageKey, JSON.stringify({
        term: currentTermName,
        grades: this.subjectGrades,
        overall: this.overallGrade,
        savedAt: new Date().toISOString()
      }));
    }
  }

  processAssignments(data: StudentDashboardApiResponse[]): void {
    const uniqueAssignments = new Map<string, Assignment>();
    const subjectMarks = new Map<string, { total: number, obtained: number, count: number }>();
    
    data.forEach(d => {
      if (d.assignmentId && d.assignmentId !== '00000000-0000-0000-0000-000000000000') {
        let status: 'pending' | 'submitted' | 'graded' = 'pending';
        
        // Use the boolean flags from API to determine status
        if (d.assignmentCompleted || d.assignmentMarksObtained > 0) {
          status = 'graded';
        } else if (d.assignmentIsSubmitted) {
          status = 'submitted';
        } else if (d.assignmentIsPending) {
          status = 'pending';
        }
        
        uniqueAssignments.set(d.assignmentId, {
          id: d.assignmentId,
          title: d.assignmentTitle,
          subject: d.assignmentSubject,
          dueDate: d.assignmentDueDate,
          status: status,
          grade: d.assignmentMarksObtained ? `${d.assignmentMarksObtained}/${d.assignmentTotalMarks}` : undefined
        });
        
        // Calculate subject averages from graded assignments
        if (d.assignmentMarksObtained > 0 && d.assignmentTotalMarks > 0) {
          const subject = d.assignmentSubject;
          if (!subjectMarks.has(subject)) {
            subjectMarks.set(subject, { total: 0, obtained: 0, count: 0 });
          }
          const marks = subjectMarks.get(subject)!;
          marks.total += d.assignmentTotalMarks;
          marks.obtained += d.assignmentMarksObtained;
          marks.count++;
        }
      }
    });
    
    this.assignments = Array.from(uniqueAssignments.values());
    
    // Calculate subject grades from assignment marks
    const calculatedGrades: SubjectGrade[] = [];
    subjectMarks.forEach((marks, subject) => {
      let percentage = (marks.obtained / marks.total) * 100;
      
      // If percentage exceeds 100%, normalize it by dividing by 2
      if (percentage > 100) {
        percentage = percentage / 2;
      }
      
      percentage = Math.min(100, Math.round(percentage));
      
      calculatedGrades.push({
        subject: subject,
        grade: `${percentage}%`,
        percentage: percentage,
        color: this.getGradeColor(percentage)
      });
    });
    
    // If we have calculated grades from assignments, use them
    if (calculatedGrades.length > 0) {
      this.subjectGrades = calculatedGrades;
      this.overallGrade = Math.min(100, Math.round(calculatedGrades.reduce((sum, g) => sum + g.percentage, 0) / calculatedGrades.length));
    }
  }

  processAnnouncements(data: StudentDashboardApiResponse[]): void {
    // This method is now deprecated - announcements come from broadcast messages
  }

  loadBroadcastAnnouncements(): void {
    this.communicationService.getBroadcastMessages('student').subscribe({
      next: (broadcasts) => {
        // Convert broadcast messages to announcements and sort by latest first
        this.announcements = broadcasts
          .map(msg => ({
            id: msg.messageId || '',
            title: msg.subject || 'Announcement',
            message: msg.content || '',
            date: msg.timeStamp || '',
            type: 'info' as const
          }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.announcementsCount = this.announcements.length;
      },
      error: (error) => {
        console.error('Error loading broadcast announcements:', error);
      }
    });
  }

  processEvents(data: StudentDashboardApiResponse[]): void {
    // Deprecated - now using loadOrganizationEvents
  }

  loadOrganizationEvents(): void {
    if (!this.organizationId) return;
    this.studentDashboardService.getOrganizationEvents(this.organizationId).subscribe({
      next: (events) => {
        this.upcomingEvents = events.map((e: any) => ({
          id: e.eventId,
          title: e.title,
          description: e.description,
          date: e.startTime,
          time: '',
          startTime: new Date(e.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
          endTime: new Date(e.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
          location: e.location || 'TBA',
          eventType: e.eventType
        }));
      },
      error: (error) => console.error('Failed to load events:', error)
    });
  }

  loadStudentSchedule(): void {
    this.studentDashboardService.getStudentSchedule(this.studentId).subscribe({
      next: (timetableData) => {
        console.log('Timetable data from API:', timetableData);
        console.log('Total records received:', timetableData?.length || 0);
        
        if (Array.isArray(timetableData) && timetableData.length > 0) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          console.log('Today\'s date:', todayStr);
          
          // Filter for today's classes
          const todayClasses = timetableData.filter(item => {
            if (!item.date) return false;
            // Extract date from ISO string (handles both "2026-02-23" and "2026-02-23T00:00:00")
            const classDate = item.date.split('T')[0];
            console.log('Comparing:', classDate, 'with', todayStr, '=', classDate === todayStr);
            return classDate === todayStr;
          });
          
          console.log('Today\'s classes found:', todayClasses.length);
          
          this.todaySchedule = todayClasses.map(item => ({
            time: `${item.startTime?.substring(0, 5) || ''} - ${item.endTime?.substring(0, 5) || ''}`,
            subject: item.subject || '',
            teacher: `${item.teacherFirstNames || ''} ${item.teacherLastName || ''}`.trim(),
            room: item.classRoomNumber || ''
          }));
          
          console.log('Processed schedule:', this.todaySchedule);
        } else {
          console.warn('No timetable data received or empty array');
          this.todaySchedule = [];
        }
      },
      error: (error) => {
        console.error('Error loading student schedule:', error);
        this.todaySchedule = [];
      }
    });
  }

  refreshSchedule(): void {
    this.loadStudentSchedule();
    Swal.fire({
      icon: 'success',
      title: 'Schedule Refreshed',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000
    });
  }

  processSchedule(data: StudentDashboardApiResponse[]): void {
    // Fallback method - only used if dedicated schedule API fails
    if (this.todaySchedule.length > 0) return;
    
    const scheduleItems: ScheduleItem[] = [];
    data.forEach(d => {
      if (d.classSubject && d.classStartTime) {
        scheduleItems.push({
          time: `${d.classStartTime} - ${d.classEndTime}`,
          subject: d.classSubject,
          teacher: `${d.teacherFirstNames} ${d.teacherLastName}`,
          room: d.classRoomNumber
        });
      }
    });
    this.todaySchedule = scheduleItems;
  }



  calculateGrade(percentage: number): string {
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  }

  getGradeColor(percentage: number): string {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 70) return '#3b82f6';
    if (percentage >= 60) return '#f59e0b';
    if (percentage >= 50) return '#ef4444';
    return '#dc2626';
  }

  getHeaderSubtitle(): string {
    return `Overall Grade: ${this.overallGrade}% | Attendance: ${this.attendancePercentage}%`;
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  onTermChange(): void {
    this.loadAcademicProgress();
  }

  get filteredAssignments(): Assignment[] {
    return this.assignments.filter(a => a.status === this.assignmentTab);
  }

  setAssignmentTab(tab: 'pending' | 'submitted' | 'graded'): void {
    this.assignmentTab = tab;
  }

  openAssignmentModal(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.showAssignmentModal = true;
  }

  closeAssignmentModal(): void {
    this.showAssignmentModal = false;
    // Keep selectedAssignment - don't clear it!
  }

  submitAssignment(): void {
    console.log('submitAssignment called, keeping selectedAssignment:', this.selectedAssignment);
    this.closeAssignmentModal();
    setTimeout(() => {
      console.log('Opening submission modal, selectedAssignment still:', this.selectedAssignment);
      this.showSubmissionModal = true;
    }, 300);
  }

  closeSubmissionModal(): void {
    this.showSubmissionModal = false;
    this.selectedAssignment = null;
    this.selectedFile = null;
  }

  onFileSelected(event: any): void {
    console.log('File selection event triggered:', event);
    const file = event.target.files[0];
    console.log('Selected file:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
        console.log('PDF file accepted. selectedFile is now:', this.selectedFile);
      } else {
        console.warn('Invalid file type:', file.type);
        Swal.fire('Invalid File', 'Please select a PDF file', 'warning');
      }
    } else {
      console.error('No file selected from event');
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        this.selectedFile = file;
      } else {
        Swal.fire('Invalid File', 'Please select a PDF file', 'warning');
      }
    }
  }

  async confirmSubmission(): Promise<void> {
    console.log('confirmSubmission called');
    console.log('selectedFile:', this.selectedFile);
    console.log('selectedAssignment:', this.selectedAssignment);
    
    if (!this.selectedFile || !this.selectedAssignment) {
      console.error('Validation failed:', {
        hasFile: !!this.selectedFile,
        hasAssignment: !!this.selectedAssignment
      });
      Swal.fire('Error', 'Please select a file to submit', 'error');
      return;
    }

    this.isSubmitting = true;
    console.log('Starting file conversion to base64...');

    try {
      const base64 = await this.fileToBase64(this.selectedFile);
      console.log('Base64 conversion successful, length:', base64.length);
      
      const submissionData = {
        assignmentSubmissionId: '00000000-0000-0000-0000-000000000000',
        assignmentId: this.selectedAssignment.id,
        studentId: this.studentId,
        assignmentPdfSubmission: base64,
        submissionDate: new Date().toISOString(),
        isPending: true,
        isCompleted: false
      };
      
      console.log('Submission data prepared:', {
        ...submissionData,
        assignmentPdfSubmission: `[base64 string of length ${base64.length}]`
      });

      this.studentDashboardService.submitStudentAssignment(submissionData).subscribe({
        next: (response) => {
          console.log('Submission successful:', response);
          this.isSubmitting = false;
          this.selectedFile = null;
          this.closeSubmissionModal();
          Swal.fire('Success', 'Assignment submitted successfully', 'success');
          this.loadDashboardData();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Submission error:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          Swal.fire('Error', 'Failed to submit assignment', 'error');
        }
      });
    } catch (error) {
      this.isSubmitting = false;
      console.error('File processing error:', error);
      Swal.fire('Error', 'Failed to process file', 'error');
    }
  }

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  getStudentInitials(): string {
    return this.studentName.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  settings(): void {
    this.router.navigate(['/student-settings']);
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  openMessages(): void {
    this.router.navigate(['/communication-center']);
  }

  get paginatedTodaySchedule(): ScheduleItem[] {
    return this.todaySchedule;
  }

  get paginatedAssignments(): Assignment[] {
    return this.filteredAssignments;
  }

  getStatusClass(status: string): string {
    return status || '';
  }

  prevSchedulePage(): void {
    if (this.scheduleCurrentPage > 1) this.scheduleCurrentPage--;
  }

  nextSchedulePage(): void {
    if (this.scheduleCurrentPage < this.scheduleTotalPages) this.scheduleCurrentPage++;
  }

  prevAssignmentsPage(): void {
    if (this.assignmentsCurrentPage > 1) this.assignmentsCurrentPage--;
  }

  nextAssignmentsPage(): void {
    if (this.assignmentsCurrentPage < this.assignmentsTotalPages) this.assignmentsCurrentPage++;
  }

  getGradeClass(grade: number): string {
    return grade >= 80 ? 'excellent' : grade >= 60 ? 'good' : 'needs-improvement';
  }

  getPendingCount(): number {
    return this.assignments.filter(a => a.status === 'pending').length;
  }

  getAssignmentClass(assignment: Assignment): string {
    return assignment.status;
  }

  openAssignment(assignment: Assignment): void {
    this.openAssignmentModal(assignment);
  }

  handleQuickAction(action: string): void {
    switch(action) {
      case 'library':
        this.router.navigate(['/library']);
        break;
      case 'messages':
        this.router.navigate(['/communication-center']);
        break;
      case 'grades':
        this.showGradesModal = true;
        break;
      case 'joinclass':
        this.loadUpcomingSessions();
        this.showJoinClassModal = true;
        break;
      case 'enroll':
        this.openSubjectEnrollment();
        break;
      case 'mysubjects':
        this.openMySubjects();
        break;
      case 'myvideos':
        this.openMyVideos();
        break;
      case 'settings':
        this.settings();
        break;
    }
  }

  openSubjectEnrollment(): void {
    this.showSubjectEnrollmentModal = true;
    this.loadAvailableSubjects();
  }

  loadAvailableSubjects(): void {
    if (!this.organizationId) return;

    this.settingsService.getAllStreamsbyOrganizationId(this.organizationId).subscribe({
      next: (streams) => {
        this.availableSubjects = streams.map((s: any) => ({
          teachingClassId: s.streamId,
          gradeStreamId: s.streamId,
          subject: s.streamName,
          gradeStreamName: s.streamName,
          classRoomNumber: '',
          totalStudents: 0,
          teacherId: s.teacherId,
          organizationId: this.organizationId
        }));
        this.applyFilters();
      },
      error: (error) => console.error('Error loading subjects:', error)
    });
  }

  applyFilters(): void {
    let filtered = this.availableSubjects;
    
    if (this.studentGrade) {
      filtered = filtered.filter(s => this.extractGrade(s.gradeStreamName) === this.studentGrade);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.subject.toLowerCase().includes(query) ||
        s.gradeStreamName.toLowerCase().includes(query) ||
        s.classRoomNumber.toLowerCase().includes(query)
      );
    }
    
    this.filteredSubjects = filtered;
  }

  extractGrade(gradeString: string): string {
    const match = gradeString.match(/Grade\s*(\d+)/i);
    return match ? match[1] : '';
  }

  onSearchChange(): void {
    this.subjectPage = 1;
    this.applyFilters();
  }

  get paginatedSubjects(): any[] {
    const start = (this.subjectPage - 1) * this.subjectPageSize;
    const end = start + this.subjectPageSize;
    return this.filteredSubjects.slice(start, end);
  }

  get totalSubjectPages(): number {
    return Math.ceil(this.filteredSubjects.length / this.subjectPageSize);
  }

  prevSubjectPage(): void {
    if (this.subjectPage > 1) this.subjectPage--;
  }

  nextSubjectPage(): void {
    if (this.subjectPage < this.totalSubjectPages) this.subjectPage++;
  }

  toggleSubjectSelection(subject: any): void {
    const studentProfile = JSON.parse(localStorage.getItem('studentProfile') || '{}');
    
    const enrollmentData = {
      studentGradeId: '00000000-0000-0000-0000-000000000000',
      organizationId: subject.organizationId,
      studentId: this.studentId,
      teacherId: subject.teacherId,
      streamGradeId: subject.gradeStreamId,
      teacherFirstNames: '',
      teacherLastName: '',
      studentFirstName: studentProfile.firstName || '',
      studentLastName: studentProfile.lastName || '',
      studentProfilePicture: studentProfile.studentProfilePicture || '',
      subject: subject.subject,
      streamName: subject.gradeStreamName,
      subjectAddedAt: new Date().toISOString()
    };

    this.studentDashboardService.addStudentSubject(enrollmentData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Enrolled!',
          text: `Successfully enrolled in ${subject.subject}`,
          timer: 2000,
          showConfirmButton: false
        });
        this.selectedSubjects.add(subject.teachingClassId);
      },
      error: (error) => {
        console.error('Enrollment error:', error);
        let errorMessage = 'Failed to enroll in subject';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            const match = error.error.match(/Exception: (.+?)(?:\r?\n|$)/);
            errorMessage = match ? match[1] : error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.title) {
            errorMessage = error.error.title;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Enrollment Failed',
          text: errorMessage,
          confirmButtonText: 'OK'
        });
      }
    });
  }

  isSubjectSelected(teachingClassId: string): boolean {
    return this.selectedSubjects.has(teachingClassId);
  }

  closeSubjectEnrollmentModal(): void {
    this.showSubjectEnrollmentModal = false;
    this.selectedSubjects.clear();
    this.searchQuery = '';
    this.subjectPage = 1;
  }

  closeGradesModal(): void {
    this.showGradesModal = false;
  }

  closeJoinClassModal(): void {
    this.showJoinClassModal = false;
  }

  openMySubjects(): void {
    this.showMySubjectsModal = true;
    this.loadMySubjects();
  }

  loadMySubjects(): void {
    this.studentDashboardService.getStudentSubjects(this.studentId).subscribe({
      next: (data) => {
        this.mySubjects = data;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        Swal.fire('Error', 'Failed to load your subjects', 'error');
      }
    });
  }

  closeMySubjectsModal(): void {
    this.showMySubjectsModal = false;
  }

  joinClass(meetingUrl: string): void {
    if (meetingUrl) {
      const sessionWindow = window.open(meetingUrl, '_blank');
      this.closeJoinClassModal();
      this.startInactivityMonitor(sessionWindow);
    } else {
      Swal.fire('Error', 'Meeting URL not available', 'error');
    }
  }

  private inactivityTimer: any;
  private lastActivityTime: number = Date.now();
  private sessionWindow: Window | null = null;

  private startInactivityMonitor(sessionWindow: Window | null): void {
    this.sessionWindow = sessionWindow;
    this.lastActivityTime = Date.now();
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, this.resetInactivityTimer.bind(this), true);
    });

    this.checkInactivity();
  }

  private resetInactivityTimer(): void {
    this.lastActivityTime = Date.now();
  }

  private checkInactivity(): void {
    this.inactivityTimer = setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivityTime;
      const fifteenMinutes = 15 * 60 * 1000;

      if (inactiveTime >= fifteenMinutes) {
        this.showInactivityWarning();
      }
    }, 60000);
  }

  private showInactivityWarning(): void {
    clearInterval(this.inactivityTimer);
    
    Swal.fire({
      title: 'Inactivity Warning',
      text: 'You have been inactive for 15 minutes. Click OK to stay in the session, or you will be logged out.',
      icon: 'warning',
      showCancelButton: false,
      confirmButtonText: 'OK, I\'m here',
      allowOutsideClick: false,
      timer: 30000,
      timerProgressBar: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.lastActivityTime = Date.now();
        this.checkInactivity();
      } else {
        this.logoutFromSession();
      }
    });
  }

  private logoutFromSession(): void {
    if (this.sessionWindow && !this.sessionWindow.closed) {
      this.sessionWindow.close();
    }
    clearInterval(this.inactivityTimer);
    Swal.fire('Session Ended', 'You have been logged out due to inactivity', 'info');
  }

  borrowBook(): void {
    Swal.fire('Success', 'Redirecting to library...', 'success');
    this.router.navigate(['/library']);
  }

  refreshAnnouncements(): void {
    this.loadBroadcastAnnouncements();
  }

  viewAllAnnouncements(): void {
    this.router.navigate(['/announcements']);
  }

  refreshUpcomingEvents(): void {
    this.loadDashboardData();
  }

  onImageError(): void {
    console.error('Failed to load profile image:', this.studentProfilePicture);
    this.imageError = true;
  }

  get paginatedAnnouncements(): Announcement[] {
    const start = (this.announcementsPage - 1) * this.announcementsPageSize;
    const end = start + this.announcementsPageSize;
    return this.announcements.slice(start, end);
  }

  get totalAnnouncementsPages(): number {
    return Math.ceil(this.announcements.length / this.announcementsPageSize);
  }

  prevAnnouncementsPage(): void {
    if (this.announcementsPage > 1) this.announcementsPage--;
  }

  nextAnnouncementsPage(): void {
    if (this.announcementsPage < this.totalAnnouncementsPages) this.announcementsPage++;
  }

  openMyVideos(): void {
    this.showMyVideosModal = true;
    this.loadStudentVideos();
  }

  loadStudentVideos(): void {
    this.isLoadingVideos = true;
    this.studentDashboardService.getStudentVideos(this.studentId).subscribe({
      next: (videos) => {
        this.studentVideos = videos.map(v => ({
          preRecordedVideoId: v.preRecordedVideoId,
          videoTitle: v.videoTitle,
          description: v.description,
          streamName: v.streamName,
          uploadedTime: v.uploadedTime,
          teacherFullNames: v.teacherFullNames,
          videoUpload: v.videoUpload?.startsWith('http') ? v.videoUpload : null
        }));
        this.isLoadingVideos = false;
      },
      error: (error) => {
        this.isLoadingVideos = false;
        console.error('Failed to load videos:', error);
        Swal.fire('Error', 'Failed to load videos', 'error');
      }
    });
  }

  playStudentVideo(video: any): void {
    if (video.videoUpload && video.videoUpload.startsWith('http')) {
      this.closeMyVideosModal();
      this.openVideoPlayer(video);
    } else {
      Swal.fire('Error', 'Video URL not available', 'error');
    }
  }

  openVideoPlayer(video: any): void {
    const embedUrl = this.getEmbedUrl(video.videoUpload);
    Swal.fire({
      title: video.videoTitle,
      html: `
        <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
          <iframe 
            src="${embedUrl}" 
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
          </iframe>
        </div>
      `,
      width: '80%',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'video-player-popup'
      }
    });
  }

  getEmbedUrl(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    if (url.includes('tiktok.com')) {
      const videoId = url.split('/video/')[1]?.split('?')[0];
      return `https://www.tiktok.com/embed/v2/${videoId}`;
    }
    return url;
  }

  closeMyVideosModal(): void {
    this.showMyVideosModal = false;
  }

  loadStudentAttendance(): void {
    this.studentDashboardService.getStudentAttendanceRecords(this.studentId).subscribe({
      next: (records) => {
        this.calculateAttendance(records);
      },
      error: (error) => {
        console.error('Failed to load attendance:', error);
      }
    });
  }

  calculateAttendance(records: any[]): void {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Calculate date ranges
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    // South African public holidays 2026
    const holidays = [
      '2026-01-01', '2026-03-21', '2026-04-03', '2026-04-06',
      '2026-04-27', '2026-05-01', '2026-06-16', '2026-08-09',
      '2026-09-24', '2026-12-16', '2026-12-25', '2026-12-26'
    ];

    const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
    const isHoliday = (dateStr: string) => holidays.includes(dateStr);
    const isSchoolDay = (dateStr: string) => {
      const date = new Date(dateStr);
      return !isWeekend(date) && !isHoliday(dateStr);
    };

    const countSchoolDays = (startDate: Date, endDate: Date) => {
      let count = 0;
      const current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0];
        if (isSchoolDay(dateStr)) count++;
        current.setDate(current.getDate() + 1);
      }
      return count;
    };

    // Get unique dates to determine classes per day
    const uniqueDates = [...new Set(records.map(r => r.date))];
    const classesPerDay = uniqueDates.length > 0 ? Math.round(records.length / uniqueDates.length) : 5;

    // Daily (today only)
    const dailyRecords = records.filter(r => r.date === today);
    this.dailyAttendance.present = dailyRecords.reduce((sum, r) => sum + r.dailyPresent, 0);
    this.dailyAttendance.absent = dailyRecords.reduce((sum, r) => sum + r.dailyAbsent, 0);
    const dailyTotal = this.dailyAttendance.present + this.dailyAttendance.absent;
    this.dailyAttendance.percentage = dailyTotal > 0 ? Math.round((this.dailyAttendance.present / dailyTotal) * 100) : 0;

    // Weekly (last 7 days, school days only)
    const weeklyRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= weekAgo && recordDate <= now && isSchoolDay(r.date);
    });
    this.weeklyAttendance.present = weeklyRecords.reduce((sum, r) => sum + r.dailyPresent, 0);
    this.weeklyAttendance.absent = weeklyRecords.reduce((sum, r) => sum + r.dailyAbsent, 0);
    const weeklySchoolDays = countSchoolDays(weekAgo, now);
    const weeklyExpected = weeklySchoolDays * classesPerDay;
    this.weeklyAttendance.percentage = weeklyExpected > 0 ? Math.round((this.weeklyAttendance.present / weeklyExpected) * 100) : 0;

    // Monthly (current month, school days only)
    const monthlyRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= monthStart && recordDate <= now && isSchoolDay(r.date);
    });
    this.monthlyAttendance.present = monthlyRecords.reduce((sum, r) => sum + r.dailyPresent, 0);
    this.monthlyAttendance.absent = monthlyRecords.reduce((sum, r) => sum + r.dailyAbsent, 0);
    const monthlySchoolDays = countSchoolDays(monthStart, now);
    const monthlyExpected = monthlySchoolDays * classesPerDay;
    this.monthlyAttendance.percentage = monthlyExpected > 0 ? Math.round((this.monthlyAttendance.present / monthlyExpected) * 100) : 0;

    // Yearly (current year, school days only)
    const yearlyRecords = records.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate >= yearStart && recordDate <= now && isSchoolDay(r.date);
    });
    this.yearlyAttendance.present = yearlyRecords.reduce((sum, r) => sum + r.dailyPresent, 0);
    this.yearlyAttendance.absent = yearlyRecords.reduce((sum, r) => sum + r.dailyAbsent, 0);
    const yearlySchoolDays = countSchoolDays(yearStart, now);
    const yearlyExpected = yearlySchoolDays * classesPerDay;
    this.yearlyAttendance.percentage = yearlyExpected > 0 ? Math.round((this.yearlyAttendance.present / yearlyExpected) * 100) : 0;

    // Overall = Yearly percentage
    this.attendancePercentage = this.yearlyAttendance.percentage;
    console.log('Attendance calculated:', {
      yearly: this.yearlyAttendance.percentage,
      overall: this.attendancePercentage,
      present: this.yearlyAttendance.present,
      expected: yearlyExpected
    });
  }
}
