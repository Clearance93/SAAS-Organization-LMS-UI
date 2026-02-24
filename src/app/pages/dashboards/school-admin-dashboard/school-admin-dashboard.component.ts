import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SchoolDashbaordModel } from '../../../features/organization/models/school-dashboards/school-dashbaord-model';
import { StatCard } from '../../../interfaces/schools/admin-dashboard/stat-card';
import { ChartData } from '../../../interfaces/schools/admin-dashboard/chart-data';
import { QuickAction } from '../../../interfaces/schools/admin-dashboard/quick-action';
import { RecentActivity } from '../../../interfaces/schools/admin-dashboard/recent-activity';
import { Event, CreateEventDto, UpdateEventDto } from '../../../interfaces/schools/admin-dashboard/event';
import { Activity, CreateActivityDto, UpdateActivityDto } from '../../../interfaces/schools/admin-dashboard/activity';
import { AdminDashboardService } from '../../../services/schoolDashboards/admin-dashboard.service';
import { AdminProfileModalComponent } from '../../schools/modals/admin-profile-modal/admin-profile-modal.component';
import { AuthService } from '../../../services/authServices/auth.service';
import { CommunicationService } from '../../../services/communication/communication.service';
import { EventService } from '../../../services/event.service';
import { ActivityService } from '../../../services/activity.service';
import { WorkshopService, ScheduledWorkshopDto } from '../../../services/workshop.service';
import { MediaCompressionUtil } from '../../../utils/media-compression.util';

import { AiAssistantComponent } from '../../../components/ai-assistant/ai-assistant.component';

declare var Swal: any;

@Component({
  selector: 'app-school-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    AdminProfileModalComponent,
    AiAssistantComponent
  ],
  templateUrl: './school-admin-dashboard.component.html',
  styleUrl: './school-admin-dashboard.component.css'
})
export class SchoolAdminDashboardComponent implements OnInit, OnDestroy {
  Math = Math;
  private destroy$ = new Subject<void>();

  dashboardStats: SchoolDashbaordModel | null = null;
  organizationId: string = '';
  isLoading: boolean = true;
  errorMessage: string = '';

  adminName: string = 'Admin';
  adminInitials: string = 'A';
  adminProfilePicture: string | null = null;
  adminEmail: string = '';

  isProfileModalOpen: boolean = false;
  adminProfileData: any = null; 
  unreadMessageCount: number = 0;

  statCards: StatCard[] = [];

  upcomingEvents: Event[] = [];
  isEventModalOpen = false;
  isEditingEvent = false;
  eventForm: FormGroup;
  selectedEvent: Event | null = null;

  activities: Activity[] = [];
  isActivityModalOpen = false;
  isEditingActivity = false;
  activityForm: FormGroup;
  selectedActivity: Activity | null = null;

  // Workshop Management
  workshops: ScheduledWorkshopDto[] = [];
  isWorkshopModalOpen = false;
  isJoinWorkshopModalOpen = false;
  workshopForm!: FormGroup;
  adminId: string = '';
  userId: string = '';
  userRoles: any[] = [];

  // Service showcase data
  serviceShowcases: any[] = [];
  selectedServices: string[] = [];

