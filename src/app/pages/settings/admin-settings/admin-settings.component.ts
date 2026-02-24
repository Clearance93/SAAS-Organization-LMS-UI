import { CommonModule, SlicePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, take, takeUntil } from 'rxjs';
import { SchoolProfile } from '../../../interfaces/schools/settings/school-profile';
import { GradeLevel } from '../../../interfaces/schools/settings/grade-level';
import { Course } from '../../../interfaces/schools/settings/course';
import { ExamType } from '../../../interfaces/schools/settings/exam-type';
import { Services } from '../../../interfaces/schools/settings/services';
import { UserRole } from '../../../interfaces/schools/settings/user-role';
import { ILibrary } from '../../../interfaces/library/ilibrary';
import { LibraryServicesService } from '../../../services/library/library-services.service';
import { SettingsCategory } from '../../../interfaces/schools/settings/settings-category';
import { SettingsService } from '../../../services/settings/settings.service';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FilterPipe } from '../../../filter-pipe';
import { ThemeService } from '../../../services/theme/theme.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SchoolAdminSettingsDto } from '../../../interfaces/settings/school-admin-settings-dto';
import { AddGradeModalComponent } from '../../modals/add-grade-modal/add-grade-modal.component';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { CourseStream } from '../../../interfaces/settings/course-stream';
import { IExamGradeScale } from '../../../interfaces/settings/iexam-grade-scale';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AdminDashboardService } from '../../../services/schoolDashboards/admin-dashboard.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    FilterPipe,
    NgbPaginationModule,
    SlicePipe
  ],
  templateUrl: './admin-settings.component.html',
  styleUrl: './admin-settings.component.css'
})
export class AdminSettingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeSection: string = 'general';
  searchQuery: string = '';

  generalForm!: FormGroup;
  examGradeForm!: FormGroup;

  organizationId: string = '';

  schoolProfile: SchoolProfile | null = null;
  grades: GradeLevel[] = [];
  courses: Course[] = [];
  examTypes: ExamType[] = [];
  examGradeScales: IExamGradeScale[] = [];
  selectedExamScale?: IExamGradeScale;
  services: Services[] = [];
  userRoles: UserRole[] = [];
  libraryItems: ILibrary[] = [];
  courseStreams: CourseStream[] = [];

  page = 1;
  pageSize = 5;

  isLoading: boolean = false;
  isSaving: boolean = false;
  isSavingGrade: boolean = false;
  isLoadingGrades: boolean = false;

  settingsCategories: SettingsCategory[] = [
    {
      id: 'general',
      icon: 'settings',
      label: 'General Settings',
      color: 'text-blue-600 bg-blue-100',
      description: 'School profile and basic configuration'
    },
    {
      id: 'courses',
      icon: 'menu_book',
      label: 'Courses & Curriculum',
      color: 'text-orange-600 bg-orange-100',
      description: 'Course management and curriculum'
    },
    {
      id: 'exams',
      icon: 'assignment',
      label: 'Exams & Assessment',
      color: 'text-purple-600 bg-purple-100',
      description: 'Exam types and grading'
    },
    {
      id: 'library',
      icon: 'local_library',
      label: 'Virtual Library',
      color: 'text-red-600 bg-red-100',
      description: 'Digital library resources'
    },
    {
      id: 'users',
      icon: 'people',
      label: 'User Invitation Links',
      color: 'text-pink-600 bg-pink-100',
      description: 'Generate links to send to users'
    },
    {
      id: 'integrations',
      icon: 'link',
      label: 'Integrations',
      color: 'text-cyan-600 bg-cyan-100',
      description: 'Third-party integrations'
    },
    {
      id: 'storage',
      icon: 'storage',
      label: 'Storage & Data',
      color: 'text-amber-600 bg-amber-100',
      description: 'Storage and back-up settings'
    },
    {
      id: 'billing',
      icon: 'credit_card',
      label: 'Billing',
      color: 'text-emerald-600 bg-emerald-100',
      description: 'Subscription and billing'
    }
  ];

  themeColors: string[] = [
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#06B6D4',
    '#EC4899'
  ];

  // Properties for the Virtual Library
  selectedLibraryBook: any = null;
  isBookModalActive: boolean = false;
  isAddBookModalActive: boolean = false;
  currentFilter: string = 'all';
  searchTerm: string = '';
  bookForm!: FormGroup;
  isEditMode: boolean = false;
  selectedImageFile: File | null = null;
  selectedPdfFile: File | null = null;
  imagePreview: string | null = null;
  pdfPreview: string | null = null;
  
  // PDF Reader properties
  isPdfReaderActive: boolean = false;
  currentPdfUrl: string = '';
  currentBookTitle: string = '';
  safePdfUrl: SafeResourceUrl | null = null;

  // Registration Link Generator properties
  selectedRole: string = 'student';
  maxUsers: number = 10;
  isGenerating: boolean = false;
  isLoadingLinks: boolean = false;
  registrationLinks: any[] = [];
  showApiModal: boolean = false;
  apiUrl: string = 'http://localhost:3000/api';
  toastMessage: string = '';
  showToast: boolean = false;
  toastSuccess: boolean = true;

  roleUrls: { [key: string]: string } = {
    student: 'http://localhost:4200/add-student',
    teacher: 'http://localhost:4200/add-teacher',
    admin: 'http://localhost:4200/register',
    learner: 'http://localhost:4200/add-learner',
    guest: 'http://localhost:4200/add-guest',
    staff: 'http://localhost:4200/add-staff'
  };

  // Integration properties
  availableIntegrations = [
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'Payment Gateway',
      description: 'Accept payments and manage subscriptions',
      icon: '💳',
      color: '#635BFF',
      enabled: false,
      configured: false,
      features: ['Payment Processing', 'Subscription Management', 'Invoicing']
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'Payment Gateway',
      description: 'Global payment processing solution',
      icon: '🅿️',
      color: '#0070BA',
      enabled: false,
      configured: false,
      features: ['Payment Processing', 'Buyer Protection', 'Multi-currency']
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      category: 'Cloud Storage',
      description: 'Store and share files in the cloud',
      icon: '📁',
      color: '#4285F4',
      enabled: false,
      configured: false,
      features: ['File Storage', 'Document Sharing', 'Collaboration']
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      category: 'Cloud Storage',
      description: 'Simple and secure file storage',
      icon: '📦',
      color: '#0061FF',
      enabled: false,
      configured: false,
      features: ['File Sync', 'Team Folders', 'File Recovery']
    },
    {
      id: 'zoom',
      name: 'Zoom',
      category: 'Video Conferencing',
      description: 'Virtual meetings and webinars',
      icon: '🎥',
      color: '#2D8CFF',
      enabled: false,
      configured: false,
      features: ['Video Meetings', 'Screen Sharing', 'Recording']
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      category: 'Collaboration',
      description: 'Chat, meetings, and collaboration',
      icon: '👥',
      color: '#6264A7',
      enabled: false,
      configured: false,
      features: ['Team Chat', 'Video Calls', 'File Sharing']
    },
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'Email Service',
      description: 'Email delivery and marketing platform',
      icon: '✉️',
      color: '#1A82E2',
      enabled: false,
      configured: false,
      features: ['Email Delivery', 'Templates', 'Analytics']
    },
    {
      id: 'twilio',
      name: 'Twilio',
      category: 'SMS & Communication',
      description: 'SMS, voice, and messaging APIs',
      icon: '📱',
      color: '#F22F46',
      enabled: false,
      configured: false,
      features: ['SMS Messaging', 'Voice Calls', 'WhatsApp API']
    },
    {
      id: 'aws-s3',
      name: 'AWS S3',
      category: 'Cloud Storage',
      description: 'Scalable cloud storage solution',
      icon: '☁️',
      color: '#FF9900',
      enabled: false,
      configured: false,
      features: ['Object Storage', 'Static Hosting', 'Backup']
    },
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'Analytics',
      description: 'Track and analyze website traffic',
      icon: '📊',
      color: '#E37400',
      enabled: false,
      configured: false,
      features: ['Traffic Analysis', 'User Behavior', 'Conversion Tracking']
    }
  ];

  selectedIntegration: any = null;
  isConfigModalOpen = false;
  integrationConfig: any = {};
  integrationSearchQuery = '';
  selectedCategory = 'all';




  constructor(
    private settingsService: SettingsService,
    private fb: FormBuilder,
    private themeService: ThemeService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private libraryService: LibraryServicesService,
    private adminDashboardService: AdminDashboardService
  ) {
    this.initializeForm();
    this.initializeExamGradeForm();
    this.initializeBookForm();
    this.currentFilter = 'all';
    this.searchTerm = '';
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.organizationId = params['organizationId'] || '';
        const requestedSection = params['section'] || '';
        console.log('Organization ID from URL:', this.organizationId, 'Requested section:', requestedSection);

        if (requestedSection) {
          // set the active section based on query param (e.g., 'library')
          this.setActiveSection(requestedSection);
        }

        if (this.organizationId) {
          this.loadSchoolSettings();
          this.loadOtherSettings();
          this.loadCourseStreamData();
          this.loadExamGradeScales();
          this.loadLibraryBooks();
        } else {
          console.warn('No organizationId Found in the Url Parameters');
          this.showErrorMessage('Organization Id is missing');
        }
      });

    this.subscribeToDataChanges();
    
    // Load API URL from localStorage
    if (typeof localStorage !== 'undefined') {
      const savedApiUrl = localStorage.getItem('apiBaseUrl');
      if (savedApiUrl) {
        this.apiUrl = savedApiUrl;
      }
    }

    // Subscribe to link usage notifications
    this.adminDashboardService.linkUsed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(linkUsage => {
        if (linkUsage) {
          console.log('Link used notification:', linkUsage);
          this.updateLinkUsageCount(linkUsage.linkId, linkUsage.count);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  backToDashboard(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  get filteredCategories(): SettingsCategory[] {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return this.settingsCategories;
    }

    const query = this.searchQuery.toLowerCase();
    return this.settingsCategories.filter(category =>
      category.label.toLowerCase().includes(query) ||
      category.description.toLowerCase().includes(query)
    );
  }

  setActiveSection(sectionId: string): void {
    this.activeSection = sectionId;

    if (sectionId === 'courses' && this.organizationId) {
      this.loadCourseStreamData();
    }

    if (sectionId === 'exams' && this.organizationId) {
      this.loadExamGradeScales();
    }

    if (sectionId === 'library') {
      this.currentFilter = 'all';
      this.searchTerm = '';
      if (this.organizationId) {
        this.loadLibraryBooks();
      }
    }

    if (sectionId === 'users' && this.organizationId) {
      this.loadLinks();
    }
  }

  private loadCourseStreamData(): void {
    if (!this.organizationId) {
      console.log('Cannot load course streams: organizationId is missing');
      return;
    }

    this.isLoading = true;

    this.settingsService.getAllCoursesStreamsByOrganizationId(this.organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoading = false;
          console.log('Course Streams loaded successfully:', this.courseStreams.length);
        },
        error: (error: any) => {
          console.error('Error loading course streams:', error);
          this.isLoading = false;
        }
      });
  }

  private subscribeToDataChanges(): void {
    this.settingsService.schoolProfile$
      .pipe(takeUntil(this.destroy$))
      .subscribe(profile => {
        this.schoolProfile = profile;

        if (profile) {
          this.generalForm.patchValue(profile);
        }

        if (profile?.themeColor) {
          this.themeService.setTheme(profile.themeColor);
        }
      });

    this.settingsService.grades$
      .pipe(takeUntil(this.destroy$))
      .subscribe(grades => this.grades = grades);

    this.settingsService.courses$
      .pipe(takeUntil(this.destroy$))
      .subscribe(courses => this.courses = courses);

    this.settingsService.examTypes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(types => this.examTypes = types);

    this.settingsService.examGradeScales$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scales => {
        this.examGradeScales = scales;
        console.log('Exam grade scales updated:', this.examGradeScales);
        if (scales && scales.length > 0 && !this.selectedExamScale) {
          this.selectedExamScale = scales[0];
        }
      });

    this.settingsService.services$
      .pipe(takeUntil(this.destroy$))
      .subscribe(services => this.services = services);

    this.settingsService.userRoles$
      .pipe(takeUntil(this.destroy$))
      .subscribe(roles => this.userRoles = roles);

    this.libraryService.library$
      .pipe(takeUntil(this.destroy$))
      .subscribe(books => {
        // Map LibraryModel to ILibrary
        this.libraryItems = books.map((book: any) => ({
          libraryId: book.libraryId || book.id || '',
          title: book.title || '',
          author: book.author || 'Unknown Author',
          genre: book.genre || 'General',
          description: book.description || '',
          coverPage: book.coverPage || book.coverImage,
          book: book.book || book.fileUrl
        }));
      });

    this.settingsService.courseStreams$
      .pipe(takeUntil(this.destroy$))
      .subscribe(courseStreams => {
        this.courseStreams = courseStreams;
        console.log('[AdminSettings] courseStreams updated, length=', this.courseStreams.length);
        const totalPages = Math.max(1, Math.ceil(this.courseStreams.length / this.pageSize));
        if (this.page > totalPages) {
          this.page = totalPages;
          console.log(`[AdminSettings] page adjusted to ${this.page} due to data change`);
        }
      });
  }

  private initializeForm(): void {
    this.generalForm = this.fb.group({
      name: ['', Validators.required],
      motto: [''],
      type: ['Combined', Validators.required],
      timeZone: ['Africa/Johannesburg', Validators.required],
      locale: ['en-ZA', Validators.required],
      themeColor: ['#3B82F6'],
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: ['']
    });
  }

  private initializeExamGradeForm(): void {
    this.examGradeForm = this.fb.group({
      passMark: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      poorMark: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      averageMark: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      excellentMark: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      distinctionMark: ['', [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  private initializeBookForm(): void {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      genre: ['', Validators.required],
      description: [''],
      year: ['', [Validators.required, Validators.min(1)]]
    });
  }

  private loadSchoolSettings(): void {
    this.isLoading = true;

    this.settingsService.getSchoolSettings(this.organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (settings) => {
          console.log('Loaded settings:', settings);

          if (settings) {
            this.generalForm.patchValue({
              name: settings.schoolName || '',
              motto: settings.schoolMotto || '',
              type: settings.schoolType || 'Combined',
              timeZone: settings.timeZone || 'Africa/Johannesburg',
              locale: settings.locale || 'en-ZA',
              contactEmail: settings.contactEmail || '',
              contactPhoneNumber: settings.contactPhoneNumber || ''
            });
          } else {
            console.log('No settings data received, using defaults');
          }

          this.isLoading = false;
        },

        error: (error) => {
          console.error('Error loading settings:', error);
          this.isLoading = false;
          
          // Set default values when API fails
          this.generalForm.patchValue({
            name: '',
            motto: '',
            type: 'Combined',
            timeZone: 'Africa/Johannesburg',
            locale: 'en-ZA',
            contactEmail: '',
            contactPhone: ''
          });
          
          console.log('Using default settings due to API error');
        }
      });
  }

  private loadOtherSettings(): void {
    this.settingsService.getGrades()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.settingsService.getCourses()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.settingsService.getExamTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.settingsService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.settingsService.getUserRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    this.settingsService.getLibraryItems()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private loadLibraryBooks(): void {
    console.log('AdminSettings: Loading library books for org:', this.organizationId);
    this.libraryService.loadLibraryBooks()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (books) => {
          console.log('Books loaded successfully:', books.length, 'books');
        },
        error: (err) => {
          console.error('Error loading library books:', err);
          this.showErrorMessage('Failed to load library books');
        }
      });
  }

  saveGeneralSettings(): void {
    if (this.generalForm.invalid) {
      this.showErrorMessage('Please fill in all required fields');
      return;
    }

    if (!this.organizationId) {
      this.showErrorMessage('Organization Id is missing. Cannot save settings.');
      return;
    }

    this.isSaving = true;

    const formValue = this.generalForm.value;

    const settingDto: SchoolAdminSettingsDto = {
      organizationId: this.organizationId,
      schoolName: formValue.name,
      schoolType: formValue.type,
      schoolMotto: formValue.motto || '',
      timeZone: formValue.timeZone,
      locale: formValue.locale,
      contactEmail: formValue.contactEmail,
      contactPhoneNumber: formValue.contactPhone || ''
    };

    console.log('Saving settings:', settingDto);

    this.settingsService.createSchoolSettings(settingDto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.showSuccessMessage('General settings saved successfully');
          this.themeService.setTheme(formValue.themeColor);
        },
        error: (err) => {
          this.isSaving = false;
          this.showErrorMessage('Failed to save settings');
          console.error('Error saving settings:', err);
        }
      });
  }

  // ==================== EXAM GRADE SCALE METHODS ====================

  loadExamGradeScales(): void {
    if (!this.organizationId) {
      console.warn('Cannot load exam grade scales: organizationId is missing');
      return;
    }

    this.isLoadingGrades = true;

    this.settingsService.getExamGradeScales(this.organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isLoadingGrades = false;
          console.log('Exam grade scales loaded:', this.examGradeScales.length);
        },
        error: (err: any) => {
          this.isLoadingGrades = false;
          console.error('Error loading exam grade scales:', err);
          this.showErrorMessage('Failed to load grading scales');
        }
      });
  }

  saveExamGradeScale(): void {
    if (this.examGradeForm.invalid) {
      this.markFormGroupTouched(this.examGradeForm);
      this.showErrorMessage('Please fill in all required fields correctly');
      return;
    }

    if (!this.organizationId) {
      this.showErrorMessage('Organization ID is missing. Cannot save grading scale.');
      return;
    }

    const { poorMark, passMark, averageMark, excellentMark, distinctionMark } = this.examGradeForm.value;

    const poor = Number(poorMark);
    const pass = Number(passMark);
    const average = Number(averageMark);
    const excellent = Number(excellentMark);
    const distinction = Number(distinctionMark);

    if (poor >= pass || pass >= average || average >= excellent || excellent >= distinction) {
      this.showErrorMessage('Grade thresholds must be in ascending order: Poor < Pass < Average < Excellent < Distinction');
      return;
    }

    this.isSavingGrade = true;

    const payload = {
      organizationId: this.organizationId,
      passMark: pass,
      distinctionMark: distinction,
      excellentMark: excellent,
      averageMark: average,
      poorMark: poor
    };

    console.log('Saving exam grade scale:', payload);

    this.settingsService.addExamGradeScales(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newScale) => {
          this.isSavingGrade = false;
          this.showSuccessMessage('Grading scale added successfully');
          this.resetGradeForm();
          this.loadExamGradeScales();
          if (!this.selectedExamScale) {
            this.selectedExamScale = newScale;
          }
        },
        error: (err: any) => {
          this.isSavingGrade = false;
          this.showErrorMessage('Failed to save grading scale');
          console.error('Error saving grading scale:', err);
        }
      });
  }

  resetGradeForm(): void {
    this.examGradeForm.reset();
    this.examGradeForm.markAsUntouched();
    this.examGradeForm.markAsPristine();
  }

  setActiveScale(scale: IExamGradeScale): void {
    this.selectedExamScale = scale;
    this.showSuccessMessage('Active grading scale updated');
  }

  editGradeScale(scale: IExamGradeScale): void {
    this.examGradeForm.patchValue({
      passMark: scale.passMark,
      poorMark: scale.poorMark,
      averageMark: scale.averageMark,
      excellentMark: scale.excellentMark,
      distinctionMark: scale.distinctionMark
    });
    setTimeout(() => {
      const formElement = document.querySelector('.grading-form-card');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    this.showSuccessMessage('Grading scale loaded for editing. Modify and save to create a new version.');
  }

  deleteGradeScale(scale: IExamGradeScale): void {
    if (!scale.examGradeScaleId) {
      console.error('Cannot delete: examGradeScaleId is missing');
      return;
    }

    const doDelete = () => {
      this.settingsService.deleteExamGradeScale(scale.examGradeScaleId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Grading scale deleted successfully');

            if (this.selectedExamScale?.examGradeScaleId === scale.examGradeScaleId) {
              const remaining = this.examGradeScales.filter(s => s.examGradeScaleId !== scale.examGradeScaleId);
              this.selectedExamScale = remaining.length > 0 ? remaining[0] : undefined;
            }

            this.loadExamGradeScales();
          },
          error: (err: any) => {
            console.error('Error deleting grading scale:', err);
            this.showErrorMessage('Failed to delete grading scale');
          }
        });
    };

    // Show confirmation dialog
    // Show confirmation dialog
    try {
      if (Swal && typeof Swal.fire === 'function') {
        Swal.fire({
          title: 'Delete Grading Scale',
          text: 'Are you sure you want to delete this grading scale? This action cannot be undone.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then(result => {
          if (result.isConfirmed) {
            doDelete();
          }
        });
        return;
      }
    } catch (e) {
      console.warn('Swal not available, using confirm dialog');
    }

    if (confirm('Are you sure you want to delete this grading scale?')) {
      doDelete();
    }
  }

  // ==================== OTHER METHODS ====================

  selectThemeColor(color: string): void {
    this.generalForm.patchValue({ themeColor: color });
    this.themeService.setTheme(color);
  }

  toggleGrade(grade: GradeLevel): void {
    this.settingsService.updateGrade(grade.id, { active: !grade.active })
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  get activeCourses(): Course[] {
    return this.courses.filter(c => c.status === 'Active');
  }

  get inactiveCourses(): Course[] {
    return this.courses.filter(c => c.status === 'Inactive');
  }

  toggleServiceStatus(service: Services): void {
    this.settingsService.toggleService(service.id, !service.enabled)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.showSuccessMessage(`${service.name} ${service.enabled ? 'disabled' : 'enabled'}`),
        error: () => this.showErrorMessage('Failed to update service')
      });
  }

  getRoleColor(roleName: string): string {
    const colors: Record<string, string> = {
      'Admin': 'bg-red-100 text-red-700 border-red-300',
      'Teacher': 'bg-blue-100 text-blue-700 border-blue-300',
      'Student': 'bg-green-100 text-green-700 border-green-300',
      'Exam Officer': 'bg-purple-100 text-purple-700 border-purple-300',
      'Librarian': 'bg-orange-100 text-orange-700 border-orange-300'
    };
    return colors[roleName] || 'bg-gray-100 text-gray-700 border-gray-300';
  }

  private showSuccessMessage(message: string): void {
    console.log('Success:', message);
    
    try {
      if (Swal && typeof Swal.fire === 'function') {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: message,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (e) {
      console.log('Swal not available, message:', message);
    }
  }

  private showErrorMessage(message: string): void {
    console.error('Error:', message);
    
    try {
      if (Swal && typeof Swal.fire === 'function') {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: message
        });
      }
    } catch (e) {
      alert(message);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id || item.courseStreamId || item.examGradeScaleId || index;
  }

  addGrade(): void {
    const dialogRef = this.dialog.open(AddGradeModalComponent, {
      width: '500px',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: { organizationId: this.organizationId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.settingsService.getGrades().pipe(take(1)).subscribe(() => {
          this.showSuccessMessage('Grade added successfully');
          this.setActiveSection('academic');
        });
      }
    });
  }

  addCourse(): void {
    this.router.navigate(['../add-course-stream'], {
      relativeTo: this.route,
      queryParams: { organizationId: this.organizationId }
    });
  }

  addSubject(): void {
    this.router.navigate(['../add-school-subject'], {
      relativeTo: this.route,
      queryParams: { organizationId: this.organizationId }
    });
  }

  editCourseStream(stream: CourseStream): void {
    const courseStreamId = stream.courseStreamId || (stream as any).id || '';
    if (!courseStreamId) {
      console.error('editCourseStream: no id found on stream', stream);
      return;
    }

    console.log('Navigating to edit stream with ID:', courseStreamId);

    this.router.navigate(['/edit-course-stream'], {
      queryParams: { courseStreamId, organizationId: this.organizationId }
    });
  }

  addSubjectStream(stream: CourseStream): void {
    const courseStreamId = stream.courseStreamId || (stream as any).id || '';

    if (!courseStreamId) {
      console.error('addSubjectStream: no id found on stream', stream);
      return;
    }

    console.log(`${stream} Navigating to add subject stream with ID:`, courseStreamId);

    this.router.navigate(['/details'], {
      queryParams: { courseStreamId, organizationId: this.organizationId }
    });
  }

  deleteCourseStream(stream: CourseStream): void {
    console.log('deleteCourseStream called for', stream);
    const courseStreamId = stream.courseStreamId || (stream as any).id || '';
    if (!courseStreamId) {
      console.error('deleteCourseStream: no id found on stream', stream);
      return;
    }

    const doDelete = () => {
      console.log('Proceeding to delete id=', courseStreamId);
      this.settingsService.deleteCourseStream(courseStreamId).pipe(take(1)).subscribe({
        next: () => {
          console.log('Delete successful for id=', courseStreamId);
          try {
            Swal.fire('Deleted!', 'Course stream has been deleted.', 'success');
          } catch (e) { /* ignore */ }
          const totalPages = Math.max(1, Math.ceil(this.courseStreams.length / this.pageSize));
          if (this.page > totalPages) {
            this.page = totalPages;
          }
        },
        error: (err) => {
          console.error('Error deleting course stream:', err);
          try {
            Swal.fire('Error', 'Failed to delete course stream. Please try again.', 'error');
          } catch (e) {
            alert('Failed to delete course stream.');
          }
        }
      });
    };

    try {
      if (Swal && typeof Swal.fire === 'function') {
        Swal.fire({
          title: 'Delete Course Stream',
          text: `Are you sure you want to delete "${stream.courseStreamName || 'this stream'}"? This action cannot be undone.`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Yes, delete it',
          cancelButtonText: 'Cancel',
          reverseButtons: true
        }).then(result => {
          if (result.isConfirmed) {
            doDelete();
          }
        });
        return;
      }
    } catch (e) {
      console.warn('Swal check failed, falling back to confirm', e);
    }

    if (confirm(`Are you sure you want to delete "${stream.courseStreamName || 'this stream'}"?`)) {
      doDelete();
    }
  }

  // ==================== VIRTUAL LIBRARY METHODS ====================

  getFilteredBooks(): ILibrary[] {
    return this.libraryItems.filter(book => {
      const matchesFilter = this.currentFilter === 'all' || book.genre === this.currentFilter;
      const matchesSearch = book.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                          book.genre.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  getGenres(): string[] {
    const filteredBooks = this.getFilteredBooks();
    return [...new Set(filteredBooks.map(book => book.genre))];
  }

  getBooksByGenre(genre: string): ILibrary[] {
    return this.getFilteredBooks().filter(book => book.genre === genre);
  }

  setFilter(genre: string): void {
    this.currentFilter = genre;
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  openBookModal(book: any): void {
    this.selectedLibraryBook = book;
    this.isBookModalActive = true;
  }

  closeBookModal(): void {
    this.isBookModalActive = false;
    setTimeout(() => {
      this.selectedLibraryBook = null;
    }, 300);
  }

  closeBookModalOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeBookModal();
    }
  }

  // ==================== BOOK MANAGEMENT METHODS ====================

  openAddBookModal(): void {
    this.isEditMode = false;
    this.bookForm.reset();
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.imagePreview = null;
    this.pdfPreview = null;
    this.isAddBookModalActive = true;
  }

  closeAddBookModal(): void {
    this.isAddBookModalActive = false;
    this.isEditMode = false;
    this.bookForm.reset();
    this.selectedImageFile = null;
    this.selectedPdfFile = null;
    this.imagePreview = null;
    this.pdfPreview = null;
  }

  closeAddBookModalOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeAddBookModal();
    }
  }

  editBook(book: ILibrary): void {
    this.isEditMode = true;
    this.selectedLibraryBook = book;
    this.bookForm.patchValue({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description,
      year: new Date().getFullYear()
    });
    this.isAddBookModalActive = true;
  }

  deleteBook(book: ILibrary): void {
    Swal.fire({
      title: 'Delete Book?',
      text: `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.libraryService.deleteBook(book.libraryId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.showSuccessMessage('Book deleted successfully');
              setTimeout(() => {
                location.reload();
              }, 1500);
            },
            error: (error) => {
              console.error('Error deleting book:', error);
              this.showErrorMessage('Failed to delete book');
            }
          });
      }
    });
  }

  saveBook(): void {
    if (this.bookForm.invalid) {
      this.markFormGroupTouched(this.bookForm);
      return;
    }

    const formValue = this.bookForm.value;
    const bookData: ILibrary = {
      libraryId: this.isEditMode ? this.selectedLibraryBook.libraryId : '',
      title: formValue.title,
      author: formValue.author,
      genre: formValue.genre,
      description: formValue.description,
      coverPage: this.imagePreview || null, // Send base64 image string
      book: this.pdfPreview || null // Send base64 PDF string
    };

    console.log('Saving book with data:', bookData);
    console.log('Book data keys:', Object.keys(bookData));

    if (this.isEditMode) {
      const payload: any = { ...bookData };
      payload.organizationId = this.organizationId;
      this.libraryService.updateBook(this.selectedLibraryBook.libraryId, payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Book updated successfully');
            this.loadLibraryBooks();
            this.closeAddBookModal();
          },
          error: (error) => {
            console.error('Error updating book:', error);
            this.showErrorMessage('Failed to update book');
          }
        });
    } else {
      const payload: any = { ...bookData };
      payload.organizationId = this.organizationId;
      this.libraryService.addBook(payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.showSuccessMessage('Book added successfully');
            this.loadLibraryBooks();
            this.closeAddBookModal();
          },
          error: (error) => {
            console.error('Error adding book:', error);
            // Prefer backend-supplied message when available
            let msg = 'Failed to add book';
            if (error instanceof Error && error.message) {
              msg = `Failed to add book: ${error.message}`;
            } else if (error?.error?.message) {
              msg = `Failed to add book: ${error.error.message}`;
            } else if (error?.message) {
              msg = `Failed to add book: ${error.message}`;
            }
            this.showErrorMessage(msg);
          }
        });
    }
  }

  onImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onPdfSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file && file.type === 'application/pdf') {
      this.selectedPdfFile = file;
      // Read PDF file as base64
      const reader = new FileReader();
      reader.onload = (e) => {
        this.pdfPreview = e.target?.result as string;
        console.log('PDF loaded as base64, size:', this.pdfPreview.length);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImageFile = null;
    this.imagePreview = null;
  }

  removePdf(): void {
    this.selectedPdfFile = null;
    this.pdfPreview = null;
  }

  // ==================== PDF READER METHODS ====================

  openPdfReader(book: ILibrary): void {
    this.currentBookTitle = book.title;
    this.currentPdfUrl = book.book || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.currentPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`
    );
    this.isPdfReaderActive = true;
  }

  closePdfReader(): void {
    this.isPdfReaderActive = false;
    this.currentPdfUrl = '';
    this.currentBookTitle = '';
    this.safePdfUrl = null;
  }

  closePdfReaderOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closePdfReader();
    }
  }

  onPdfLoad(): void {
    console.log('PDF loaded successfully');
  }

  onPdfError(): void {
    console.error('Error loading PDF');
    this.showErrorMessage('Failed to load PDF. Please try again.');
  }

  private getRandomGradient(): string {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  }


  showApiConfig(): void {
    this.showApiModal = true;
  }

  closeApiConfig(): void {
    this.showApiModal = false;
  }

  saveApiConfig(): void {
    if (this.apiUrl.trim()) {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('apiBaseUrl', this.apiUrl);
      }
      this.displayToast('API configuration saved! ✅', true);
      this.closeApiConfig();
    } else {
      this.displayToast('Please enter a valid API URL', false);
    }
  }

  generateLink(): void {
    if (!this.organizationId) {
      this.displayToast('Please enter an Organization ID', false);
      return;
    }

    if (!this.maxUsers || this.maxUsers < 1) {
      this.displayToast('Please enter a valid maximum users count', false);
      return;
    }

    this.isGenerating = true;

    // Use AdminDashboardService to generate the link
    this.adminDashboardService.generateRegistrationLink(this.organizationId, this.selectedRole, this.maxUsers)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (generatedUrl: string) => {
          console.log('Generated URL from API:', generatedUrl);
          
          // Create a link object with the API-generated URL
          const linkData = {
            id: this.generateId(),
            organizationId: this.organizationId,
            role: this.selectedRole,
            maxUsers: this.maxUsers,
            usedCount: 0,
            active: true,
            createdAt: new Date().toISOString(),
            apiGeneratedUrl: generatedUrl.trim() // Use the actual API response
          };
          
          // Store in localStorage for display
          if (typeof localStorage !== 'undefined') {
            const existingLinks = JSON.parse(localStorage.getItem('registrationLinks') || '[]');
            existingLinks.push(linkData);
            localStorage.setItem('registrationLinks', JSON.stringify(existingLinks));
          }
          
          this.showSuccessMessage('Link generated successfully! ✨');
          this.loadLinks();
          this.maxUsers = 10;
          this.isGenerating = false;
        },
        error: (error: any) => {
          console.error('Error generating link:', error);
          this.showErrorMessage('Error generating link: ' + error.message);
          this.isGenerating = false;
        }
      });
  }

  async loadLinks(): Promise<void> {
    this.isLoadingLinks = true;

    try {
      // Try API first, fallback to localStorage if API is not available
      try {
        const response = await fetch(`${this.apiUrl}/registration-links?organizationId=${this.organizationId}`);
        
        if (!response.ok) {
          throw new Error('API not available');
        }

        this.registrationLinks = await response.json();
      } catch (apiError) {
        // Fallback to localStorage
        if (typeof localStorage !== 'undefined') {
          const storedLinks = JSON.parse(localStorage.getItem('registrationLinks') || '[]');
          this.registrationLinks = storedLinks.filter((link: any) => link.organizationId === this.organizationId);
        } else {
          this.registrationLinks = [];
        }
      }

    } catch (error: any) {
      console.error('Error loading links:', error);
      this.registrationLinks = [];
    } finally {
      this.isLoadingLinks = false;
    }
  }

  deleteLink(linkId: string): void {
    Swal.fire({
      title: 'Delete Registration Link?',
      text: 'Are you sure you want to delete this registration link? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove from localStorage (since we're storing locally for now)
        if (typeof localStorage !== 'undefined') {
          const storedLinks = JSON.parse(localStorage.getItem('registrationLinks') || '[]');
          const updatedLinks = storedLinks.filter((link: any) => link.id !== linkId);
          localStorage.setItem('registrationLinks', JSON.stringify(updatedLinks));
        }
        
        this.showSuccessMessage('Registration link deleted successfully');
        this.loadLinks();
      }
    });
  }

  copyLink(url: string): void {
    navigator.clipboard.writeText(url).then(() => {
      this.displayToast('Link copied to clipboard! 📋', true);
    });
  }

  getFullUrl(link: any): string {
    // If the link has an API-generated URL, use that
    if (link.apiGeneratedUrl) {
      return link.apiGeneratedUrl;
    }
    
    // Fallback to the original method
    const baseUrl = this.roleUrls[link.role];
    return `${baseUrl}?organizationId=${link.organizationId}&linkId=${link.id}`;
  }

  isLinkExpired(link: any): boolean {
    return link.usedCount >= link.maxUsers || !link.active;
  }

  getUsagePercentage(link: any): number {
    return (link.usedCount / link.maxUsers) * 100;
  }

  formatDate(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${dateStr} ${timeStr}`;
  }

  displayToast(message: string, success: boolean): void {
    this.toastMessage = message;
    this.toastSuccess = success;
    this.showToast = true;
    
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }

  generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  updateLinkUsageCount(linkId: string, newCount: number): void {
    if (typeof localStorage !== 'undefined') {
      const storedLinks = JSON.parse(localStorage.getItem('registrationLinks') || '[]');
      const updatedLinks = storedLinks.map((link: any) => {
        if (link.id === linkId) {
          return { ...link, usedCount: newCount };
        }
        return link;
      });
      localStorage.setItem('registrationLinks', JSON.stringify(updatedLinks));
    }
    this.loadLinks();
  }

  // ==================== INTEGRATION METHODS ====================

  get integrationCategories(): string[] {
    const categories = ['all', ...new Set(this.availableIntegrations.map(i => i.category))];
    return categories;
  }

  get filteredIntegrations() {
    let filtered = this.availableIntegrations;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(i => i.category === this.selectedCategory);
    }

    // Filter by search query
    if (this.integrationSearchQuery.trim()) {
      const query = this.integrationSearchQuery.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(query) ||
        i.description.toLowerCase().includes(query) ||
        i.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  openIntegrationConfig(integration: any): void {
    this.selectedIntegration = integration;
    this.integrationConfig = {
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
      testMode: true
    };
    this.isConfigModalOpen = true;
  }

  closeIntegrationConfig(): void {
    this.isConfigModalOpen = false;
    this.selectedIntegration = null;
    this.integrationConfig = {};
  }

  saveIntegrationConfig(): void {
    if (!this.selectedIntegration) return;

    // Validate required fields
    if (!this.integrationConfig.apiKey) {
      this.showErrorMessage('API Key is required');
      return;
    }

    // In a real application, you would save this to your backend
    console.log('Saving integration config:', {
      integration: this.selectedIntegration.id,
      config: this.integrationConfig
    });

    // Update the integration status
    const integration = this.availableIntegrations.find(i => i.id === this.selectedIntegration.id);
    if (integration) {
      integration.configured = true;
      integration.enabled = true;
    }

    this.showSuccessMessage(`${this.selectedIntegration.name} configured successfully`);
    this.closeIntegrationConfig();
  }

  toggleIntegration(integration: any): void {
    if (!integration.configured) {
      this.openIntegrationConfig(integration);
      return;
    }

    integration.enabled = !integration.enabled;
    const status = integration.enabled ? 'enabled' : 'disabled';
    this.showSuccessMessage(`${integration.name} ${status}`);
  }

  disconnectIntegration(integration: any, event: Event): void {
    event.stopPropagation();
    
    Swal.fire({
      title: 'Disconnect Integration?',
      text: `Are you sure you want to disconnect ${integration.name}? This will remove all configuration.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, disconnect',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        integration.configured = false;
        integration.enabled = false;
        this.showSuccessMessage(`${integration.name} disconnected successfully`);
      }
    });
  }

  getIntegrationStatusColor(integration: any): string {
    if (!integration.configured) return 'status-not-configured';
    if (integration.enabled) return 'status-active';
    return 'status-inactive';
  }

  getIntegrationStatusText(integration: any): string {
    if (!integration.configured) return 'Not Configured';
    if (integration.enabled) return 'Active';
    return 'Inactive';
  }

  getConfiguredIntegrationsCount(): number {
    return this.availableIntegrations.filter(i => i.configured).length;
  }

  getEnabledIntegrationsCount(): number {
    return this.availableIntegrations.filter(i => i.enabled).length;
  }

  // Storage & Data properties
  storageStats = {
    total: 100, // GB
    used: 45.8, // GB
    available: 54.2, // GB
    percentage: 45.8
  };

  storageBreakdown = [
    {
      category: 'Student Records',
      size: 15.2,
      percentage: 33.2,
      color: '#3b82f6',
      icon: '👨🎓',
      items: 2450
    },
    {
      category: 'Documents & Files',
      size: 12.8,
      percentage: 27.9,
      color: '#10b981',
      icon: '📄',
      items: 1890
    },
    {
      category: 'Library Books (PDFs)',
      size: 8.5,
      percentage: 18.6,
      color: '#f59e0b',
      icon: '📚',
      items: 340
    },
    {
      category: 'Images & Media',
      size: 6.3,
      percentage: 13.8,
      color: '#8b5cf6',
      icon: '🖼️',
      items: 1560
    },
    {
      category: 'Exam Papers',
      size: 2.5,
      percentage: 5.5,
      color: '#ef4444',
      icon: '📝',
      items: 680
    },
    {
      category: 'Other',
      size: 0.5,
      percentage: 1.0,
      color: '#6b7280',
      icon: '📦',
      items: 120
    }
  ];

  backupSettings = {
    autoBackup: true,
    frequency: 'daily', // daily, weekly, monthly
    time: '02:00',
    retention: 30, // days
    includeMedia: true,
    includeDocuments: true,
    includeDatabase: true,
    cloudProvider: 'google-drive', // google-drive, dropbox, aws-s3, local
    lastBackup: new Date(Date.now() - 86400000), // Yesterday
    nextBackup: new Date(Date.now() + 3600000), // In 1 hour
    backupStatus: 'success' // success, failed, in-progress
  };

  backupHistory = [
    {
      id: 'backup_001',
      date: new Date(Date.now() - 86400000),
      size: 42.5,
      status: 'completed',
      duration: '12m 34s',
      type: 'automatic'
    },
    {
      id: 'backup_002',
      date: new Date(Date.now() - 172800000),
      size: 41.8,
      status: 'completed',
      duration: '11m 52s',
      type: 'automatic'
    },
    {
      id: 'backup_003',
      date: new Date(Date.now() - 259200000),
      size: 43.2,
      status: 'completed',
      duration: '13m 18s',
      type: 'manual'
    },
    {
      id: 'backup_004',
      date: new Date(Date.now() - 345600000),
      size: 40.9,
      status: 'failed',
      duration: '2m 15s',
      type: 'automatic',
      error: 'Connection timeout'
    },
    {
      id: 'backup_005',
      date: new Date(Date.now() - 432000000),
      size: 42.1,
      status: 'completed',
      duration: '12m 08s',
      type: 'automatic'
    }
  ];

  dataRetentionPolicies = [
    {
      id: 'student-records',
      name: 'Student Records',
      retention: 'permanent',
      description: 'Keep indefinitely for historical records',
      enabled: true
    },
    {
      id: 'exam-results',
      name: 'Exam Results',
      retention: '7-years',
      description: 'Required for compliance',
      enabled: true
    },
    {
      id: 'attendance-logs',
      name: 'Attendance Logs',
      retention: '3-years',
      description: 'Historical attendance data',
      enabled: true
    },
    {
      id: 'activity-logs',
      name: 'System Activity Logs',
      retention: '90-days',
      description: 'System audit trail',
      enabled: true
    },
    {
      id: 'temp-files',
      name: 'Temporary Files',
      retention: '7-days',
      description: 'Automatically clean up temp files',
      enabled: true
    }
  ];

  exportOptions = [
    {
      id: 'students',
      name: 'Student Data',
      format: 'CSV',
      icon: '👨🎓',
      description: 'Export all student information'
    },
    {
      id: 'teachers',
      name: 'Teacher Data',
      format: 'CSV',
      icon: '👨🏫',
      description: 'Export teacher profiles and assignments'
    },
    {
      id: 'grades',
      name: 'Grades & Results',
      format: 'XLSX',
      icon: '📊',
      description: 'Export all examination results'
    },
    {
      id: 'attendance',
      name: 'Attendance Records',
      format: 'CSV',
      icon: '📅',
      description: 'Export attendance history'
    },
    {
      id: 'full-backup',
      name: 'Complete Database',
      format: 'SQL',
      icon: '💾',
      description: 'Full database export'
    }
  ];

  isBackingUp = false;
  isExporting = false;
  selectedExportType = '';
  isSavingStorage = false;

  // Storage & Data Methods
  updateStorageStats(): void {
    this.isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      // In real app, fetch from backend
      this.storageStats.used = Math.random() * 80 + 20;
      this.storageStats.available = this.storageStats.total - this.storageStats.used;
      this.storageStats.percentage = (this.storageStats.used / this.storageStats.total) * 100;
      
      this.isLoading = false;
      this.showSuccessMessage('Storage statistics updated');
    }, 1000);
  }

  initiateBackup(): void {
    Swal.fire({
      title: 'Start Manual Backup?',
      text: 'This will create a backup of all your data. This may take several minutes.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Start Backup',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.performBackup();
      }
    });
  }

  performBackup(): void {
    this.isBackingUp = true;
    this.backupSettings.backupStatus = 'in-progress';
    
    // Simulate backup process
    setTimeout(() => {
      const newBackup = {
        id: `backup_${Date.now()}`,
        date: new Date(),
        size: this.storageStats.used,
        status: 'completed',
        duration: '10m 23s',
        type: 'manual'
      };
      
      this.backupHistory.unshift(newBackup);
      this.backupSettings.lastBackup = new Date();
      this.backupSettings.backupStatus = 'success';
      this.isBackingUp = false;
      
      this.showSuccessMessage('Backup completed successfully');
    }, 3000);
  }

  saveBackupSettings(): void {
    if (!this.backupSettings.frequency || !this.backupSettings.time) {
      this.showErrorMessage('Please configure all backup settings');
      return;
    }
    
    this.isSavingStorage = true;
    
    // Simulate API call
    setTimeout(() => {
      this.isSavingStorage = false;
      this.showSuccessMessage('Backup settings saved successfully');
      
      // Calculate next backup time
      const now = new Date();
      const nextBackup = new Date();
      const [hours, minutes] = this.backupSettings.time.split(':');
      nextBackup.setHours(parseInt(hours), parseInt(minutes), 0);
      
      if (nextBackup <= now) {
        nextBackup.setDate(nextBackup.getDate() + 1);
      }
      
      this.backupSettings.nextBackup = nextBackup;
    }, 1000);
  }

  downloadBackup(backup: any): void {
    this.showSuccessMessage(`Downloading backup: ${backup.id}`);
    
    // In real app, trigger actual download
    console.log('Downloading backup:', backup);
  }

  deleteBackup(backup: any, event: Event): void {
    event.stopPropagation();
    
    Swal.fire({
      title: 'Delete Backup?',
      text: `Are you sure you want to delete backup ${backup.id}? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.backupHistory.findIndex(b => b.id === backup.id);
        if (index > -1) {
          this.backupHistory.splice(index, 1);
          this.showSuccessMessage('Backup deleted successfully');
        }
      }
    });
  }

  restoreBackup(backup: any): void {
    Swal.fire({
      title: 'Restore from Backup?',
      html: `
        <p>This will restore your system to the state from:</p>
        <p><strong>${this.formatDateTime(backup.date)}</strong></p>
        <p style="color: #dc2626; margin-top: 1rem;">
          <strong>⚠️ Warning:</strong> Current data will be replaced!
        </p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      confirmButtonText: 'Yes, restore',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.showSuccessMessage('Restore initiated. This may take several minutes...');
        // In real app, trigger restore process
      }
    });
  }

  toggleRetentionPolicy(policy: any): void {
    policy.enabled = !policy.enabled;
    const status = policy.enabled ? 'enabled' : 'disabled';
    this.showSuccessMessage(`${policy.name} retention policy ${status}`);
  }

  updateRetentionPeriod(policy: any, newPeriod: string): void {
    policy.retention = newPeriod;
    this.showSuccessMessage(`${policy.name} retention period updated`);
  }

  onRetentionChange(policy: any, event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.updateRetentionPeriod(policy, target.value);
  }

  exportData(exportType: any): void {
    this.selectedExportType = exportType.id;
    this.isExporting = true;
    
    Swal.fire({
      title: 'Export Data',
      html: `
        <p>Preparing to export: <strong>${exportType.name}</strong></p>
        <p>Format: <strong>${exportType.format}</strong></p>
        <p style="margin-top: 1rem; color: #6b7280;">
          This may take a few moments depending on the data size.
        </p>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Export',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate export
        setTimeout(() => {
          this.isExporting = false;
          this.selectedExportType = '';
          this.showSuccessMessage(`${exportType.name} exported successfully`);
        }, 2000);
      } else {
        this.isExporting = false;
        this.selectedExportType = '';
      }
    });
  }

  cleanupTempFiles(): void {
    Swal.fire({
      title: 'Clean Up Temporary Files?',
      text: 'This will delete all temporary files and free up storage space.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Clean Up',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        
        // Simulate cleanup
        setTimeout(() => {
          const freedSpace = Math.random() * 2 + 0.5;
          this.storageStats.used -= freedSpace;
          this.storageStats.available += freedSpace;
          this.storageStats.percentage = (this.storageStats.used / this.storageStats.total) * 100;
          
          this.isLoading = false;
          this.showSuccessMessage(`Cleaned up ${freedSpace.toFixed(2)} GB of temporary files`);
        }, 2000);
      }
    });
  }

  getBackupStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'completed': 'status-success',
      'failed': 'status-error',
      'in-progress': 'status-progress'
    };
    return colors[status] || 'status-default';
  }

  getBackupStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'completed': '✅',
      'failed': '❌',
      'in-progress': '⏳'
    };
    return icons[status] || '📦';
  }

  formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-ZA', options);
  }

  formatFileSize(sizeGB: number): string {
    if (sizeGB < 1) {
      return `${(sizeGB * 1024).toFixed(0)} MB`;
    }
    return `${sizeGB.toFixed(1)} GB`;
  }

  getStorageColor(): string {
    if (this.storageStats.percentage >= 90) return '#ef4444';
    if (this.storageStats.percentage >= 75) return '#f59e0b';
    return '#10b981';
  }

  // Billing properties
  currentSubscription = {
    plan: 'Professional',
    status: 'active',
    price: 2499,
    currency: 'ZAR',
    billingCycle: 'monthly',
    startDate: new Date('2024-01-15'),
    renewalDate: new Date('2025-01-15'),
    autoRenew: true,
    users: 150,
    maxUsers: 250,
    storage: '100 GB',
    features: [
      'Unlimited Students',
      'Advanced Analytics',
      'Priority Support',
      'Custom Branding',
      'API Access',
      'Mobile Apps'
    ]
  };

  availablePlans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small schools',
      price: 999,
      annualPrice: 9990,
      popular: false,
      features: [
        'Up to 100 students',
        'Basic reporting',
        'Email support',
        '10 GB storage',
        'Core features',
        'Mobile access'
      ],
      limits: {
        students: '100',
        storage: '10 GB'
      }
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Most popular for medium schools',
      price: 2499,
      annualPrice: 24990,
      popular: true,
      features: [
        'Up to 500 students',
        'Advanced analytics',
        'Priority support',
        '100 GB storage',
        'All features',
        'Custom branding',
        'API access'
      ],
      limits: {
        students: '500',
        storage: '100 GB'
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large institutions',
      price: 5999,
      annualPrice: 59990,
      popular: false,
      features: [
        'Unlimited students',
        'Custom analytics',
        'Dedicated support',
        'Unlimited storage',
        'White-label solution',
        'Custom integrations'
      ],
      limits: {
        students: 'Unlimited',
        storage: 'Unlimited'
      }
    }
  ];

  invoices = [
    {
      id: 'INV-2024-001',
      date: new Date('2024-12-01'),
      amount: 2499,
      status: 'paid',
      description: 'Professional Plan - December 2024',
      paymentMethod: 'Credit Card',
      dueDate: new Date('2024-12-05'),
      paidDate: new Date('2024-12-02')
    },
    {
      id: 'INV-2024-002',
      date: new Date('2024-11-01'),
      amount: 2499,
      status: 'paid',
      description: 'Professional Plan - November 2024',
      paymentMethod: 'EFT',
      dueDate: new Date('2024-11-05'),
      paidDate: new Date('2024-11-03')
    }
  ];

  paymentMethods = [
    {
      id: 'pm_001',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
      holderName: 'ThutoNet School',
      bank: undefined,
      accountType: undefined
    }
  ];

  selectedPlan = 'professional';
  selectedBillingCycle = 'monthly';
  isChangingPlan = false;
  isAddingPaymentMethod = false;
  showInvoiceModal = false;
  selectedInvoice: any = null;

  paymentMethodForm: any = {
    type: 'card',
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    bankName: '',
    accountType: 'cheque',
    accountNumber: '',
    branchCode: ''
  };

  selectPlan(planId: string): void {
    this.selectedPlan = planId;
  }

  selectBillingCycle(cycle: string): void {
    this.selectedBillingCycle = cycle;
  }

  calculatePlanPrice(plan: any): number {
    return this.selectedBillingCycle === 'monthly' ? plan.price : plan.annualPrice;
  }

  changePlan(): void {
    const selectedPlanObj = this.availablePlans.find(p => p.id === this.selectedPlan);
    if (!selectedPlanObj) return;

    this.isChangingPlan = true;
    setTimeout(() => {
      this.currentSubscription.plan = selectedPlanObj.name;
      this.currentSubscription.price = this.calculatePlanPrice(selectedPlanObj);
      this.isChangingPlan = false;
      this.showSuccessMessage(`Successfully upgraded to ${selectedPlanObj.name} plan!`);
    }, 2000);
  }

  viewInvoice(invoice: any): void {
    this.selectedInvoice = invoice;
    this.showInvoiceModal = true;
  }

  closeInvoiceModal(): void {
    this.showInvoiceModal = false;
    this.selectedInvoice = null;
  }

  downloadInvoice(invoice: any): void {
    this.showSuccessMessage(`Downloading invoice ${invoice.id}...`);
  }

  openAddPaymentMethod(): void {
    this.isAddingPaymentMethod = true;
  }

  closeAddPaymentMethod(): void {
    this.isAddingPaymentMethod = false;
  }

  savePaymentMethod(): void {
    this.showSuccessMessage('Payment method added successfully');
    this.closeAddPaymentMethod();
  }

  getInvoiceStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'paid': 'status-success',
      'pending': 'status-warning',
      'overdue': 'status-error'
    };
    return colors[status] || 'status-default';
  }

  formatCurrency(amount: number): string {
    return `R${amount.toLocaleString()}`;
  }

  getSubscriptionStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'active': 'status-success',
      'inactive': 'status-warning',
      'cancelled': 'status-error',
      'expired': 'status-error'
    };
    return colors[status] || 'status-default';
  }

  // Additional billing properties
  billingStats = {
    totalSpent: 29988,
    averageMonthly: 2499,
    nextBilling: 2499,
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    outstandingAmount: 0
  };

  getDaysUntilRenewal(): number {
    const now = new Date();
    const renewal = new Date(this.currentSubscription.renewalDate);
    const diffTime = renewal.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  toggleAutoRenew(): void {
    this.currentSubscription.autoRenew = !this.currentSubscription.autoRenew;
    const status = this.currentSubscription.autoRenew ? 'enabled' : 'disabled';
    this.showSuccessMessage(`Auto-renewal ${status}`);
  }

  cancelSubscription(): void {
    this.showErrorMessage('Subscription cancellation feature not implemented yet');
  }

  calculateMonthlySavings(plan: any): number {
    const monthlyTotal = plan.price * 12;
    return monthlyTotal - plan.annualPrice;
  }

  getInvoiceStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      'paid': '✅',
      'pending': '⏳',
      'overdue': '⚠️'
    };
    return icons[status] || '📄';
  }

  payInvoice(invoice: any): void {
    this.showSuccessMessage(`Payment for ${invoice.id} initiated`);
  }

  setDefaultPaymentMethod(method: any): void {
    this.paymentMethods.forEach(m => m.isDefault = false);
    method.isDefault = true;
    this.showSuccessMessage('Default payment method updated');
  }

  removePaymentMethod(method: any): void {
    const index = this.paymentMethods.findIndex(m => m.id === method.id);
    if (index > -1) {
      this.paymentMethods.splice(index, 1);
      this.showSuccessMessage('Payment method removed');
    }
  }
}