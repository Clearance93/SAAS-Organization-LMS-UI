import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SchoolDashbaordModel } from '../../../features/organization/models/school-dashboards/school-dashbaord-model';
import { StatCard } from '../../../interfaces/schools/admin-dashboard/stat-card';
import { ChartData } from '../../../interfaces/schools/admin-dashboard/chart-data';
import { QuickAction } from '../../../interfaces/schools/admin-dashboard/quick-action';
import { RecentActivity } from '../../../interfaces/schools/admin-dashboard/recent-activity';
import { Events } from '../../../interfaces/schools/admin-dashboard/event';
import { AdminDashboardService } from '../../../services/schoolDashboards/admin-dashboard.service';
import { AdminProfileModalComponent } from '../../schools/modals/admin-profile-modal/admin-profile-modal.component';
import { AuthService } from '../../../services/authServices/auth.service';
import { CommunicationService } from '../../../services/communication/communication.service';

@Component({
  selector: 'app-school-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    AdminProfileModalComponent
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

  attendanceRate: number = 95;
  attendanceData: ChartData[] = [
    { label: 'Mon', value: 92 },
    { label: 'Tue', value: 94 },
    { label: 'Wed', value: 96 },
    { label: 'Thu', value: 98 },
    { label: 'Fri', value: 93 }
  ];

  upcomingEvents: Events[] = [
    { title: 'Math Workshop', date: 'Sep 10', type: 'workshop' },
    { title: 'Parent-Teacher Meet', date: 'Oct 1', type: 'meeting' },
    { title: 'Fall Break', date: 'Nov 23-24', type: 'break' },
    { title: 'Mid-term Exams', date: 'Dec 5-9', type: 'exam' },
    { title: 'Winter Holiday', date: 'Dec 20-31', type: 'holiday' }
  ];

  progressData: ChartData[] = [
    { label: 'Jan', value: 65 },
    { label: 'Feb', value: 68 },
    { label: 'Mar', value: 72 },
    { label: 'Apr', value: 70 },
    { label: 'May', value: 75 },
    { label: 'Jun', value: 78 },
    { label: 'Jul', value: 82 },
    { label: 'Aug', value: 85 }
  ];

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

  recentActivities: RecentActivity[] = [
    { user: 'John Doe', action: 'enrolled in Physics 101', time: '5 mins ago', avatar: 'JD' },
    { user: 'Sarah Smith', action: 'submitted Math assignment', time: '12 mins ago', avatar: 'SS' },
    { user: 'Mike Johnson', action: 'updated course materials', time: '25 mins ago', avatar: 'MJ' },
    { user: 'Emily Davis', action: 'scheduled parent meeting', time: '1 hour ago', avatar: 'ED' }
  ];

  constructor(
    private router: Router,
    private dashboardService: AdminDashboardService,
    private authService: AuthService,
    private communicationService: CommunicationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.loadAdminProfile();
    this.loadDashboardData();
    this.setupNotifications();
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

    this.dashboardService.getDashboardStats(organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stats: SchoolDashbaordModel) => {
          console.log('Dashboard stats loaded successfully:', stats);

          this.dashboardStats = stats;
          this.updateStatCards(stats);
          this.updateAdminProfileData(stats);
          this.loadNotifications();
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
    this.adminProfileData = {
      organizationSetupId: stats.organizationSetupId,
      adminId: stats.adminId,
      firstName: stats.firstName,
      lastName: stats.lastName,
      adminBusinessEmail: stats.adminBusinessEmail,
      adminProfilePicture: stats.adminProfilePicture,
      isActive: stats.isActive,
      isSuperAdmin: stats.isSuperAdmin,
      typeOfService: stats.typeOfService,
      organizationName: stats.organizationName,
    };

    this.adminEmail = stats.adminBusinessEmail || stats.email || '';
    this.adminName = `${stats.firstName} ${stats.lastName}`;
    this.adminInitials = this.getInitials(this.adminName);
    this.adminProfilePicture = stats.adminProfilePicture;

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('adminProfile', JSON.stringify(this.adminProfileData));
    }
  }

  updateStatCards(stats: SchoolDashbaordModel): void {
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
        value: 32, 
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
  }

  loadAdminProfile(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storedProfile = localStorage.getItem('adminProfile');
      if (storedProfile) {
        try {
          const profile = JSON.parse(storedProfile);
          this.adminName = profile.name || `${profile.firstName} ${profile.lastName}` || 'Admin';
          this.adminProfilePicture = profile.profilePicture || profile.adminProfilePicture || profile.logo || null;
          this.adminInitials = this.getInitials(this.adminName);
          this.adminProfileData = profile; 
        } catch (error) {
          console.error('Error loading admin profile:', error);
        }
      }
    }
  }

  getInitials(name: string): string {
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
    console.log('Change photo clicked');
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
      addAdmin: 'register',
      addLearner: 'add-learner',
      addStaffMember: 'add-stuff-member',
      addGuest: 'add-guest',
      openMessages: 'communication-center',
      generateReport: 'generate-report'
    };

    const route = routeMap[action];
    if (route) {
      this.router.navigate([route], {
        queryParams: { organizationId: this.organizationId }
      });
    } else {
      console.log(`Route not configured for this action ${action}`);
      alert(`Navigation for "${action}" is not yet configured.`);
    }
  }

  getProgressAreaPath(): string {
    const width = 600;
    const height = 200;
    const dataPoints = this.progressData.length;
    const stepX = width / (dataPoints - 1);
    
    let path = `M 0 ${height} `; 
    
    this.progressData.forEach((data, index) => {
      const x = index * stepX;
      const y = height - (data.value / 100 * height);
      
      if (index === 0) {
        path += `L ${x} ${y} `;
      } else {
        const prevX = (index - 1) * stepX;
        const prevY = height - (this.progressData[index - 1].value / 100 * height);
        const cpX = (prevX + x) / 2;
        path += `Q ${cpX} ${prevY} ${x} ${y} `;
      }
    });
    
    path += `L ${width} ${height} Z`;
    return path;
  }

  getProgressLinePath(): string {
    const width = 600;
    const height = 200;
    const dataPoints = this.progressData.length;
    const stepX = width / (dataPoints - 1);
    
    let path = '';
    
    this.progressData.forEach((data, index) => {
      const x = index * stepX;
      const y = height - (data.value / 100 * height);
      
      if (index === 0) {
        path += `M ${x} ${y} `;
      } else {
        const prevX = (index - 1) * stepX;
        const prevY = height - (this.progressData[index - 1].value / 100 * height);
        const cpX = (prevX + x) / 2;
        path += `Q ${cpX} ${prevY} ${x} ${y} `;
      }
    });
    
    return path;
  }

  settings(): void {
    this.router.navigate(['/admin-settings'], {
      queryParams: {
        organizationId: this.organizationId
      }
    })
  }

  logout(): void{
    var confirmed = confirm("Are you sure you want to log out?")

    if (confirmed) {
      console.log(`Logging ${this.adminName} out...`)
    }

    this.authService.logout();

    this.router.navigate(['/login']);

    if (isPlatformBrowser(this.platformId)) {
      console.log("logged out successfully")
    }
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
    if (this.organizationId) {
      this.communicationService.getMessages(this.organizationId).subscribe();
      this.communicationService.getUnreadCount(this.organizationId).subscribe();
    }
  }

  openCommunicationCenter(): void {
    this.router.navigate(['/communication-center']);
  }
}