  // Service showcase mapping
  private serviceShowcaseMap: { [key: string]: any } = {
    'Employee Training & Development': {
      title: 'Employee Training & Development',
      icon: '🎯',
      description: 'Comprehensive training programs for your workforce',
      features: ['Staff Development Programs', 'Skills Assessment', 'Training Analytics', 'Certification Tracking'],
      color: '#10b981'
    },
    'Compliance & Certification Programs': {
      title: 'Compliance & Certification',
      icon: '🏆',
      description: 'Ensure regulatory compliance and manage certifications',
      features: ['Compliance Monitoring', 'Certificate Management', 'Audit Reports', 'Regulatory Updates'],
      color: '#f59e0b'
    },
    'Faith-Based Learning & Leadership': {
      title: 'Faith-Based Learning',
      icon: '✝️',
      description: 'Spiritual growth and leadership development programs',
      features: ['Ministry Training', 'Leadership Development', 'Community Engagement', 'Spiritual Resources'],
      color: '#8b5cf6'
    },
    'Classroom Management System': {
      title: 'Classroom Management',
      icon: '🏫',
      description: 'Complete classroom and student management solution',
      features: ['Student Enrollment', 'Class Scheduling', 'Attendance Tracking', 'Grade Management'],
      color: '#3b82f6'
    },
    'Student Progress & Analytics': {
      title: 'Student Progress & Analytics',
      icon: '📊',
      description: 'Track and analyze student performance data',
      features: ['Performance Analytics', 'Progress Reports', 'Data Visualization', 'Predictive Insights'],
      color: '#06b6d4'
    },
    'Leaning Material Repository': {
      title: 'Learning Material Repository',
      icon: '📚',
      description: 'Centralized library for all learning resources',
      features: ['Digital Library', 'Resource Management', 'Content Search', 'Material Sharing'],
      color: '#ec4899'
    },
    'Member Engagement & Communication': {
      title: 'Member Engagement',
      icon: '💬',
      description: 'Enhanced communication and engagement tools',
      features: ['Messaging System', 'Community Forums', 'Event Management', 'Notifications'],
      color: '#14b8a6'
    },
    'Custom Course Creation': {
      title: 'Custom Course Creation',
      icon: '📝',
      description: 'Create and manage custom learning courses',
      features: ['Course Builder', 'Content Management', 'Assessment Tools', 'Learning Paths'],
      color: '#f97316'
    },
    'Live Workshops & Webinars': {
      title: 'Live Workshops & Webinars',
      icon: '🎪',
      description: 'Interactive live learning sessions',
      features: ['Live Streaming', 'Interactive Sessions', 'Recording & Playback', 'Participant Management'],
      color: '#84cc16'
    },
    'Full Platform Access': {
      title: 'Full Platform Access',
      icon: '🌟',
      description: 'Complete access to all platform features',
      features: ['All Services Included', 'Advanced Analytics', 'Priority Support', 'Custom Integrations'],
      color: '#6366f1'
    }
  };

  // All possible quick actions mapped to services
  private serviceQuickActionsMap: { [key: string]: QuickAction[] } = {
    'Employee Training & Development': [
      { title: 'Training Programs', icon: '🎯', action: 'trainingPrograms' },
      { title: 'Staff Development', icon: '📈', action: 'staffDevelopment' }
    ],
    'Compliance & Certification Programs': [
      { title: 'Certifications', icon: '🏆', action: 'certifications' },
      { title: 'Compliance Reports', icon: '📋', action: 'complianceReports' }
    ],
    'Faith-Based Learning & Leadership': [
      { title: 'Faith Programs', icon: '✝️', action: 'faithPrograms' },
      { title: 'Leadership Training', icon: '👑', action: 'leadershipTraining' }
    ],
    'Classroom Management System': [
      { title: 'Add Student', icon: '👨🎓', action: 'addStudent' },
      { title: 'Add Teacher', icon: '👨🏫', action: 'addTeacher' },
      { title: 'Messages', icon: '📧', action: 'openMessages' }
    ],
    'Student Progress & Analytics': [
      { title: 'Generate Report', icon: '📊', action: 'generateReport' },
      { title: 'View Analytics', icon: '📈', action: 'viewAnalytics' }
    ],
    'Leaning Material Repository': [
      { title: 'Library', icon: '📚', action: 'library' },
      { title: 'Upload Materials', icon: '📤', action: 'uploadMaterials' }
    ],
    'Member Engagement & Communication': [
      { title: 'Messages', icon: '📧', action: 'openMessages' },
      { title: 'Community Forum', icon: '💬', action: 'communityForum' }
    ],
    'Custom Course Creation': [
      { title: 'Create Course', icon: '📝', action: 'createCourse' },
      { title: 'Manage Courses', icon: '⚙️', action: 'manageCourses' }
    ],
    'Live Workshops & Webinars': [
      { title: 'Schedule Workshop', icon: '🎪', action: 'scheduleWorkshop' },
      { title: 'Join Workshop', icon: '🔗', action: 'joinWorkshop' }
    ],
    'Full Platform Access': [
      { title: 'Add Student', icon: '👨🎓', action: 'addStudent' },
      { title: 'Add Teacher', icon: '👨🏫', action: 'addTeacher' },
      { title: 'Messages', icon: '📧', action: 'openMessages' },
      { title: 'Generate Report', icon: '📊', action: 'generateReport' },
      { title: 'Library', icon: '📚', action: 'library' },
      { title: 'Settings', icon: '⚙️', action: 'settings' }
    ]
  };

