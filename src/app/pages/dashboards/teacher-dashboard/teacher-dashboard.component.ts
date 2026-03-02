import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RoleNavigationService } from '../../../services/role-navigation.service';
import { TeacherDashboardService } from '../../../services/schoolDashboards/teacher-dashboard.service';
import { TeachingClassService } from '../../../services/teaching-class.service';
import { AuthService } from '../../../services/authServices/auth.service';
import { CommunicationService } from '../../../services/communication/communication.service';
import { WorkshopService } from '../../../services/workshop.service';
import { AiGradingService } from '../../../services/ai-grading.service';
import { StudentDashboardService } from '../../../services/studentServices/student-dashboard.service';
import { AiAssistantComponent } from '../../../components/ai-assistant/ai-assistant.component';
import { StreamResponse, ClassScheduleDto, ScheduleStatus } from '../../../interfaces/class-schedule';
import { TeachingClass } from '../../../interfaces/teaching-class.interface';
import { AssignmentDto, AssignmentResponse } from '../../../interfaces/assignment';

declare var Swal: any;

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AiAssistantComponent],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css'
})
export class TeacherDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Fields populated from API
  teacherId: string | null = null;
  teacherName = '';
  teacherProfilePicture: string | null = null;
  teachingClassid: string | null = null;
  className: string | null = null;
  teacherSubject: string | null = null;

  // Dashboard Stats
  totalStudents = 0;
  dailyPresent = 0;
  dailyAbsent = 0;
  classPerformance = 0;
  nextClassStartTime: string | null = null;
  nextClassEndTime: string | null = null;
  unreadMessagesCount = 0;

  // Assignment summary
  assignmentId: string | null = null;
  assignmentTitle: string | null = null;
  assignmentDueDate: string | null = null;
  assignmentSubject: string | null = null;
  assignmentSubmittedCount = 0;
  assignmentTotalStudents = 0;
  assignmentProgress: string | null = null;

  // Attendance Management
  selectedClass = 'Grade 10A Math';
  attendanceDate = new Date().toISOString().split('T')[0];
  students: any[] = [];
  allStudents: any[] = [];
  filteredStudents: any[] = [];
  selectedStreamFilter = '';
  selectedSubjectFilter = '';
  studentSearchQuery = '';

  // Teacher's classes (populated by API when available)
  myClasses: { name: string; students?: number; time?: string }[] = [];
  scheduledClasses: any[] = [];
  teachingClasses: any[] = []; // Store teaching classes data
  timeUpdateInterval: any;

  // Pagination
  scheduleCurrentPage = 1;
  classesCurrentPage = 1;
  itemsPerPage = 5;

  // Attendance data
  attendanceData: any = null;
  selectedAttendanceSubject = '';
  attendanceOverview: any = null;

  // Assignments pagination
  assignmentsCurrentPage = 1;
  assignmentsItemsPerPage = 5;

  // Gradebook - now dynamic from API
  assignments: AssignmentResponse[] = [];

  // Schedule
  todaySchedule: any[] = [];

  // Announcements
  announcements: any[] = [];
  unreadAnnouncementsCount = 0;

  // Quick Actions
  quickActions = [
    { title: 'Take Attendance', icon: '✓', action: 'takeAttendance' },
    { title: 'Grade Assignment', icon: '📝', action: 'gradeAssignment' },
    { title: 'Create Assignment', icon: '📋', action: 'createAssignment' },
    { title: 'My Classes', icon: '🏫', action: 'myClasses' },
    { title: 'Create Live Session', icon: '🎥', action: 'createLiveSession' },
    { title: 'Join Live Session', icon: '📹', action: 'joinLiveSession' },
    { title: 'Upload Video', icon: '🎬', action: 'uploadVideo' },
    { title: 'My Videos', icon: '🎞️', action: 'myVideos' },
    { title: 'Check Plagiarism', icon: '🔍', action: 'checkPlagiarism' },
    { title: 'Upcoming Workshops', icon: '📅', action: 'upcomingWorkshops', badge: 0 },
    { title: 'View Reports', icon: '📊', action: 'viewReports' },
    { title: 'Library', icon: '📚', action: 'library' }
  ];

  // Performance Analytics
  // Performance Analytics (detailed list)
  classPerformanceList: { class: string; average: number; trend: string }[] = [];

  // Loading states
  isLoadingSchedule = false;
  isAttendanceModalOpen = false;
  isGradeModalOpen = false;
  isAssignmentModalOpen = false;
  isAddClassModalOpen = false;
  isLiveSessionModalOpen = false;
  isJoinSessionModalOpen = false;
  isMyClassesModalOpen = false;
  teacherClasses: any[] = [];
  streams: StreamResponse[] = [];
  teacherSubjectsWithGrades: any[] = [];
  cachedTeachingClasses: TeachingClass[] = [];
  upcomingWorkshops: any[] = [];
  isUpcomingWorkshopsModalOpen = false;
  workshopsCurrentPage = 1;
  workshopsItemsPerPage = 5;
  paginatedWorkshops: any[] = [];
  workshopsTotalPages = 1;
  upcomingEvents: any[] = [];
  
  // Live Session Data
  liveSessionForm: FormGroup;
  createdSessions: any[] = [];
  
  // Forms
  assignmentForm: FormGroup;
  classScheduleForm: FormGroup;

  // File Uploads
  assignmentFile: File | null = null;
  rubricFile: File | null = null;
  isDraggingAssignment = false;
  isDraggingRubric = false;
  selectedAssignmentFileUrl: string | null = null;
  selectedAssignmentFileName: string | null = null;
  
  // Video Upload
  isUploadVideoModalOpen = false;
  videoUploadType: 'url' | 'file' = 'url';
  videoUrl: string = '';
  videoFile: File | null = null;
  videoTitle: string = '';
  videoDescription: string = '';
  videoSubject: string = '';
  videoGradeStreamId: string = '';
  isDraggingVideo = false;
  
  // My Videos
  isMyVideosModalOpen = false;
  uploadedVideos: any[] = [];
  isLoadingVideos = false;
  isLoadingSubmissions = false;
  
  // Plagiarism Check
  isPlagiarismModalOpen = false;
  plagiarismAssignments: any[] = [];
  plagiarismSearchQuery: string = '';
  plagiarismSelectedStream: string = '';
  plagiarismSelectedSubject: string = '';
  filteredPlagiarismAssignments: any[] = [];
  isPlagiarismResultModalOpen = false;
  currentPlagiarismResult: any = null;
  isLoadingPlagiarism = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private roleNav: RoleNavigationService,
    private teacherDashboardService: TeacherDashboardService,
    private teachingClassService: TeachingClassService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private workshopService: WorkshopService,
    private aiGradingService: AiGradingService,
    private studentDashboardService: StudentDashboardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.assignmentForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      points: [100, [Validators.required, Validators.min(1)]],
      gradeStreamId: ['', Validators.required],
      subject: ['', Validators.required]
    });

    this.classScheduleForm = this.fb.group({
      date: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      classRoomNumber: [''],
      gradeStreamId: ['', Validators.required]
    });

    this.liveSessionForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: ['45', Validators.required],
      description: [''],
      gradeStreamId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const profile = this.authService.getUserProfile();
    const orgId = profile?.organizationId || localStorage.getItem('organizationId');
    const roleUserId = profile?.roleUserId || localStorage.getItem('roleUserId') || localStorage.getItem('userId');
    
    if (orgId && roleUserId) {
      this.teacherId = roleUserId;
      this.loadMyClasses();
      this.loadScheduledClasses();
      this.teacherDashboardService.getTeacherDashboard(orgId, roleUserId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (resp) => {
            this.applyTeacherDashboard(resp);
            this.loadUnreadMessageCount(orgId, roleUserId);
            this.loadAnnouncements();
            this.loadUpcomingWorkshops();
            this.loadOrganizationEvents(orgId);
            this.loadAttendanceOverview();
          },
          error: (err) => {
            console.error('Failed to load teacher dashboard', err);
          }
        });
    }
    
    // Subscribe to unread count changes from communication service
    this.communicationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.unreadMessagesCount = count;
    });
  }

  private applyTeacherDashboard(resp: any): void {
    if (!resp) return;
    
    if (Array.isArray(resp)) {
      this.teacherClasses = resp;
      if (resp.length > 0) {
        const first = resp[0];
        this.teacherId = first.teacherId;
        this.teacherName = first.teacherName;
        this.teacherSubject = first.subject;
        this.totalStudents = first.totalStudents;
        this.dailyPresent = first.dailyPresent;
        this.dailyAbsent = first.dailyAbsent;
        this.nextClassStartTime = first.nextClassStartTime;
        this.nextClassEndTime = first.nextClassEndTime;
        this.assignmentTitle = first.assignmentTitle;
        this.assignmentProgress = first.assignmentProgress;
        
        // Populate myClasses from the response
        this.myClasses = resp.map((cls: any) => ({
          name: cls.subject,
          students: cls.totalStudents,
          time: `${cls.nextClassStartTime || ''} - ${cls.nextClassEndTime || ''}`
        }));
      }
    }
  }

  private loadUnreadMessageCount(orgId: string, teacherId: string): void {
    this.communicationService.getIndividualMessages(teacherId).subscribe({
      next: (messages) => {
        this.unreadMessagesCount = messages.filter(m => !m.isRead).length;
      },
      error: (error) => {
        console.error('Error loading unread messages:', error);
        this.unreadMessagesCount = 0;
      }
    });
    
    this.communicationService.getBroadcastMessages('teacher').subscribe({
      next: (broadcasts) => {
        const unreadBroadcasts = broadcasts.filter(m => !m.isRead).length;
        this.unreadMessagesCount += unreadBroadcasts;
      },
      error: (error) => {
        console.error('Error loading broadcast messages:', error);
      }
    });
  }

  // Load assignments from API and map them to the UI model with caching
  loadAssignments(): void {
    if (!this.teacherId) {
      const profile = this.authService.getUserProfile();
      this.teacherId = profile?.teacherId || profile?.roleUserId || profile?.userId ||
                       localStorage.getItem('teacherId') || localStorage.getItem('roleUserId') ||
                       localStorage.getItem('userId') || null;
    }

    if (!this.teacherId) {
      console.warn('No teacherId available; skipping loadAssignments');
      return;
    }

    console.log('Loading assignments for teacherId:', this.teacherId);

    // Load from API (no cache to always show latest)
    this.teacherDashboardService.getTeacherAssignments(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any[]) => {
          console.log('Teacher assignments API response:', resp);
          
          if (!Array.isArray(resp)) {
            console.warn('Unexpected assignments response format:', resp);
            this.assignments = [];
            return;
          }

          this.assignments = resp.map(a => ({
            assignmentId: a.assignmentId,
            assignmentTitle: a.assignmentTitle || a.title,
            assignmentDueDate: a.dueDate || a.assignmentDueDate || '',
            assignmentSubject: a.assignmentSubject || a.subject || '',
            assignmentSubmittedCount: (a.assignmentSubmittedCount ?? 0),
            assignmentTotalStudents: (a.assignmentTotalStudents ?? 0),
            fileUrl: a.assignmentFileUrl || a.assignmentFile || null,
            fileName: a.assignmentFile || null
          } as any));

          console.log('Processed assignments:', this.assignments);
        },
        error: (err) => {
          console.error('Failed to load assignments:', err);
          this.assignments = [];
        }
      });
  }

  // Load class performance from API with caching
  loadClassPerformance(): void {
    if (!this.teacherId) {
      const profile = this.authService.getUserProfile();
      this.teacherId = profile?.teacherId || profile?.roleUserId || profile?.userId ||
                       localStorage.getItem('teacherId') || localStorage.getItem('roleUserId') ||
                       localStorage.getItem('userId') || null;
    }

    if (!this.teacherId) {
      console.warn('No teacherId available; skipping loadClassPerformance');
      return;
    }

    // Check cache first
    const cacheKey = `classPerformance_${this.teacherId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        this.classPerformanceList = JSON.parse(cached);
        console.log('Using cached class performance');
        return;
      } catch (e) {
        console.error('Error parsing cached class performance:', e);
      }
    }

    // Load from API if not cached
    this.teacherDashboardService.getAllTeacherPerformance(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any[]) => {
          if (!Array.isArray(resp)) {
            console.warn('Unexpected class performance response format:', resp);
            this.classPerformanceList = [];
            return;
          }

          this.classPerformanceList = resp.map(item => ({
            class: item.className,
            average: item.performancePercentage,
            trend: 'up'
          }));

          // Cache the performance data
          localStorage.setItem(cacheKey, JSON.stringify(this.classPerformanceList));
          console.log('Class performance loaded and cached');
        },
        error: (err) => {
          console.error('Failed to load class performance:', err);
          this.classPerformanceList = [];
        }
      });
  }

  // Load attendance data from API with caching
  loadAttendanceData(): void {
    if (!this.teacherId) {
      const profile = this.authService.getUserProfile();
      this.teacherId = profile?.teacherId || profile?.roleUserId || profile?.userId ||
                       localStorage.getItem('teacherId') || localStorage.getItem('roleUserId') ||
                       localStorage.getItem('userId') || null;
    }

    if (!this.teacherId) {
      console.warn('No teacherId available; skipping loadAttendanceData');
      return;
    }

    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');

    if (!organizationId) {
      console.warn('No organizationId available; skipping loadAttendanceData');
      return;
    }

    // Check cache first
    const cacheKey = `attendanceData_${this.teacherId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        this.attendanceData = JSON.parse(cached);
        console.log('Using cached attendance data');
        if (this.teachingClasses.length > 0) {
          this.selectedAttendanceSubject = this.teachingClasses[0].subject;
        }
        return;
      } catch (e) {
        console.error('Error parsing cached attendance:', e);
      }
    }

    // Load from API if not cached
    this.teachingClassService.getTeacherAttendanceDashboard(organizationId, this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          this.attendanceData = resp;
          // Cache the attendance data
          localStorage.setItem(cacheKey, JSON.stringify(resp));
          console.log('Attendance data loaded and cached');
          
          if (this.teachingClasses.length > 0) {
            this.selectedAttendanceSubject = this.teachingClasses[0].subject;
          }
        },
        error: (err) => {
          console.error('Failed to load attendance data:', err);
          this.attendanceData = null;
        }
      });
  }

  // Get unique subjects from teaching classes
  getTeacherSubjects(): string[] {
    return this.teachingClasses.map(tc => tc.subject).filter((v, i, a) => a.indexOf(v) === i);
  }

  // Get weekly present count for selected subject
  getWeeklyPresent(): number {
    if (!this.attendanceData?.weeklyAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.weeklyAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.TotalPresent || 0;
  }

  // Get weekly absent count for selected subject
  getWeeklyAbsent(): number {
    if (!this.attendanceData?.weeklyAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.weeklyAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.TotalAbsent || 0;
  }

  // Get monthly present count for selected subject
  getMonthlyPresent(): number {
    if (!this.attendanceData?.monhtlyAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.monhtlyAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.TotalPresent || 0;
  }

  // Get monthly absent count for selected subject
  getMonthlyAbsent(): number {
    if (!this.attendanceData?.monhtlyAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.monhtlyAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.TotalAbsent || 0;
  }

  // Get today present count for selected subject
  getTodayPresent(): number {
    if (!this.attendanceData?.todayAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.todayAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.PresentToday || 0;
  }

  // Get today absent count for selected subject
  getTodayAbsent(): number {
    if (!this.attendanceData?.todayAttendance || !this.selectedAttendanceSubject) return 0;
    const item = this.attendanceData.todayAttendance.find((a: any) => a.Subject === this.selectedAttendanceSubject);
    return item?.AbsentToday || 0;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
  }

  // Attendance Methods
  openAttendanceModal(): void {
    this.isAttendanceModalOpen = true;
    this.loadTeacherStudents();
  }

  closeAttendanceModal(): void {
    this.isAttendanceModalOpen = false;
  }

  toggleAttendance(studentId: string): void {
    const student = this.filteredStudents.find(s => s.studentId === studentId);
    if (student) {
      student.isPresent = !student.isPresent;
    }
  }

  loadTeacherStudents(): void {
    if (!this.teacherId) return;
    
    this.teacherDashboardService.getTeacherStudents(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (students) => {
          this.allStudents = students.map((s: any) => ({
            studentId: s.studentId,
            name: `${s.studentFirstName} ${s.studentLastName}`,
            firstName: s.studentFirstName,
            lastName: s.studentLastName,
            profilePicture: s.studentProfilePicture,
            subject: s.subject,
            streamName: s.streamName,
            gradeStreamId: s.streamGradeId,
            teachingClassId: s.teachingClassId,
            isPresent: true
          }));
          this.filteredStudents = this.allStudents;
          console.log('Students loaded with gradeStreamId:', this.allStudents);
        },
        error: (error) => {
          console.error('Failed to load students:', error);
          Swal.fire('Error', 'Failed to load students', 'error');
        }
      });
  }

  getUniqueStreamNames(): string[] {
    return [...new Set(this.allStudents.map(s => s.streamName))];
  }

  getUniqueStreamSubjectCombos(): Array<{display: string, streamName: string, subject: string}> {
    const combos = new Map<string, {display: string, streamName: string, subject: string}>();
    this.allStudents.forEach(s => {
      const key = `${s.streamName}_${s.subject}`;
      if (!combos.has(key)) {
        combos.set(key, {
          display: `${s.streamName} - ${s.subject}`,
          streamName: s.streamName,
          subject: s.subject
        });
      }
    });
    return Array.from(combos.values());
  }

  onStudentFilterChange(): void {
    this.filteredStudents = this.allStudents.filter(s =>
      (!this.selectedStreamFilter || s.streamName === this.selectedStreamFilter) &&
      (!this.selectedSubjectFilter || s.subject === this.selectedSubjectFilter) &&
      (!this.studentSearchQuery || s.name.toLowerCase().includes(this.studentSearchQuery.toLowerCase()))
    );
  }

  getAttendancePresentCount(): number {
    return this.filteredStudents.filter(s => s.isPresent).length;
  }

  getAttendanceAbsentCount(): number {
    return this.filteredStudents.filter(s => !s.isPresent).length;
  }

  saveAttendance(): void {
    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');

    if (!organizationId || !this.teacherId) {
      Swal.fire('Error', 'Missing organization or teacher information', 'error');
      return;
    }

    // Validate that students have gradeStreamId
    const studentsWithoutGradeStream = this.filteredStudents.filter(s => !s.gradeStreamId || s.gradeStreamId === '00000000-0000-0000-0000-000000000000');
    if (studentsWithoutGradeStream.length > 0) {
      console.warn('Students without gradeStreamId:', studentsWithoutGradeStream);
    }

    // Build payload array with individual student records
    const payload = this.filteredStudents.map(student => ({
      attendanceOverviewId: '00000000-0000-0000-0000-000000000000',
      organizationId: organizationId,
      teacherId: this.teacherId,
      gradeStreamId: student.gradeStreamId,
      studentId: student.studentId,
      studentFirstName: student.firstName,
      studentLastName: student.lastName,
      teachingClassId: student.teachingClassId,
      dailyPresent: student.isPresent ? 1 : 0,
      dailyAbsent: student.isPresent ? 0 : 1,
      date: this.attendanceDate
    }));

    console.log('Attendance payload:', payload);

    this.teacherDashboardService.submitAttendance(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Attendance saved successfully!', 'success');
          this.closeAttendanceModal();
        },
        error: (error) => {
          console.error('Failed to save attendance:', error);
          Swal.fire('Error', 'Failed to save attendance', 'error');
        }
      });
  }

  // Assignment Methods
  openAssignmentModal(): void {
    this.isAssignmentModalOpen = true;
    // Load streams and teaching classes for assignment creation
    setTimeout(() => {
      this.loadStreams();
      this.loadAndCacheTeachingClasses();
    }, 10);
  }

  // Add Class Methods
  openAddClassModal(): void {
    console.log('openAddClassModal called — opening modal and loading streams');
    this.isAddClassModalOpen = true;
    // Force a microtask to ensure change detection shows modal before network call
    setTimeout(() => {
      this.loadStreams();
      this.loadAndCacheTeachingClasses();
    }, 10);
  }

  closeAddClassModal(): void {
    this.isAddClassModalOpen = false;
    this.classScheduleForm.reset();
  }

  loadStreams(): void {
    console.log('loadStreams: current teacherId', this.teacherId);
    
    if (!this.teacherId) {
      const profile = this.authService.getUserProfile();
      this.teacherId = profile?.teacherId || profile?.roleUserId || profile?.userId || 
                      localStorage.getItem('teacherId') || localStorage.getItem('roleUserId') || 
                      localStorage.getItem('userId') || null;
      console.log('Resolved teacherId from profile/localStorage:', this.teacherId);
    }

    if (!this.teacherId) {
      console.error('No teacher ID available for loading streams');
      Swal.fire('Error', 'Teacher ID not found. Cannot load streams. Please try logging in again.', 'error');
      return;
    }

    // Load teacher subjects with grades for live session modal
    this.teacherDashboardService.getTeacherSubjectsWithGrades(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any[]) => {
          console.log('=== RAW API RESPONSE: teacherSubjectsWithGrades ===');
          console.log(JSON.stringify(response, null, 2));
          
          // Log each item to see the gradeStreamId mapping
          response.forEach((item, index) => {
            console.log(`Item ${index}:`, {
              subjectName: item.subjectName,
              streamGradeName: item.streamGradeName,
              gradeStreamId: item.gradeStreamId,
              fullItem: item
            });
          });
          
          this.teacherSubjectsWithGrades = response;
        },
        error: (error) => {
          console.error('Failed to load teacher subjects with grades:', error);
        }
      });

    // Check cache first
    const cacheKey = `teacherStreams_${this.teacherId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        this.streams = JSON.parse(cached);
        console.log('Using cached streams');
        return;
      } catch (e) {
        console.error('Error parsing cached streams:', e);
      }
    }

    // Load from API if not cached
    console.log('Making API call to getAllStreams with teacherId:', this.teacherId);
    this.teacherDashboardService.getAllStreams(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: StreamResponse[] | any) => {
          console.log('getAllStreams API response:', response);
          if (Array.isArray(response)) {
            this.streams = response;
          } else if (response && Array.isArray(response.data)) {
            this.streams = response.data;
          } else {
            this.streams = [];
            console.warn('Unexpected response format for streams:', response);
          }
          
          // Cache the streams
          localStorage.setItem(cacheKey, JSON.stringify(this.streams));
          console.log('Streams loaded and cached');
          
          if (this.streams.length === 0) {
            Swal.fire('Info', 'No streams found for this teacher.', 'info');
          }
        },
        error: (error) => {
          console.error('Failed to load streams:', error);
          const errorMessage = error?.error?.message || error?.message || 'Could not load streams for this teacher.';
          Swal.fire('Error', errorMessage, 'error');
          this.streams = [];
        }
      });
  }

  // Load and cache teaching classes
  loadAndCacheTeachingClasses(): void {
    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');
    
    if (!organizationId || !this.teacherId) {
      console.log('Missing organizationId or teacherId for loading teaching classes');
      return;
    }

    // Check if already cached
    const cached = localStorage.getItem('cachedTeachingClasses');
    if (cached) {
      try {
        this.cachedTeachingClasses = JSON.parse(cached);
        console.log('Using cached teaching classes:', this.cachedTeachingClasses);
        return;
      } catch (e) {
        console.error('Error parsing cached teaching classes:', e);
      }
    }

    // Load from API and cache
    this.teachingClassService.getTeachingClasses(organizationId, this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes: TeachingClass[]) => {
          this.cachedTeachingClasses = classes;
          localStorage.setItem('cachedTeachingClasses', JSON.stringify(classes));
          console.log('Teaching classes loaded and cached:', classes);
        },
        error: (error) => {
          console.error('Failed to load teaching classes:', error);
        }
      });
  }

  // Auto-populate subject based on stream selection for assignment
  onAssignmentStreamSelected(gradeStreamId: string): void {
    console.log('Assignment stream selected:', gradeStreamId);
    console.log('Available teacherSubjectsWithGrades:', this.teacherSubjectsWithGrades);
    
    const matchingGrade = this.teacherSubjectsWithGrades.find(g => g.gradeStreamId === gradeStreamId);
    
    if (matchingGrade) {
      console.log('Found matching grade:', matchingGrade);
      this.assignmentForm.patchValue({
        subject: matchingGrade.subjectName
      });
      console.log('Auto-populated subject:', matchingGrade.subjectName);
    } else {
      console.warn('No matching subject found for gradeStreamId:', gradeStreamId);
    }
  }

  // Auto-populate room number based on stream selection
  onClassStreamSelected(gradeStreamId: string): void {
    console.log('Stream selected:', gradeStreamId);
    console.log('Available cached teaching classes:', this.cachedTeachingClasses);
    
    const matchingClass = this.cachedTeachingClasses.find(c => {
      console.log('Comparing:', c.gradeStreamId, 'with', gradeStreamId);
      return c.gradeStreamId === gradeStreamId;
    });
    
    if (matchingClass) {
      console.log('Found matching class:', matchingClass);
      this.classScheduleForm.patchValue({
        classRoomNumber: matchingClass.classRoomNumber
      });
      console.log('Auto-populated room number:', matchingClass.classRoomNumber);
    } else {
      console.warn('No matching teaching class found for gradeStreamId:', gradeStreamId);
      console.log('Available gradeStreamIds:', this.cachedTeachingClasses.map(c => c.gradeStreamId));
    }
  }

  // Load scheduled classes from API
  loadScheduledClasses(): void {
    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');
    
    if (!organizationId || !this.teacherId) {
      console.log('Missing organizationId or teacherId for loading scheduled classes');
      this.todaySchedule = [];
      return;
    }

    // Load both APIs and wait for both to complete
    const scheduledClasses$ = this.teachingClassService.getAllScheduledClasses(organizationId, this.teacherId);
    const teachingClasses$ = this.teachingClassService.getTeachingClasses(organizationId, this.teacherId);

    // Wait for both APIs to complete
    scheduledClasses$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (classes: any[]) => {
        this.scheduledClasses = classes;
        console.log('Scheduled classes loaded:', classes);
        this.updateTodayScheduleIfReady();
        this.startTimeUpdates();
      },
      error: (error) => {
        console.error('Failed to load scheduled classes:', error);
        this.todaySchedule = [];
      }
    });

    teachingClasses$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (classes: any[]) => {
        this.teachingClasses = classes;
        localStorage.setItem('teachingClasses', JSON.stringify(classes));
        this.updateMyClasses(classes);
        console.log('Teaching classes loaded:', classes);
        this.updateTodayScheduleIfReady();
      },
      error: (error) => {
        console.error('Failed to load teaching classes:', error);
        const cached = localStorage.getItem('teachingClasses');
        if (cached) {
          this.teachingClasses = JSON.parse(cached);
          this.updateMyClasses(this.teachingClasses);
        }
      }
    });
  }

  // Update today's schedule only when both APIs have loaded
  updateTodayScheduleIfReady(): void {
    if (this.scheduledClasses.length > 0 && this.teachingClasses.length > 0) {
      this.updateTodaySchedule();
    }
  }

  // Update My Classes from teaching classes API
  updateMyClasses(classes?: any[]): void {
    const classData = classes || this.scheduledClasses;
    const uniqueClasses = new Map();
    classData.forEach(cls => {
      const key = cls.gradeStreamId || cls.className;
      if (!uniqueClasses.has(key)) {
        uniqueClasses.set(key, {
          name: cls.className || cls.subject || 'Class',
          students: cls.totalStudents || 0,
          time: `${cls.startTime || ''} - ${cls.endTime || ''}`
        });
      }
    });
    this.myClasses = Array.from(uniqueClasses.values());
  }

  // Update today's schedule from scheduled classes with South Africa timezone
  updateTodaySchedule(): void {
    const now = new Date();
    // Get today's date in YYYY-MM-DD format to match API
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Johannesburg'
    }).format(now); // en-CA gives YYYY-MM-DD format
    
    console.log('Today\'s date (YYYY-MM-DD):', today);
    console.log('All scheduled classes:', this.scheduledClasses);
    console.log('Scheduled class dates:', this.scheduledClasses.map(c => c.date));
    
    const todayClasses = this.scheduledClasses.filter(cls => {
      const classDate = cls.date;
      console.log('Comparing:', classDate, 'with', today);
      return classDate === today;
    }).sort((a, b) => a.startTime.localeCompare(b.startTime));

    console.log('Filtered today classes:', todayClasses);

    // If no classes today, show message but still update pagination
    if (todayClasses.length === 0) {
      console.warn('No classes scheduled for today. Available dates:', this.scheduledClasses.map(c => c.date));
      this.todaySchedule = [];
      this.updateSchedulePagination();
      return;
    }

    // Map API data to display format with subject lookup
    // First, calculate all statuses
    const classesWithStatus = todayClasses.map(cls => {
      const status = this.getClassStatus(cls.startTime, cls.endTime);
      return {
        ...cls,
        calculatedStatus: status
      };
    });
    
    // Find the most appropriate current class (latest start time that's still current)
    const currentClasses = classesWithStatus.filter(cls => cls.calculatedStatus === 'current');
    let activeClassIndex = -1;
    
    if (currentClasses.length > 0) {
      // Find the class with the latest start time that's still current
      const latestCurrentClass = currentClasses.reduce((latest, current) => 
        current.startTime > latest.startTime ? current : latest
      );
      activeClassIndex = todayClasses.findIndex(cls => 
        cls.startTime === latestCurrentClass.startTime && 
        cls.classScheduleId === latestCurrentClass.classScheduleId
      );
    }
    
    this.todaySchedule = todayClasses.map((cls, index) => {
      console.log('Processing class:', cls);
      let status = this.getClassStatus(cls.startTime, cls.endTime);
      
      // Only the most appropriate current class gets 'current' status
      if (status === 'current' && index !== activeClassIndex) {
        status = 'upcoming';
      }
      
      return {
        time: cls.startTime,
        class: this.getSubjectName(cls.teachingClassId),
        room: cls.classRoomNumber,
        status: status
      };
    });
    
    console.log('Today\'s schedule updated:', this.todaySchedule);
    this.updateSchedulePagination();
  }

  // Get subject name from teaching classes using teachingClassId
  getSubjectName(teachingClassId: string): string {
    console.log('Looking for teachingClassId:', teachingClassId);
    console.log('Available teaching classes:', this.teachingClasses);
    const teachingClass = this.teachingClasses.find(tc => tc.teachingClassId === teachingClassId);
    console.log('Found teaching class:', teachingClass);
    return teachingClass?.subject || 'Unknown Subject';
  }

  // Get class status based on South Africa current time
  getClassStatus(startTime: string, endTime: string): string {
    const now = new Date();
    const saCurrentTime = new Intl.DateTimeFormat('en-ZA', {
      timeZone: 'Africa/Johannesburg',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
    
    if (saCurrentTime >= startTime && saCurrentTime <= endTime) {
      return 'current';
    } else if (saCurrentTime < startTime) {
      return 'upcoming';
    } else {
      return 'completed';
    }
  }

  startTimeUpdates(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
    }
    this.timeUpdateInterval = setInterval(() => {
      this.updateTodaySchedule();
    }, 60000);
  }

  loadAnnouncements(): void {
    this.announcements = [];
  }

  loadUpcomingWorkshops(): void {
    this.teacherDashboardService.getUpcomingSessionsByRole('Teacher')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (workshops) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Filter to only show workshops with future dates
          this.upcomingWorkshops = workshops.filter((w: any) => {
            const workshopDate = new Date(w.scheduledDate);
            workshopDate.setHours(0, 0, 0, 0);
            return workshopDate >= today;
          });
          
          console.log('Upcoming workshops loaded:', this.upcomingWorkshops);
          this.updateWorkshopBadge();
          this.updateWorkshopsPagination();
        },
        error: (error) => {
          console.error('Failed to load workshops:', error);
          this.upcomingWorkshops = [];
          this.updateWorkshopBadge();
          this.updateWorkshopsPagination();
        }
      });
  }

  loadOrganizationEvents(organizationId: string): void {
    this.studentDashboardService.getOrganizationEvents(organizationId).subscribe({
      next: (events: any[]) => {
        this.upcomingEvents = events.map((e: any) => ({
          id: e.eventId,
          title: e.title,
          description: e.description,
          date: e.startTime,
          startTime: new Date(e.startTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
          endTime: new Date(e.endTime).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}),
          location: e.location || 'TBA',
          eventType: e.eventType
        }));
      },
      error: (error: any) => console.error('Failed to load events:', error)
    });
  }

  loadAttendanceOverview(): void {
    if (!this.teacherId) return;
    this.teachingClassService.getTeacherAttendanceOverview(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.attendanceOverview = data;
          console.log('Attendance overview loaded:', data);
        },
        error: (error) => console.error('Failed to load attendance overview:', error)
      });
  }

  handleQuickAction(action: string): void {
    const actions: any = {
      takeAttendance: () => this.openAttendanceModal(),
      gradeAssignment: () => this.openGradeModal(),
      createAssignment: () => this.openAssignmentModal(),
      myClasses: () => { this.isMyClassesModalOpen = true; this.loadMyClasses(); },
      createLiveSession: () => this.isLiveSessionModalOpen = true,
      joinLiveSession: () => this.isJoinSessionModalOpen = true,
      uploadVideo: () => this.isUploadVideoModalOpen = true,
      myVideos: () => { this.isMyVideosModalOpen = true; this.loadUploadedVideos(); },
      checkPlagiarism: () => { this.isPlagiarismModalOpen = true; this.loadPlagiarismAssignments(); },
      upcomingWorkshops: () => { this.isUpcomingWorkshopsModalOpen = true; this.updateWorkshopsPagination(); }
    };
    actions[action]?.();
  }

  closeJoinSessionModal(): void { this.isJoinSessionModalOpen = false; }
  closeMyClassesModal(): void { this.isMyClassesModalOpen = false; }
  closeUpcomingWorkshopsModal(): void { this.isUpcomingWorkshopsModalOpen = false; }
  closeGradingModal(): void { this.isGradingStudent = false; }
  closeMyVideosModal(): void { this.isMyVideosModalOpen = false; }
  closeUploadVideoModal(): void { this.isUploadVideoModalOpen = false; }
  closePlagiarismModal(): void { this.isPlagiarismModalOpen = false; }
  closePlagiarismResultModal(): void { this.isPlagiarismResultModalOpen = false; }
  closeGradeModal(): void { this.isGradeModalOpen = false; }
  closeAssignmentModal(): void { this.isAssignmentModalOpen = false; }
  closeLiveSessionModal(): void { this.isLiveSessionModalOpen = false; }

  getSessionStatusBadge(status: string): string { return status; }
  startLiveSession(session: any): void { window.open(session.meetingUrl, '_blank'); }
  joinSession(session: any): void { window.open(session.meetingUrl, '_blank'); }
  openWhiteboard(): void { 
    window.open('/whiteboard', '_blank');
  }
  joinWorkshop(url: string): void { window.open(url, '_blank'); }

  isGradingStudent = false;
  currentGradingSubmission: any = null;
  getInitials(name: string): string { return name?.split(' ').map(n => n[0]).join('').toUpperCase() || ''; }
  
  viewSubmissionFile(): void {
    if (!this.currentGradingSubmission?.studentAnswerFile) {
      Swal.fire('Error', 'No submission file available', 'error');
      return;
    }
    
    const base64Data = this.currentGradingSubmission.studentAnswerFile;
    const blob = this.base64ToBlob(base64Data, 'application/pdf');
    const url = URL.createObjectURL(blob);
    
    // Show PDF in modal within the platform
    Swal.fire({
      html: `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border-radius: 8px;"></iframe>`,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      width: '90%',
      customClass: {
        popup: 'pdf-viewer-modal'
      },
      didClose: () => {
        URL.revokeObjectURL(url);
      }
    });
  }
  
  downloadSubmissionFile(): void {
    if (!this.currentGradingSubmission?.studentAnswerFile) {
      Swal.fire('Error', 'No submission file available', 'error');
      return;
    }
    
    const base64Data = this.currentGradingSubmission.studentAnswerFile;
    const blob = this.base64ToBlob(base64Data, 'application/pdf');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.currentGradingSubmission.studentFullNames}_${this.currentGradingSubmission.assignmentTitle}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  private base64ToBlob(base64: string, contentType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
  getAiGradingSuggestion(): void {
    if (!this.currentGradingSubmission?.assignmentId || !this.currentGradingSubmission?.studentId) {
      Swal.fire('Error', 'Missing assignment or student information', 'error');
      return;
    }

    this.isLoadingAiGrade = true;
    this.aiGradingService.getAiGradeAssistance(
      this.currentGradingSubmission.assignmentId,
      this.currentGradingSubmission.studentId
    ).pipe(takeUntil(this.destroy$)).subscribe({
      next: (result) => {
        // Transform backend response to match template structure
        this.aiGradingSuggestion = {
          suggestedScore: result.totalMarks || 0,
          breakdown: {
            content: result.content || 0,
            structure: result.clarity || 0,
            grammar: result.grammar || 0,
            accuracy: result.content || 0
          },
          strengths: result.strength ? [result.strength] : [],
          improvements: result.improvement ? [result.improvement] : [],
          feedback: result.feedback || 'No feedback available'
        };
        this.teacherFinalGrade = result.totalMarks || 0;
        this.isLoadingAiGrade = false;
      },
      error: (error) => {
        console.error('AI grading error:', error);
        Swal.fire('Error', 'Failed to get AI grading suggestion', 'error');
        this.isLoadingAiGrade = false;
      }
    });
  }
  isLoadingAiGrade = false;
  aiGradingSuggestion: any = null;
  adjustGrade(amount: number): void { this.teacherFinalGrade = Math.max(0, Math.min(100, this.teacherFinalGrade + amount)); }
  teacherFinalGrade = 0;
  submitFinalGrade(): void { 
    if (!this.currentGradingSubmission) return;
    
    console.log('=== SUBMIT GRADE DEBUG ===');
    console.log('Current submission:', this.currentGradingSubmission);
    console.log('Teacher final grade:', this.teacherFinalGrade);
    
    // Validate required fields
    if (!this.currentGradingSubmission.assignmentSubmissionId) {
      console.error('❌ Missing assignmentSubmissionId!');
      Swal.fire('Error', 'Missing submission ID. Please try again.', 'error');
      return;
    }
    
    // Build payload matching AssignmentGradesDto
    const payload = {
      assignmentGradesId: '00000000-0000-0000-0000-000000000000',
      assignmentSubmissionId: this.currentGradingSubmission.assignmentSubmissionId,
      marks: this.teacherFinalGrade,
      gradedDate: new Date().toISOString(),
      studentId: this.currentGradingSubmission.studentId,
      subject: this.currentGradingSubmission.assignmentSubject || ''
    };
    
    console.log('Payload to send:', JSON.stringify(payload, null, 2));
    console.log('API URL:', 'https://localhost:7270/api/Assingment/addAssignmentGrades');
    
    this.aiGradingService.submitGrade(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Grade submitted successfully, response:', response);
          Swal.fire('Success', 'Grade submitted successfully', 'success');
          this.closeGradingModal();
          this.loadSubmissions();
        },
        error: (error) => {
          console.error('❌ Failed to submit grade - Full error:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);
          
          const errorMsg = error.error?.message || error.message || 'Unknown error';
          Swal.fire('Error', `Failed to submit grade: ${errorMsg}`, 'error');
        }
      });
  }

  onVideoStreamSelected(): void { }
  uploadVideo(): void {
    if (!this.videoUrl) { Swal.fire('Error', 'Please enter video URL', 'error'); return; }
    Swal.fire('Success', 'Video uploaded', 'success');
    this.closeUploadVideoModal();
  }

  loadUploadedVideos(): void {
    if (!this.teacherId) return;
    this.isLoadingVideos = true;
    this.teacherDashboardService.getTeacherVideos(this.teacherId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (videos) => { this.uploadedVideos = videos.filter((v: any) => v.videoUpload?.startsWith('http')); this.isLoadingVideos = false; },
      error: () => { this.uploadedVideos = []; this.isLoadingVideos = false; }
    });
  }

  playVideo(video: any): void {
    this.closeMyVideosModal();
    this.openVideoPlayer(video.videoUpload);
  }

  openVideoPlayer(url: string): void {
    const embedUrl = this.getEmbedUrl(url);
    Swal.fire({
      html: `<iframe src="${embedUrl}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`,
      showConfirmButton: false,
      showCloseButton: true,
      width: '80%'
    });
  }

  getEmbedUrl(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    if (url.includes('tiktok.com')) {
      return url;
    }
    return url;
  }

  onPlagiarismFilterChange(): void {
    this.filteredPlagiarismAssignments = this.plagiarismAssignments.filter(a => 
      (!this.plagiarismSelectedStream || a.streamName === this.plagiarismSelectedStream) &&
      (!this.plagiarismSelectedSubject || a.subject === this.plagiarismSelectedSubject) &&
      (!this.plagiarismSearchQuery || a.assignmentTitle.toLowerCase().includes(this.plagiarismSearchQuery.toLowerCase()))
    );
  }

  getUniqueStreams(): string[] {
    return [...new Set(this.plagiarismAssignments.map(a => a.streamName))];
  }

  getPlagiarismUniqueSubjects(): string[] {
    return [...new Set(this.plagiarismAssignments.map(a => a.subject))];
  }

  checkPlagiarism(assignment: any): void {
    if (!assignment.assignmentId || !assignment.studentId) {
      Swal.fire('Error', 'Missing assignment or student information', 'error');
      return;
    }

    this.isLoadingPlagiarism = true;
    this.aiGradingService.getPlagiarismResult(assignment.assignmentId, assignment.studentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.currentPlagiarismResult = result;
          this.isPlagiarismResultModalOpen = true;
          this.isLoadingPlagiarism = false;
        },
        error: (error) => {
          console.error('Plagiarism check error:', error);
          Swal.fire('Error', 'Failed to check plagiarism', 'error');
          this.isLoadingPlagiarism = false;
        }
      });
  }

  getVerdictColor(verdict: string): string {
    return verdict === 'Clean' ? '#10b981' : '#ef4444';
  }

  openGradeModal(): void {
    console.log('openGradeModal called');
    console.log('teacherId:', this.teacherId);
    this.isGradeModalOpen = true;
    this.loadSubmissions();
  }

  getSubmissionCount(assignment: any): string {
    return `${assignment.assignmentSubmittedCount || 0}/${assignment.assignmentTotalStudents || 0}`;
  }

  filteredSortedAssignments: any[] = [];
  paginatedAssignments: any[] = [];
  assignmentsTotalPages = 1;
  prevAssignmentsPage(): void { if (this.assignmentsCurrentPage > 1) this.assignmentsCurrentPage--; }
  nextAssignmentsPage(): void { if (this.assignmentsCurrentPage < this.assignmentsTotalPages) this.assignmentsCurrentPage++; }

  paginatedTodaySchedule: any[] = [];
  scheduleTotalPages = 1;
  prevSchedulePage(): void { if (this.scheduleCurrentPage > 1) { this.scheduleCurrentPage--; this.updateSchedulePagination(); } }
  nextSchedulePage(): void { if (this.scheduleCurrentPage < this.scheduleTotalPages) { this.scheduleCurrentPage++; this.updateSchedulePagination(); } }

  paginatedMyClasses: any[] = [];
  classesTotalPages = 1;
  prevClassesPage(): void { if (this.classesCurrentPage > 1) { this.classesCurrentPage--; this.updateClassesPagination(); } }
  nextClassesPage(): void { if (this.classesCurrentPage < this.classesTotalPages) { this.classesCurrentPage++; this.updateClassesPagination(); } }

  getStatusClass(status: string): string { return status; }
  getCurrentDate(): string { return new Date().toLocaleDateString(); }
  hasCurrentClass(): boolean { return this.todaySchedule.some(s => s.status === 'current'); }
  hasNextClass(): boolean { return this.todaySchedule.some(s => s.status === 'upcoming'); }
  getCurrentClassInfo(): any { return this.todaySchedule.find(s => s.status === 'current'); }
  openMessages(): void { this.router.navigate(['/communication-center']); }
  settings(): void { this.router.navigate(['/teacher-settings']); }
  logout(): void { 
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  getTeacherInitials(): string { return this.getInitials(this.teacherName); }
  getTrendIcon(trend: string): string { return trend === 'up' ? '↑' : '↓'; }
  isAssignmentOverdue(dueDate: string): boolean { return new Date(dueDate) < new Date(); }
  
  createAssignment(): void {
    if (!this.assignmentForm.valid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');
    const formValue = this.assignmentForm.value;

    const processFiles = async () => {
      let assignmentFileBase64 = null;
      let rubricFileBase64 = null;

      if (this.assignmentFile) {
        assignmentFileBase64 = await this.fileToBase64(this.assignmentFile);
      }

      if (this.rubricFile) {
        rubricFileBase64 = await this.fileToBase64(this.rubricFile);
      }

      const payload = {
        organizationId: organizationId,
        teacherId: this.teacherId,
        assignmentTitle: formValue.title,
        assignmentDescription: formValue.description,
        dueDate: formValue.dueDate,
        assignmentMarks: formValue.points,
        gradeStreamId: formValue.gradeStreamId,
        assignmentSubject: formValue.subject,
        assignmentFile: assignmentFileBase64,
        teacherRubricFile: rubricFileBase64
      };

      this.teacherDashboardService.createAssignment(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            Swal.fire('Success', 'Assignment created successfully', 'success');
            this.closeAssignmentModal();
            this.assignmentForm.reset();
            this.assignmentFile = null;
            this.rubricFile = null;
            this.loadAssignments();
          },
          error: (error) => {
            console.error('Failed to create assignment:', error);
            Swal.fire('Error', 'Failed to create assignment', 'error');
          }
        });
    };

    processFiles();
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }
  onDragOver(e: DragEvent, type: string): void { e.preventDefault(); this.isDraggingAssignment = true; }
  onDragLeave(e: DragEvent, type: string): void { this.isDraggingAssignment = false; }
  onDrop(e: DragEvent, type: string): void { e.preventDefault(); this.isDraggingAssignment = false; }
  onAssignmentFileSelected(e: any): void { this.assignmentFile = e.target.files[0]; }
  onRubricFileSelected(e: any): void { this.rubricFile = e.target.files[0]; }
  createClassSchedule(): void {
    if (!this.classScheduleForm.valid) {
      Swal.fire('Error', 'Please fill all required fields', 'error');
      return;
    }

    const profile = this.authService.getUserProfile();
    const organizationId = profile?.organizationId || localStorage.getItem('organizationId');

    const scheduleData = {
      ...this.classScheduleForm.value,
      organizationId: organizationId,
      teacherId: this.teacherId,
      status: 3
    };

    this.isLoadingSchedule = true;
    this.teachingClassService.createClassSchedule(scheduleData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Schedule created successfully', 'success');
          this.closeAddClassModal();
          this.loadScheduledClasses();
        },
        error: (error) => {
          console.error('Failed to create schedule:', error);
          Swal.fire('Error', 'Failed to create schedule', 'error');
          this.isLoadingSchedule = false;
        },
        complete: () => {
          this.isLoadingSchedule = false;
        }
      });
  }
  createLiveSession(): void { Swal.fire('Success', 'Session created', 'success'); this.closeLiveSessionModal(); }
  onLiveSessionStreamSelected(event: any): void {
    const gradeStreamId = event.target.value;
    console.log('Live session stream selected:', gradeStreamId);
  }
  gradingTab = 'pending';
  setGradingTab(tab: string): void { 
    this.gradingTab = tab;
    this.updateGradingPagination();
  }
  filteredSubmissions: any[] = [];
  paginatedSubmissions: any[] = [];
  gradingTotalPages = 1;
  gradingCurrentPage = 1;
  prevGradingPage(): void { if (this.gradingCurrentPage > 1) this.gradingCurrentPage--; }
  nextGradingPage(): void { if (this.gradingCurrentPage < this.gradingTotalPages) this.gradingCurrentPage++; }
  gradedStudents = new Set<string>();
  gradeStudent(student: any): void { this.isGradingStudent = true; this.currentGradingSubmission = student; }

  loadMyClasses(): void {
    const profile = this.authService.getUserProfile();
    const orgId = profile?.organizationId || localStorage.getItem('organizationId');
    const teacherId = this.teacherId || profile?.roleUserId || localStorage.getItem('roleUserId');

    if (!orgId || !teacherId) {
      console.error('Missing orgId or teacherId for loading classes');
      this.myClasses = [];
      this.updateClassesPagination();
      return;
    }

    console.log('Loading My Classes for teacherId:', teacherId);
    
    this.teachingClassService.getTeachingClasses(orgId, teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes: any[]) => {
          console.log('Teaching classes loaded:', classes);
          this.myClasses = classes.map(cls => ({
            name: `${cls.subject} - ${cls.streamName || cls.className || ''}`,
            students: cls.totalStudents || 0,
            time: cls.classRoomNumber ? `Room ${cls.classRoomNumber}` : 'No room assigned'
          }));
          console.log('My Classes populated:', this.myClasses);
          this.updateClassesPagination();
        },
        error: (error) => {
          console.error('Failed to load teaching classes:', error);
          this.myClasses = [];
          this.updateClassesPagination();
        }
      });
  }

  loadSubmissions(): void {
    if (!this.teacherId) {
      console.error('No teacherId available');
      return;
    }

    console.log('Loading submissions for teacherId:', this.teacherId);
    this.isLoadingSubmissions = true;
    this.aiGradingService.getAllTeacherAssignments(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (submissions: any[]) => {
          console.log('Raw submissions from API:', submissions);
          console.log('Number of submissions:', submissions?.length);
          
          // Log each submission's isGraded status
          submissions.forEach((sub, index) => {
            console.log(`Submission ${index + 1}:`, {
              student: sub.studentFullNames,
              assignment: sub.assignmentTitle,
              isSubmitted: sub.isSubmitted,
              isGraded: sub.isGraded
            });
          });
          
          this.filteredSubmissions = submissions.map(sub => ({
            studentId: sub.studentId,
            studentName: sub.studentFullNames || 'Unknown Student',
            studentFullNames: sub.studentFullNames,
            studentEmail: sub.studentEmail,
            assignmentTitle: sub.assignmentTitle || 'Untitled',
            assignmentDescription: sub.assignmentDescription,
            submittedDate: sub.submissionDate,
            status: sub.isGraded ? 'graded' : 'pending',
            grade: sub.grade || null,
            assignmentSubmissionId: sub.assignmentSubmissionId,
            assignmentId: sub.assignmentId,
            assignmentSubject: sub.subject,
            streamName: sub.streamName,
            studentAnswerFile: sub.assignmentFile,
            isSubmitted: sub.isSubmitted,
            isGraded: sub.isGraded
          }));
          
          console.log('Processed filteredSubmissions:', this.filteredSubmissions);
          console.log('Pending count:', this.filteredSubmissions.filter(s => !s.isGraded).length);
          console.log('Graded count:', this.filteredSubmissions.filter(s => s.isGraded).length);
          this.isLoadingSubmissions = false;
          this.updateGradingPagination();
        },
        error: (error) => {
          console.error('Failed to load submissions:', error);
          this.isLoadingSubmissions = false;
          this.filteredSubmissions = [];
          this.updateGradingPagination();
        }
      });
  }

  updateGradingPagination(): void {
    console.log('updateGradingPagination called');
    console.log('Current tab:', this.gradingTab);
    console.log('Total submissions:', this.filteredSubmissions.length);
    
    const filtered = this.filteredSubmissions.filter(s => 
      this.gradingTab === 'pending' ? !s.isGraded : s.isGraded
    );
    
    console.log('Filtered submissions for tab:', filtered);
    console.log(`Tab: ${this.gradingTab}, Filtered count: ${filtered.length}`);
    
    this.gradingTotalPages = Math.ceil(filtered.length / this.itemsPerPage);
    const start = (this.gradingCurrentPage - 1) * this.itemsPerPage;
    this.paginatedSubmissions = filtered.slice(start, start + this.itemsPerPage);
    
    console.log('Paginated submissions:', this.paginatedSubmissions);
  }

  getPendingCount(): number {
    const count = this.filteredSubmissions.filter(s => !s.isGraded).length;
    console.log('getPendingCount:', count);
    return count;
  }

  getGradedCount(): number {
    const count = this.filteredSubmissions.filter(s => s.isGraded).length;
    console.log('getGradedCount:', count);
    return count;
  }

  updateClassesPagination(): void {
    this.classesTotalPages = Math.ceil(this.myClasses.length / this.itemsPerPage);
    const start = (this.classesCurrentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedMyClasses = this.myClasses.slice(start, end);
  }

  updateSchedulePagination(): void {
    this.scheduleTotalPages = Math.ceil(this.todaySchedule.length / this.itemsPerPage);
    const start = (this.scheduleCurrentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.paginatedTodaySchedule = this.todaySchedule.slice(start, end);
  }

  updateWorkshopsPagination(): void {
    this.workshopsTotalPages = Math.ceil(this.upcomingWorkshops.length / this.workshopsItemsPerPage);
    const start = (this.workshopsCurrentPage - 1) * this.workshopsItemsPerPage;
    const end = start + this.workshopsItemsPerPage;
    this.paginatedWorkshops = this.upcomingWorkshops.slice(start, end);
  }

  updateWorkshopBadge(): void {
    const workshopAction = this.quickActions.find(a => a.action === 'upcomingWorkshops');
    if (workshopAction) {
      workshopAction.badge = this.upcomingWorkshops.length;
    }
  }

  prevWorkshopsPage(): void { if (this.workshopsCurrentPage > 1) { this.workshopsCurrentPage--; this.updateWorkshopsPagination(); } }
  nextWorkshopsPage(): void { if (this.workshopsCurrentPage < this.workshopsTotalPages) { this.workshopsCurrentPage++; this.updateWorkshopsPagination(); } }

  loadPlagiarismAssignments(): void {
    if (!this.teacherId) return;
    this.isLoadingPlagiarism = true;
    this.aiGradingService.getAllTeacherAssignments(this.teacherId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (assignments) => {
          // Filter to show only graded assignments
          this.plagiarismAssignments = assignments.filter(a => a.isGraded);
          this.filteredPlagiarismAssignments = this.plagiarismAssignments;
          this.isLoadingPlagiarism = false;
        },
        error: (error) => {
          console.error('Failed to load assignments:', error);
          Swal.fire('Error', 'Failed to load assignments', 'error');
          this.isLoadingPlagiarism = false;
        }
      });
  }
}