  quickActions: QuickAction[] = [
    { title: 'Add Student', icon: '👨‍🎓', action: 'addStudent' },
    { title: 'Add Teacher', icon: '👨‍🏫', action: 'addTeacher' },
    { title: 'Add Admin', icon: '⚙️', action: 'addAdmin' },
    { title: 'Add Staff Member', icon: '👥', action: 'addStaffMember' },
    { title: 'Add Learner', icon: '📚', action: 'addLearner' },
    { title: 'Add Guest', icon: '🎫', action: 'addGuest' },
    { title: 'Messages', icon: '📧', action: 'openMessages' },
    { title: 'Generate Report', icon: '📊', action: 'generateReport' }
  ];

  recentActivities: RecentActivity[] = [];

  constructor(
    private router: Router,
    private dashboardService: AdminDashboardService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    private eventService: EventService,
    private activityService: ActivityService,
    private workshopService: WorkshopService,
    private fb: FormBuilder,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      location: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      eventType: ['workshop', Validators.required],
      isActive: [true]
    });

    this.activityForm = this.fb.group({
      actionDescription: ['', Validators.required],
      activityType: ['', Validators.required],
      isActive: [true]
    });

    this.workshopForm = this.fb.group({
      workshopName: ['', Validators.required],
      workShopDescription: ['', Validators.required],
      scheduledDate: ['', Validators.required],
      scheduleTime: ['', Validators.required],
      timeDuration: [60, [Validators.required, Validators.min(15)]],
      privacy: ['Public', Validators.required],
      maxParticipants: [50, [Validators.required, Validators.min(1)]],
      targetRole: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadAdminProfile();
    this.loadDashboardData();
    this.setupNotifications();
    
    // Subscribe to unread count changes from communication service
    this.communicationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.unreadMessageCount = count;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (isPlatformBrowser(this.platformId)) {
      this.organizationId = localStorage.getItem('organizationId') || '';
    }

    console.log('OrganizationId from localStorage:', this.organizationId);

    if (this.organizationId) {
      console.log('Loading dashboard with existing organizationId:', this.organizationId);
      this.loadDashboardStats(this.organizationId);
      return;
    }

    if (isPlatformBrowser(this.platformId)) {
      const adminEmail = localStorage.getItem('adminEmail') || '';

      if (!adminEmail) {
        this.errorMessage = 'No admin email found. Please log in again.';
        this.isLoading = false;
        this.setDefaultStatCards();
        return;
      }

      console.log('Fetching organizationId via admin email:', adminEmail);
      
      this.dashboardService.getAdminByEmail(adminEmail)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (admin) => {
            console.log('Admin profile retrieved:', admin);
            
            if (!admin.organizationSetupId) {
              this.errorMessage = 'No organization found for this admin. Please contact support.';
              this.isLoading = false;
              this.setDefaultStatCards();
              return;
            }

            this.organizationId = admin.organizationSetupId;
            
            if (isPlatformBrowser(this.platformId)) {
              localStorage.setItem('organizationId', this.organizationId);
            }

            this.loadDashboardStats(this.organizationId);
          },
          error: (error) => {
            console.error('Error loading admin profile:', error);
            this.errorMessage = 'Failed to load admin profile. Please try logging in again.';
            this.isLoading = false;
            this.setDefaultStatCards();
          }
        });
    } else {
      this.errorMessage = 'Unable to load dashboard in server-side rendering mode.';
      this.isLoading = false;
      this.setDefaultStatCards();
    }
  }

  private loadDashboardStats(organizationId: string): void {
    if (!organizationId) {
      console.error('Cannot load dashboard stats: organizationId is missing');
      this.errorMessage = 'Organization ID is missing. Please log in again.';
      this.isLoading = false;
      this.setDefaultStatCards();
      return;
    }

    console.log('Loading dashboard stats for organization:', organizationId);

    // Always load from API to get fresh data
    this.dashboardService.getDashboardStats(organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: SchoolDashbaordModel) => {
          console.log('Dashboard stats loaded successfully:', stats);

          // Cache the stats
          const cacheKey = `adminDashboard_${organizationId}`;
          localStorage.setItem(cacheKey, JSON.stringify(stats));
          
          this.dashboardStats = stats;
          this.updateStatCards(stats);
          this.updateAdminProfileData(stats);
          // Load services and update showcases
          let services = [];
          try {
            services = typeof stats.typeOfService === 'string' ? JSON.parse(stats.typeOfService) : stats.typeOfService || [];
          } catch (e) {
            console.error('Error parsing typeOfService:', e);
            services = [];
          }
          this.selectedServices = services;
          this.updateServiceShowcases(services);
          this.updateQuickActions();
          this.loadNotifications();
          this.loadEvents();
          this.loadActivities();
          this.loadUserIds(); // Load user IDs after dashboard stats are available
          this.loadWorkshops();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.errorMessage = 'Failed to load dashboard data. Please try again.';
          this.isLoading = false;
          this.setDefaultStatCards();
        }
      });
  }

  updateAdminProfileData(stats: any): void {
    // Format profile picture with proper base64 prefix if missing
    let formattedProfilePicture = stats.adminProfilePicture;
    if (formattedProfilePicture && !formattedProfilePicture.startsWith('data:')) {
      formattedProfilePicture = `data:image/jpeg;base64,${formattedProfilePicture}`;
    }

    this.adminProfileData = {
      organizationSetupId: stats.organizationSetupId,
      adminId: stats.adminId,
      firstName: stats.firstName,
      lastName: stats.lastName,
      adminBusinessEmail: stats.adminBusinessEmail,
      adminProfilePicture: formattedProfilePicture,
      isActive: stats.isActive,
      isSuperAdmin: stats.isSuperAdmin,
      typeOfService: stats.typeOfService,
      organizationName: stats.organizationName,
    };

    this.adminEmail = stats.adminBusinessEmail || stats.email || '';
    this.adminName = `${stats.firstName} ${stats.lastName}`;
    this.adminInitials = this.getInitials(this.adminName);
    this.adminProfilePicture = formattedProfilePicture;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminProfile', JSON.stringify(this.adminProfileData));
    }
  }

  updateStatCards(stats: SchoolDashbaordModel): void {
    console.log('Updating stat cards with totalCourseStreams:', stats.totalCourseStreams);
    this.statCards = [
      {
        title: 'Total Students',
        value: stats.totalStudents,
        icon: '👨‍🎓',
        trend: 5.2,
        trendLabel: 'vs last month',
        color: '#6366f1'
      },
      {
        title: 'Total Teachers',
        value: stats.totalTeachers,
        icon: '👨‍🏫',
        trend: 2.1,
        trendLabel: 'vs last month',
        color: '#8b5cf6'
      },
      {
        title: 'Staff Members',
        value: stats.totalStaff,
        icon: '👥',
        trend: 0,
        trendLabel: 'No change',
        color: '#ec4899'
      },
      {
        title: 'Active Courses',
        value: stats.totalCourseStreams || 0, 
        icon: '📚',
        trend: 8.5,
        trendLabel: 'vs last semester',
        color: '#06b6d4'
      },
      {
        title: 'Admins',
        value: stats.totalAdmins,
        icon: '⚙️',
        trend: 0,
        trendLabel: 'Stable',
        color: '#10b981'
      },
      {
        title: 'Guests',
        value: stats.totalGuests,
        icon: '🎫',
        trend: -15,
        trendLabel: 'vs last week',
        color: '#f59e0b'
      }
    ];
  }

  setDefaultStatCards(): void {
    this.statCards = [
      {
        title: 'Total Students',
        value: 0,
        icon: '👨‍🎓',
        trend: 0,
        trendLabel: 'No data',
        color: '#6366f1'
      },
      {
        title: 'Total Teachers',
        value: 0,
        icon: '👨‍🏫',
        trend: 0,
        trendLabel: 'No data',
        color: '#8b5cf6'
      },
      {
        title: 'Staff Members',
        value: 0,
        icon: '👥',
        trend: 0,
        trendLabel: 'No data',
        color: '#ec4899'
      },
      {
        title: 'Active Courses',
        value: 0,
        icon: '📚',
        trend: 0,
        trendLabel: 'No data',
        color: '#06b6d4'
      },
      {
        title: 'Admins',
        value: 0,
        icon: '⚙️',
        trend: 0,
        trendLabel: 'No data',
        color: '#10b981'
      },
      {
        title: 'Guests',
        value: 0,
        icon: '🎫',
        trend: 0,
        trendLabel: 'No data',
        color: '#f59e0b'
      }
    ];
    // Show all services when no data available
    this.updateServiceShowcases([]);
    this.updateQuickActions();
  }

  loadAdminProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedProfile = localStorage.getItem('adminProfile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          this.adminName = profile.name || `${profile.firstName} ${profile.lastName}` || 'Admin';
          
          // Get profile picture and ensure proper format
          let profilePicture = profile.profilePicture || profile.adminProfilePicture || profile.logo || null;
          if (profilePicture && !profilePicture.startsWith('data:')) {
            profilePicture = `data:image/jpeg;base64,${profilePicture}`;
          }
          this.adminProfilePicture = profilePicture;
          
          this.adminInitials = this.getInitials(this.adminName);
          this.adminProfileData = profile; 
        } catch (error) {
          console.error('Error loading admin profile:', error);
        }
      }
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  onProfileImageError(): void {
    this.adminProfilePicture = null;
  }

  openProfileModal(): void {
    this.isProfileModalOpen = true; 
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false; 
  }

  onEditProfile(): void {
    console.log('Edit profile clicked');
    this.closeProfileModal();

    this.router.navigate(['/edit-profile'], {
      queryParams: { adminId: this.adminProfileData?.adminId }
    });
  }

  onChangePhoto(): void {
    console.log('Change photo clicked - redirecting to edit profile');
    this.closeProfileModal();
    this.router.navigate(['/edit-admin-profile'], {
      queryParams: { adminId: this.adminProfileData?.adminId }
    });
  }

  getEventTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      workshop: 'event-workshop',
      meeting: 'event-meeting',
      break: 'event-break',
      exam: 'event-exam',
      holiday: 'event-holiday'
    };
    return classes[type] || '';
  }

  handleQuickAction(action: string): void {
    console.log('Quick action triggered:', action);

    const routeMap: { [key: string]: string } = {
      addTeacher: 'add-teacher',
      addStudent: 'add-student',
      openMessages: 'communication-center',
      generateReport: 'generate-report',
      library: 'library',
      settings: 'admin-settings',
      trainingPrograms: 'training-programs',
      certifications: 'certifications',
      faithPrograms: 'faith-programs',
      createCourse: 'add-course-stream',
      scheduleWorkshop: 'schedule-workshop',
      joinWorkshop: 'join-workshop',
      viewAnalytics: 'generate-report',
      uploadMaterials: 'library',
      communityForum: 'communication-center',
      leadershipTraining: 'leadership-training',
      staffDevelopment: 'staff-development',
      complianceReports: 'compliance-reports',
      manageCourses: 'manage-courses'
    };

    const route = routeMap[action];
    if (route) {
      if (action === 'scheduleWorkshop') {
        this.openWorkshopModal();
        return;
      }
      if (action === 'joinWorkshop') {
        this.openJoinWorkshopModal();
        return;
      }
      this.router.navigate([route], {
        queryParams: { organizationId: this.organizationId }
      });
    } else {
      console.log(`Route not configured for this action ${action}`);
      // Use modern toast notification instead of alert
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Feature Coming Soon',
          text: `Navigation for "${action}" is being configured.`,
          icon: 'info',
          confirmButtonText: 'OK',
          timer: 3000,
          timerProgressBar: true
        });
      }
    }
  }

  settings(): void {
    this.router.navigate(['/admin-settings'], {
      queryParams: {
        organizationId: this.organizationId
      }
    })
  }

  logout(): void{
    Swal.fire({
      title: 'Logout Confirmation',
      text: 'Are you sure you want to log out?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b'
    }).then((result: any) => {
      if (result.isConfirmed) {
        console.log(`Logging ${this.adminName} out...`);
        this.authService.logout();
        this.router.navigate(['/login']);
        
        if (isPlatformBrowser(this.platformId)) {
          console.log("logged out successfully");
        }
      }
    });
  }

  refreshDashboard(): void {
    this.loadDashboardData();
  }

  private setupNotifications(): void {
    this.communicationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadMessageCount = count;
      });
  }

  private loadNotifications(): void {
    if (this.organizationId && this.adminId) {
      // Load individual messages received by admin (filter to only show messages where admin is recipient)
      this.communicationService.getIndividualMessages(this.adminId).subscribe({
        next: (messages) => {
          // Only count messages where admin is the recipient, not the sender
          const receivedMessages = messages.filter(m => m.recipientId === this.adminId);
          this.unreadMessageCount = receivedMessages.filter(m => !m.isRead).length;
        },
        error: (error) => {
          console.error('Error loading individual messages:', error);
          this.unreadMessageCount = 0;
        }
      });
      
      // Load broadcast messages for admin role (filter to exclude own broadcasts)
      this.communicationService.getBroadcastMessages('admin').subscribe({
        next: (broadcasts) => {
          // Only count broadcasts where admin is NOT the sender
          const receivedBroadcasts = broadcasts.filter(m => m.senderId !== this.adminId);
          const unreadBroadcasts = receivedBroadcasts.filter(m => !m.isRead).length;
          this.unreadMessageCount += unreadBroadcasts;
        },
        error: (error) => {
          console.error('Error loading broadcast messages:', error);
        }
      });
    }
  }

  openCommunicationCenter(): void {
    this.router.navigate(['/communication-center']);
  }

  loadEvents(): void {
    if (this.organizationId) {
      // Always load from API - no caching
      this.eventService.getAllEvents(this.organizationId).subscribe({
        next: (events) => {
          this.upcomingEvents = events
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 7);
          console.log('Events loaded from API');
        },
        error: (error) => {
          console.error('Error loading events:', error);
        }
      });
    }
  }

  loadActivities(): void {
    console.log('Loading activities for organizationId:', this.organizationId);
    if (this.organizationId) {
      // Always load from API - no caching
      this.activityService.getAllActivities(this.organizationId).subscribe({
        next: (activities) => {
          console.log('Activities loaded:', activities);
          this.activities = activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.updateRecentActivities(this.activities);
          console.log('Activities loaded from API');
        },
        error: (error) => {
          console.error('Error loading activities:', error);
        }
      });
    } else {
      console.warn('Cannot load activities: organizationId is not set');
    }
  }

  updateRecentActivities(activities: Activity[]): void {
    this.recentActivities = activities.slice(0, 7).map(activity => ({
      user: activity.fullName || activity.email || 'System User',
      action: activity.actionDescription,
      time: new Date(activity.createdAt).toLocaleString(),
      avatar: this.getInitials(activity.fullName || activity.email || 'System User')
    }));
  }

  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) return 'Future date';
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  openActivityModal(): void {
    this.isActivityModalOpen = true;
    this.isEditingActivity = false;
    this.activityForm.reset({
      isActive: true
    });
  }

  editActivity(activity: Activity): void {
    this.selectedActivity = activity;
    this.isActivityModalOpen = true;
    this.isEditingActivity = true;
    this.activityForm.patchValue({
      actionDescription: activity.actionDescription,
      activityType: activity.activityType,
      isActive: activity.isActive
    });
  }

  closeActivityModal(): void {
    this.isActivityModalOpen = false;
    this.selectedActivity = null;
    this.activityForm.reset();
  }

  saveActivity(): void {
    if (this.activityForm.valid) {
      const now = new Date().toISOString();
      
      if (this.isEditingActivity && this.selectedActivity) {
        const updateData: UpdateActivityDto = {
          actionDescription: this.activityForm.value.actionDescription,
          activityType: this.activityForm.value.activityType
        };
        this.activityService.updateActivity(this.selectedActivity.activityId!, updateData).subscribe({
          next: () => {
            // Clear activities cache
            this.loadActivities();
            this.closeActivityModal();
          },
          error: (error) => {
            console.error('Error updating activity:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update activity. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      } else {
        const activityData: CreateActivityDto = {
          organizationId: this.organizationId,
          email: this.adminEmail,
          actionDescription: this.activityForm.value.actionDescription,
          activityType: this.activityForm.value.activityType,
          createdAt: now,
          isActive: this.activityForm.value.isActive
        };
        this.activityService.createActivity(activityData).subscribe({
          next: () => {
            this.loadActivities();
            this.closeActivityModal();
          },
          error: (error) => {
            console.error('Error creating activity:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to create activity. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    }
  }

  openEventModal(): void {
    this.isEventModalOpen = true;
    this.isEditingEvent = false;
    this.eventForm.reset({
      eventType: 'workshop',
      isActive: true
    });
  }

  editEvent(event: Event): void {
    this.selectedEvent = event;
    this.isEventModalOpen = true;
    this.isEditingEvent = true;
    this.eventForm.patchValue({
      title: event.title,
      description: event.description,
      location: event.location,
      startTime: event.startTime,
      endTime: event.endTime,
      eventType: event.eventType,
      isActive: event.isActive
    });
  }

  closeEventModal(): void {
    this.isEventModalOpen = false;
    this.selectedEvent = null;
    this.eventForm.reset();
  }

  saveEvent(): void {
    if (this.eventForm.valid) {
      const now = new Date().toISOString();
      const eventData = {
        ...this.eventForm.value,
        organizationId: this.organizationId,
        createdAt: now,
        updatedAt: now
      };

      if (this.isEditingEvent && this.selectedEvent) {
        const updateData: UpdateEventDto = {
          title: eventData.title,
          description: eventData.description,
          location: eventData.location,
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          eventType: eventData.eventType,
          updatedAt: now
        };
        this.eventService.updateEvent(this.selectedEvent.eventId!, updateData).subscribe({
          next: () => {
            this.loadEvents();
            this.closeEventModal();
          },
          error: (error) => {
            console.error('Error updating event:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to update event. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      } else {
        this.eventService.createEvent(eventData).subscribe({
          next: () => {
            this.loadEvents();
            this.closeEventModal();
          },
          error: (error) => {
            console.error('Error creating event:', error);
            Swal.fire({
              title: 'Error!',
              text: 'Failed to create event. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    }
  }

  // Update quick actions based on selected services
  updateQuickActions(): void {
    this.quickActions = [];
    const uniqueActions = new Map<string, QuickAction>();

    // Parse services if they come as JSON string
    let services = this.selectedServices;
    if (typeof services === 'string') {
      try {
        services = JSON.parse(services);
      } catch (e) {
        console.error('Error parsing services:', e);
        services = [];
      }
    }

    // If no services selected, show all available actions
    if (!services || services.length === 0) {
      services = Object.keys(this.serviceQuickActionsMap);
    }

    services.forEach((service: string) => {
      const serviceActions = this.serviceQuickActionsMap[service] || [];
      serviceActions.forEach(action => {
        uniqueActions.set(action.action, action);
      });
    });

    this.quickActions = Array.from(uniqueActions.values());
    console.log('Updated quick actions based on services:', services, this.quickActions);
  }

  // Update service showcases based on selected services
  updateServiceShowcases(services: string[]): void {
    // If no services selected, show all available services
    if (!services || services.length === 0) {
      services = Object.keys(this.serviceShowcaseMap);
    }
    
    this.serviceShowcases = services.map(service => 
      this.serviceShowcaseMap[service]
    ).filter(showcase => showcase !== undefined);
    console.log('Updated service showcases:', this.serviceShowcases);
  }

  // Workshop Management Methods
  loadUserIds(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Try to get adminId from the dashboard stats first
      if (this.dashboardStats?.adminId) {
        this.adminId = this.dashboardStats.adminId;
        this.userId = this.adminId;
        localStorage.setItem('adminId', this.adminId);
        localStorage.setItem('userId', this.userId);
      } else {
        // Fallback to localStorage
        this.adminId = localStorage.getItem('adminId') || '';
        this.userId = localStorage.getItem('userId') || this.adminId;
        
        // If still no adminId, try to get it from adminProfileData
        if (!this.adminId && this.adminProfileData?.adminId) {
          this.adminId = this.adminProfileData.adminId;
          this.userId = this.adminId;
          localStorage.setItem('adminId', this.adminId);
          localStorage.setItem('userId', this.userId);
        }
      }
    }
  }

  loadWorkshops(): void {
    if (this.organizationId && this.userId) {
      this.workshopService.getAllWorkshops(this.organizationId, this.userId).subscribe({
        next: (workshops) => {
          // Filter out expired workshops
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          this.workshops = workshops.filter(workshop => {
            const workshopDate = new Date(workshop.scheduledDate);
            return workshopDate >= today;
          });
          
          console.log('Active workshops loaded:', this.workshops);
        },
        error: (error) => {
          console.error('Error loading workshops:', error);
        }
      });
    }
  }

  openWorkshopModal(): void {
    this.isWorkshopModalOpen = true;
    this.workshopForm.reset({
      privacy: 'Public',
      timeDuration: 60,
      maxParticipants: 50
    });
    this.loadUserRoles();
  }

  closeWorkshopModal(): void {
    this.isWorkshopModalOpen = false;
    this.workshopForm.reset();
  }

  loadUserRoles(): void {
    if (this.adminEmail) {
      this.workshopService.getRolesByUser(this.adminEmail).subscribe({
        next: (roles) => {
          this.userRoles = roles;
        },
        error: (error) => {
          console.error('Error loading roles:', error);
        }
      });
    }
  }

  createWorkshop(): void {
    if (this.workshopForm.valid) {
      const payload: ScheduledWorkshopDto = {
        organizationId: this.organizationId,
        adminId: this.adminId,
        workshopName: this.workshopForm.value.workshopName,
        workShopDescription: this.workshopForm.value.workShopDescription,
        scheduledDate: this.workshopForm.value.scheduledDate,
        scheduleTime: this.workshopForm.value.scheduleTime,
        timeDuration: this.workshopForm.value.timeDuration,
        privacy: this.workshopForm.value.privacy,
        maxParticipants: this.workshopForm.value.maxParticipants,
        role: this.workshopForm.value.targetRole
      };

      this.workshopService.createAdminWorkshop(payload).subscribe({
        next: (response: any) => {
          Swal.fire({
            title: 'Success!',
            text: 'Workshop scheduled successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
          });
          this.loadWorkshops();
          this.closeWorkshopModal();
        },
        error: (error: any) => {
          console.error('Error creating workshop:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Failed to schedule workshop. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
          });
        }
      });
    }
  }

  openJoinWorkshopModal(): void {
    this.isJoinWorkshopModalOpen = true;
    this.loadWorkshops();
  }

  closeJoinWorkshopModal(): void {
    this.isJoinWorkshopModalOpen = false;
  }

  joinWorkshop(workshop: ScheduledWorkshopDto): void {
    if (workshop.meetingUrl) {
      window.open(workshop.meetingUrl, '_blank');
    } else {
      Swal.fire({
        title: 'No Meeting URL',
        text: 'This workshop does not have a meeting URL available.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
    }
  }


  get sortedWorkshops(): ScheduledWorkshopDto[] {
    return [...this.workshops].sort((a, b) => {
      const dateA = new Date(a.scheduledDate).getTime();
      const dateB = new Date(b.scheduledDate).getTime();
      return dateA - dateB;
    });
  }

  getWorkshopStatusClass(workshop: ScheduledWorkshopDto): string {
    if (this.isWorkshopInProgress(workshop)) return 'in-progress';
    if (this.isUpcomingSoon(workshop)) return 'upcoming-soon';
    if (this.isUpcoming(workshop)) return 'upcoming';
    return 'scheduled';
  }

  getStatusIndicatorClass(workshop: ScheduledWorkshopDto): string {
    return this.getWorkshopStatusClass(workshop);
  }

  getStatusIcon(workshop: ScheduledWorkshopDto): string {
    if (this.isWorkshopInProgress(workshop)) return '🔴';
    if (this.isUpcomingSoon(workshop)) return '🟡';
    if (this.isUpcoming(workshop)) return '🟢';
    return '⚪';
  }

  getStatusText(workshop: ScheduledWorkshopDto): string {
    if (this.isWorkshopInProgress(workshop)) return 'In Progress';
    if (this.isUpcomingSoon(workshop)) return 'Starting Soon';
    if (this.isUpcoming(workshop)) return 'Upcoming';
    return 'Scheduled';
  }

  isWorkshopInProgress(workshop: ScheduledWorkshopDto): boolean {
    const now = new Date();
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.scheduleTime}`);
    const timeDiff = now.getTime() - workshopDateTime.getTime();
    const durationMs = (workshop.timeDuration || 60) * 60 * 1000;
    return timeDiff >= 0 && timeDiff <= durationMs;
  }

  isUpcomingSoon(workshop: ScheduledWorkshopDto): boolean {
    const now = new Date();
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.scheduleTime}`);
    const timeDiff = workshopDateTime.getTime() - now.getTime();
    return timeDiff > 0 && timeDiff <= (2 * 60 * 60 * 1000);
  }

  isUpcoming(workshop: ScheduledWorkshopDto): boolean {
    const now = new Date();
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.scheduleTime}`);
    const timeDiff = workshopDateTime.getTime() - now.getTime();
    return timeDiff > (2 * 60 * 60 * 1000) && timeDiff <= (24 * 60 * 60 * 1000);
  }

  isWorkshopPast(workshop: ScheduledWorkshopDto): boolean {
    const now = new Date();
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.scheduleTime}`);
    const durationMs = (workshop.timeDuration || 60) * 60 * 1000;
    return (now.getTime() - workshopDateTime.getTime()) > durationMs;
  }

  getWorkshopCountdown(workshop: ScheduledWorkshopDto): string | null {
    const now = new Date();
    const workshopDateTime = new Date(`${workshop.scheduledDate}T${workshop.scheduleTime}`);
    const timeDiff = workshopDateTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) return null;
    
    const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  formatWorkshopDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  getJoinButtonClass(workshop: ScheduledWorkshopDto): string {
    if (this.isWorkshopInProgress(workshop)) return 'btn-success';
    if (this.isWorkshopPast(workshop)) return 'btn-disabled';
    return 'btn-primary';
  }

  getJoinButtonText(workshop: ScheduledWorkshopDto): string {
    if (this.isWorkshopInProgress(workshop)) return 'Join Now';
    if (this.isWorkshopPast(workshop)) return 'Ended';
    return 'Join Workshop';
  }
}


