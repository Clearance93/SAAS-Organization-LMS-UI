  import { Component, OnInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleNavigationService } from '../../../services/role-navigation.service';
import { TeacherDashboardPayload } from '../../../interfaces/schools/teachers/teacher-dashboard-payload';
import { MatDialog } from '@angular/material/dialog';
import { AddGradeModalComponent } from '../../modals/add-grade-modal/add-grade-modal.component';
import { SettingsService } from '../../../services/settings/settings.service';
import { TeachingClassService } from '../../../services/teaching-class.service';
import { TeacherDashboardService } from '../../../services/schoolDashboards/teacher-dashboard.service';
import { Streams } from '../../../interfaces/settings/streams';
import { TeachingClass, CreateTeachingClassRequest } from '../../../interfaces/teaching-class.interface';
import { TeacherStream } from '../../../interfaces/teacher-stream.interface';
import { AuthService } from '../../../services/authServices/auth.service';
import { LibraryServicesService } from '../../../services/library/library-services.service';
import { LibraryModel } from '../../../features/organization/models/library/library-model';
import { SafePipe } from '../../../pipes/safe.pipe';

declare var Swal: any;

@Component({
  selector: 'app-teacher-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SafePipe],
  templateUrl: './teacher-settings.component.html',
  styleUrl: './teacher-settings.component.css'
})
export class TeacherSettingsComponent implements OnInit {
  
  activeTab = 'personal';
  profileForm: FormGroup;
  classForm: FormGroup;
  notificationForm: FormGroup;
  gradeTemplateForm: FormGroup;
  bookForm: FormGroup;
  passwordForm: FormGroup;
  
  isProfileModalOpen = false;
  // Modal states
  isClassModalOpen = false;
  isGradeTemplateModalOpen = false;
  isBookModalOpen = false;
  isEditClassModalOpen = false;
  selectedClass: TeachingClass | null = null;

  // Teacher data from login payload
  teacherData: TeacherDashboardPayload | null = null;
  teacherProfilePicture: string | null = null;
  teacherJoinedDate: string | null = null;
  currentTeacherData: any = null; // Store full teacher data from API

  teacherClasses = [
    { id: '1', name: 'Grade 10A Math', students: 28, room: 'Room 201', subject: 'Mathematics' },
    { id: '2', name: 'Grade 10B Math', students: 25, room: 'Room 202', subject: 'Mathematics' },
    { id: '3', name: 'Grade 11A Math', students: 22, room: 'Room 203', subject: 'Mathematics' }
  ];

  gradeTemplates = [
    { id: '1', name: 'Quiz Template', maxPoints: 20, passingGrade: 60 },
    { id: '2', name: 'Test Template', maxPoints: 100, passingGrade: 50 },
    { id: '3', name: 'Assignment Template', maxPoints: 50, passingGrade: 60 }
  ];

  schedulePreferences = {
    preferredStartTime: '08:00',
    preferredEndTime: '15:00',
    maxConsecutiveClasses: 3
  };

  gradingPreferences = {
    allowLateSubmissions: true,
    showGradesToStudents: false,
    notifyParentsOfGrades: true
  };

  communicationHours = {
    startTime: '08:00',
    endTime: '16:00'
  };

  weekDays = [
    { name: 'Mon', selected: true },
    { name: 'Tue', selected: true },
    { name: 'Wed', selected: true },
    { name: 'Thu', selected: true },
    { name: 'Fri', selected: true },
    { name: 'Sat', selected: false },
    { name: 'Sun', selected: false }
  ];

  privacySettings = {
    showEmailToStudents: false,
    shareGradesWithParents: true,
    showAttendanceToParents: true
  };

  // Teacher's grades and streams
  teacherGradesStreams: Streams[] = [];
  teacherStreams: TeacherStream[] = [];
  isLoadingGrades = false;
  organizationId: string = '';
  teacherId: string = '';
  teachingClasses: TeachingClass[] = [];
  isLoadingClasses = false;
  
  // Library books
  libraryBooks: LibraryModel[] = [];
  isLoadingBooks = false;
  isBookViewerOpen = false;
  selectedBookPdf: string | null = null;
  selectedBookTitle: string = '';
  selectedGenre: string = 'All';
  isFullscreen = false;
  selectedBookImage: string | null = null;
  selectedPdfFile: string | null = null;
  currentPage = 1;
  booksPerPage = 6;
  searchQuery = '';

  // Password visibility toggles
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  isChangingPassword = false;
  lastPasswordChange: Date = new Date();
  lastLogin: Date = new Date();
  books = [
    { id: '1', title: 'Advanced Mathematics', author: 'John Smith', isbn: '978-0123456789', category: 'Mathematics', status: 'Available', copies: 5 },
    { id: '2', title: 'Calculus Fundamentals', author: 'Jane Doe', isbn: '978-0987654321', category: 'Mathematics', status: 'Available', copies: 3 },
    { id: '3', title: 'Algebra Basics', author: 'Bob Johnson', isbn: '978-0456789123', category: 'Mathematics', status: 'Borrowed', copies: 2 }
  ];

  bookCategories = ['Mathematics', 'Science', 'Literature', 'History', 'Geography', 'Art', 'Music', 'Physical Education'];

  notificationSettings = {
    emailNotifications: true,
    smsNotifications: false,
    parentMessages: true,
    weeklyReports: true
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private roleNav: RoleNavigationService,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private teachingClassService: TeachingClassService,
    private teacherDashboardService: TeacherDashboardService,
    private authService: AuthService,
    private libraryService: LibraryServicesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      subject: ['', Validators.required],
      qualification: ['', Validators.required],
      department: [''],
      phoneNumber: [0, Validators.required]
    });

    this.classForm = this.fb.group({
      gradeStreamId: ['', Validators.required],
      subject: ['', Validators.required],
      classRoomNumber: ['', Validators.required],
      totalStudents: [0, [Validators.required, Validators.min(0)]]
    });

    this.notificationForm = this.fb.group({
      emailNotifications: [true],
      smsNotifications: [false],
      parentMessages: [true],
      weeklyReports: [true]
    });

    this.gradeTemplateForm = this.fb.group({
      name: ['', Validators.required],
      maxPoints: [100, [Validators.required, Validators.min(1)]],
      passingGrade: [60, [Validators.required, Validators.min(0), Validators.max(100)]]
    });

    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: [''],
      category: [''],
      copies: [1],
      description: ['', Validators.required],
      publisher: [''],
      publishYear: [''],
      genre: ['', Validators.required],
      year: ['', Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadTeacherData();
    this.loadOrganizationId();
    this.loadTeacherId();
    this.loadTeacherProfileFromAPI();
    this.loadTeacherGrades();
    this.loadTeachingClasses();
    this.loadLibraryBooks();
  }

  // Load teacher profile from API without caching
  private loadTeacherProfileFromAPI(): void {
    const profile = this.authService.getUserProfile();
    const teacherEmail = profile?.email || localStorage.getItem('userEmail');
    
    console.log('Loading teacher profile for email:', teacherEmail);
    
    if (!teacherEmail) {
      console.warn('No teacher email available');
      return;
    }

    // Always load from API - no caching
    this.teacherDashboardService.getTeacherByEmail(teacherEmail).subscribe({
      next: (teacher: any) => {
        console.log('Teacher profile loaded from API:', teacher);
        this.applyTeacherProfile(teacher);
      },
      error: (err) => {
        console.error('Failed to load teacher profile from API:', err);
      }
    });
  }

  // Apply teacher profile data
  private applyTeacherProfile(teacher: any): void {
    this.currentTeacherData = teacher;
    this.teacherProfilePicture = teacher.teacherProfilePicture;
    this.teacherJoinedDate = teacher.createdAt;
    
    this.profileForm.patchValue({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.teacherEmail || this.authService.getUserProfile()?.email || '',
      phone: teacher.phoneNumber?.toString() || '',
      phoneNumber: teacher.phoneNumber || 0,
      subject: this.teacherData?.subject || 'Not specified',
      qualification: teacher.qualification || 'Not specified',
      department: teacher.department || 'Not specified'
    });
    
    if (this.teacherData) {
      this.teacherData.teacherName = `${teacher.firstName} ${teacher.lastName}`;
      this.teacherData.teacherProfilePicture = teacher.teacherProfilePicture;
    }
  }

  private loadTeacherData(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    // Try to load from localStorage
    const cached = localStorage.getItem('teacherDashboard');
    if (cached) {
      try {
        this.teacherData = JSON.parse(cached);
        this.populateProfileForm();
      } catch (error) {
        console.error('Error parsing teacher dashboard data:', error);
      }
    }
  }

  private populateProfileForm(): void {
    if (!this.teacherData || !isPlatformBrowser(this.platformId)) return;

    // Split teacher name into first and last name
    const nameParts = this.teacherData.teacherName.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Get email from localStorage if available
    const email = localStorage.getItem('userEmail') || '';
    const phone = localStorage.getItem('userPhone') || '';

    // Set profile picture
    this.teacherProfilePicture = this.teacherData.teacherProfilePicture;

    // Update form with teacher data
    this.profileForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      subject: this.teacherData.subject || 'Not specified',
      qualification: localStorage.getItem('qualification') || 'Not specified'
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getTeacherInitials(): string {
    if (this.teacherData?.teacherName) {
      const nameParts = this.teacherData.teacherName.split(' ');
      const firstInitial = nameParts[0]?.[0] || 'T';
      const lastInitial = nameParts[1]?.[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    const firstName = this.profileForm.get('firstName')?.value || 'T';
    const lastName = this.profileForm.get('lastName')?.value || '';
    return (firstName[0] + (lastName[0] || '')).toUpperCase();
  }

  getTeacherFullName(): string {
    return this.teacherData?.teacherName || 
           `${this.profileForm.get('firstName')?.value || ''} ${this.profileForm.get('lastName')?.value || ''}`.trim();
  }

  getTeacherSubject(): string {
    return this.teacherData?.subject || this.profileForm.get('subject')?.value || 'Not specified';
  }

  hasProfilePicture(): boolean {
    if (!this.teacherProfilePicture) return false;
    if (this.teacherProfilePicture.startsWith('data:image')) return true;
    if (this.teacherProfilePicture.startsWith('http')) return true;
    return this.teacherProfilePicture.length > 50;
  }

  getProfilePictureUrl(): string {
    if (!this.teacherProfilePicture) return '';
    if (this.teacherProfilePicture.startsWith('data:image')) return this.teacherProfilePicture;
    if (this.teacherProfilePicture.startsWith('http')) return this.teacherProfilePicture;
    return `data:image/jpeg;base64,${this.teacherProfilePicture}`;
  }

  // Profile Methods
  openProfileModal(): void {
    this.isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
  }

  updateProfile(): void {
    if (this.profileForm.valid && this.currentTeacherData) {
      const formValue = this.profileForm.value;
      
      const updatePayload = {
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        teacherProfilePicture: this.teacherProfilePicture || this.currentTeacherData.teacherProfilePicture,
        phoneNumber: parseInt(formValue.phone) || formValue.phoneNumber || 0,
        department: formValue.department || formValue.subject,
        qualification: formValue.qualification,
        updatedAt: new Date().toISOString()
      };

      console.log('Updating teacher profile with payload:', updatePayload);

      this.teacherDashboardService.updateTeacherProfile(this.currentTeacherData.teacherId, updatePayload).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          
          // Update local data
          if (this.teacherData) {
            this.teacherData.teacherName = `${formValue.firstName} ${formValue.lastName}`;
            this.teacherData.subject = formValue.subject;
            localStorage.setItem('teacherDashboard', JSON.stringify(this.teacherData));
          }
          
          localStorage.setItem('userEmail', formValue.email);
          localStorage.setItem('userPhone', formValue.phone);
          localStorage.setItem('qualification', formValue.qualification);
          
          // Clear profile cache and reload
          localStorage.removeItem('teacherProfile');
          
          Swal.fire('Success!', 'Profile updated successfully!', 'success');
          this.closeProfileModal();
          
          // Reload profile data from API
          this.loadTeacherProfileFromAPI();
        },
        error: (err) => {
          console.error('Failed to update profile:', err);
          Swal.fire('Error!', 'Failed to update profile. Please try again.', 'error');
        }
      });
    } else {
      Swal.fire('Validation Error', 'Please fill all required fields correctly.', 'warning');
    }
  }

  // Class Methods
  openClassModal(): void {
    this.isClassModalOpen = true;
    // Ensure grade streams are loaded when modal opens
    if (this.teacherStreams.length === 0) {
      this.loadTeacherGrades();
    }
  }

  closeClassModal(): void {
    this.isClassModalOpen = false;
    this.classForm.reset();
  }

  addClass(): void {
    if (this.classForm.valid && this.organizationId && this.teacherId) {
      this.isLoadingClasses = true;
      
      const createRequest: CreateTeachingClassRequest = {
        gradeStreamId: this.classForm.value.gradeStreamId,
        subject: this.classForm.value.subject,
        classRoomNumber: this.classForm.value.classRoomNumber,
        totalStudents: this.classForm.value.totalStudents,
        organizationId: this.organizationId,
        teacherId: this.teacherId
      };

      this.teachingClassService.createTeachingClass(createRequest).subscribe({
        next: (newClass: TeachingClass) => {
          this.isLoadingClasses = false;
          Swal.fire('Success!', 'Teaching class created successfully!', 'success');
          this.closeClassModal();
          // Reload classes from API
          this.loadTeachingClasses();
        },
        error: (error) => {
          console.error('Error creating teaching class:', error);
          this.isLoadingClasses = false;
          Swal.fire('Error!', 'Failed to create teaching class. Please try again.', 'error');
        }
      });
    } else {
      Swal.fire('Error!', 'Please fill all required fields and ensure you are logged in properly.', 'error');
    }
  }

  removeClass(teachingClassId: string): void {
    Swal.fire({
      title: 'Remove Teaching Class?',
      text: 'This will permanently remove the teaching class.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.teachingClassService.deleteTeachingClass(teachingClassId).subscribe({
          next: () => {
            Swal.fire('Removed!', 'Teaching class has been removed.', 'success');
            // Reload classes from API
            this.loadTeachingClasses();
          },
          error: (error) => {
            console.error('Error deleting teaching class:', error);
            Swal.fire('Error!', 'Failed to remove teaching class. Please try again.', 'error');
          }
        });
      }
    });
  }

  // Grade Template Methods
  openGradeTemplateModal(): void {
    this.isGradeTemplateModalOpen = true;
  }

  closeGradeTemplateModal(): void {
    this.isGradeTemplateModalOpen = false;
    this.gradeTemplateForm.reset();
  }

  addGradeTemplate(): void {
    if (this.gradeTemplateForm.valid) {
      const newTemplate = {
        id: Date.now().toString(),
        ...this.gradeTemplateForm.value
      };
      this.gradeTemplates.push(newTemplate);
      Swal.fire('Success!', 'Grade template added!', 'success');
      this.closeGradeTemplateModal();
    }
  }

  deleteGradeTemplate(templateId: string): void {
    this.gradeTemplates = this.gradeTemplates.filter(t => t.id !== templateId);
    Swal.fire('Deleted!', 'Template removed successfully!', 'success');
  }

  // Library Methods
  openBookModal(): void {
    this.isBookModalOpen = true;
    this.bookForm.reset({ copies: 1 });
    this.selectedBookImage = null;
    this.selectedPdfFile = null;
  }

  closeBookModal(): void {
    this.isBookModalOpen = false;
    this.bookForm.reset();
    this.selectedBookImage = null;
    this.selectedPdfFile = null;
  }

  addBook(): void {
    if (!this.bookForm.valid) {
      Swal.fire('Validation Error', 'Please fill all required fields', 'warning');
      return;
    }

    if (!this.selectedPdfFile) {
      Swal.fire('Error', 'Please upload a PDF file for the book', 'error');
      return;
    }

    const bookData: any = {
      libraryId: '',
      title: this.bookForm.value.title,
      author: this.bookForm.value.author,
      genre: this.bookForm.value.genre,
      year: String(this.bookForm.value.year),
      description: this.bookForm.value.description,
      coverPage: this.selectedBookImage,
      book: this.selectedPdfFile,
      library: this.organizationId
    };

    this.libraryService.addBook(bookData).subscribe({
      next: (response) => {
        Swal.fire('Success!', 'Book added successfully!', 'success');
        this.closeBookModal();
        this.loadLibraryBooks();
      },
      error: (err) => {
        console.error('Failed to add book:', err);
        Swal.fire('Error', 'Failed to add book. Please try again.', 'error');
      }
    });
  }

  onBookImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedBookImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onBookPdfSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedPdfFile = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      Swal.fire('Error', 'Please select a valid PDF file', 'error');
    }
  }

  removeBookImage(): void {
    this.selectedBookImage = null;
  }

  removeBookPdf(): void {
    this.selectedPdfFile = null;
  }

  deleteBook(bookId: string): void {
    Swal.fire({
      title: 'Remove Book?',
      text: 'This will permanently remove the book from the library.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.books = this.books.filter(b => b.id !== bookId);
        Swal.fire('Removed!', 'Book has been removed from library.', 'success');
      }
    });
  }

  editBook(book: any): void {
    this.bookForm.patchValue(book);
    this.openBookModal();
  }

  toggleBookStatus(bookId: string): void {
    const book = this.books.find(b => b.id === bookId);
    if (book) {
      book.status = book.status === 'Available' ? 'Borrowed' : 'Available';
      Swal.fire('Updated!', `Book status changed to ${book.status}`, 'success');
    }
  }

  // Getter methods for template
  get availableBooksCount(): number {
    return this.books.filter(b => b.status === 'Available').length;
  }

  get borrowedBooksCount(): number {
    return this.books.filter(b => b.status === 'Borrowed').length;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  // Load organization ID from localStorage
  private loadOrganizationId(): void {
    this.organizationId = (typeof localStorage !== 'undefined' ? localStorage.getItem('organizationId') : null) || '';
  }

  // Load teacher ID from auth service or localStorage
  private loadTeacherId(): void {
    const profile = this.authService.getUserProfile();
    this.teacherId = profile?.roleUserId || profile?.userId || (typeof localStorage !== 'undefined' ? localStorage.getItem('roleUserId') : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('userId') : null) || '';
  }

  // Load teaching classes for this teacher without caching
  loadTeachingClasses(): void {
    if (!this.teacherId || !this.organizationId) {
      console.log('Teacher ID or Organization ID not available');
      return;
    }

    // Always load from API - no caching
    this.isLoadingClasses = true;
    this.teachingClassService.getTeachingClasses(this.organizationId, this.teacherId).subscribe({
      next: (classes: TeachingClass[]) => {
        this.teachingClasses = classes;
        this.isLoadingClasses = false;
        console.log('Teaching classes loaded from API');
      },
      error: (err) => {
        console.error('Failed to load teaching classes:', err);
        this.isLoadingClasses = false;
      }
    });
  }

  // Load teacher's grades and streams without caching
  loadTeacherGrades(): void {
    if (!this.teacherId) {
      console.log('Teacher ID not available');
      return;
    }

    // Always load from API - no caching
    this.isLoadingGrades = true;
    this.teacherDashboardService.getAllStreams(this.teacherId).subscribe({
      next: (streams: any) => {
        const streamData = Array.isArray(streams) ? streams : (streams?.data || []);
        this.teacherStreams = streamData;
        this.isLoadingGrades = false;
        console.log('Teacher streams loaded from API:', this.teacherStreams);
      },
      error: (err) => {
        console.error('Failed to load teacher streams:', err);
        this.isLoadingGrades = false;
      }
    });
  }

  // Fallback method using settings service
  private loadTeacherGradesFromSettings(): void {
    const teacherEmail = (typeof localStorage !== 'undefined' ? localStorage.getItem('userEmail') : null) || '';
    
    if (!this.organizationId || !teacherEmail) {
      return;
    }

    this.settingsService.getAllStreamsbyOrganizationId(this.organizationId).subscribe({
      next: (streams: Streams[]) => {
        this.teacherGradesStreams = streams.filter(stream => stream.teacherId === teacherEmail);
        console.log('Teacher grades/streams loaded from settings:', this.teacherGradesStreams);
      },
      error: (err) => {
        console.error('Failed to load teacher grades from settings:', err);
      }
    });
  }

  // Open Add Grade & Stream Modal
  openAddGradeModal(): void {
    const teacherEmail = localStorage.getItem('userEmail') || '';
    
    const dialogRef = this.dialog.open(AddGradeModalComponent, {
      width: '500px',
      data: {
        organizationId: this.organizationId,
        selectedTeacherEmail: teacherEmail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Reload from API to get fresh data
      this.loadTeacherGrades();
    });
  }

  // Remove a grade/stream
  removeGradeStream(streamId: string): void {
    Swal.fire({
      title: 'Remove Grade & Stream?',
      text: 'This will remove you from facilitating this grade and stream.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        // Note: You may need to implement a deleteStream method in the service
        // For now, just filter it out locally
        this.teacherGradesStreams = this.teacherGradesStreams.filter(s => s.streamId !== streamId);
        Swal.fire('Removed!', 'Grade & Stream has been removed.', 'success');
      }
    });
  }

  // Navigation
  backToDashboard(): void {
    this.router.navigate(['/teacher-dashboard']);
  }

  // Get stream name by streamId
  getStreamName(gradeStreamId: string): string {
    const stream = this.teacherStreams.find(s => s.streamId === gradeStreamId);
    return stream ? stream.streamName : 'Unknown Stream';
  }

  // View class statistics
  viewClassStats(teachingClass: TeachingClass): void {
    const statsHtml = `
      <div style="text-align: left;">
        <h4>📊 Class Statistics</h4>
        <div style="margin: 15px 0;">
          <p><strong>Subject:</strong> ${teachingClass.subject}</p>
          <p><strong>Classroom:</strong> ${teachingClass.classRoomNumber}</p>
          <p><strong>Total Students:</strong> ${teachingClass.totalStudents}</p>
          <p><strong>Grade Stream:</strong> ${this.getStreamName(teachingClass.gradeStreamId)}</p>
        </div>
        <div style="margin: 15px 0;">
          <h5>📈 Performance Metrics</h5>
          <p>• Average Attendance: 92%</p>
          <p>• Average Grade: 78%</p>
          <p>• Assignments Completed: 85%</p>
          <p>• Active Students: ${teachingClass.totalStudents}</p>
        </div>
      </div>
    `;
    
    Swal.fire({
      title: 'Class Statistics',
      html: statsHtml,
      width: 600,
      confirmButtonText: 'Close'
    });
  }

  // Edit teaching class
  editClass(teachingClass: TeachingClass): void {
    this.selectedClass = teachingClass;
    this.classForm.patchValue({
      gradeStreamId: teachingClass.gradeStreamId,
      subject: teachingClass.subject,
      classRoomNumber: teachingClass.classRoomNumber,
      totalStudents: teachingClass.totalStudents
    });
    this.isEditClassModalOpen = true;
  }

  // Close edit modal
  closeEditClassModal(): void {
    this.isEditClassModalOpen = false;
    this.selectedClass = null;
    this.classForm.reset();
  }

  // Update teaching class
  updateClass(): void {
    if (this.classForm.valid && this.selectedClass) {
      this.isLoadingClasses = true;
      
      const updateData = {
        gradeStreamId: this.classForm.value.gradeStreamId,
        subject: this.classForm.value.subject,
        classRoomNumber: this.classForm.value.classRoomNumber,
        totalStudents: this.classForm.value.totalStudents
      };

      this.teachingClassService.updateTeachingClass(this.selectedClass.teachingClassId, updateData).subscribe({
        next: () => {
          this.isLoadingClasses = false;
          Swal.fire('Success!', 'Teaching class updated successfully!', 'success');
          this.closeEditClassModal();
          // Reload classes from API
          this.loadTeachingClasses();
        },
        error: (error) => {
          console.error('Error updating teaching class:', error);
          this.isLoadingClasses = false;
          Swal.fire('Error!', 'Failed to update teaching class. Please try again.', 'error');
        }
      });
    }
  }

  // Show class menu options
  showClassMenu(teachingClass: TeachingClass): void {
    Swal.fire({
      title: 'Class Options',
      html: `
        <div style="text-align: left;">
          <p><strong>${teachingClass.subject}</strong></p>
          <p>${this.getStreamName(teachingClass.gradeStreamId)}</p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '✏️ Edit',
      denyButtonText: '🗑️ Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      denyButtonColor: '#ef4444'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.editClass(teachingClass);
      } else if (result.isDenied) {
        this.removeClass(teachingClass.teachingClassId);
      }
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
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('userRole');
        }
        this.router.navigate(['/login']);
      }
    });
  }

  // Export teacher data as JSON
  exportMyData(): void {
    const exportData = {
      profile: {
        name: this.getTeacherFullName(),
        email: this.profileForm.get('email')?.value,
        phone: this.profileForm.get('phone')?.value,
        subject: this.profileForm.get('subject')?.value,
        qualification: this.profileForm.get('qualification')?.value
      },
      teachingClasses: this.teachingClasses,
      gradeStreams: this.teacherStreams,
      schedulePreferences: this.schedulePreferences,
      gradingPreferences: this.gradingPreferences,
      notificationSettings: this.notificationSettings,
      privacySettings: this.privacySettings,
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `teacher-data-${this.teacherId}-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    Swal.fire('Success!', 'Your data has been exported successfully!', 'success');
  }

  // Backup current settings to localStorage
  backupSettings(): void {
    const backupData = {
      schedulePreferences: this.schedulePreferences,
      gradingPreferences: this.gradingPreferences,
      notificationSettings: this.notificationSettings,
      privacySettings: this.privacySettings,
      communicationHours: this.communicationHours,
      weekDays: this.weekDays,
      backupDate: new Date().toISOString()
    };

    localStorage.setItem('teacherSettingsBackup', JSON.stringify(backupData));
    
    Swal.fire({
      title: 'Backup Created!',
      text: 'Your settings have been backed up successfully. You can restore them anytime.',
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }

  // Reset all settings to defaults
  resetToDefaults(): void {
    Swal.fire({
      title: 'Reset to Defaults?',
      text: 'This will reset all your preferences to default values. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reset',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444'
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        // Reset to default values
        this.schedulePreferences = {
          preferredStartTime: '08:00',
          preferredEndTime: '15:00',
          maxConsecutiveClasses: 3
        };

        this.gradingPreferences = {
          allowLateSubmissions: true,
          showGradesToStudents: false,
          notifyParentsOfGrades: true
        };

        this.notificationSettings = {
          emailNotifications: true,
          smsNotifications: false,
          parentMessages: true,
          weeklyReports: true
        };

        this.privacySettings = {
          showEmailToStudents: false,
          shareGradesWithParents: true,
          showAttendanceToParents: true
        };

        this.communicationHours = {
          startTime: '08:00',
          endTime: '16:00'
        };

        this.weekDays = [
          { name: 'Mon', selected: true },
          { name: 'Tue', selected: true },
          { name: 'Wed', selected: true },
          { name: 'Thu', selected: true },
          { name: 'Fri', selected: true },
          { name: 'Sat', selected: false },
          { name: 'Sun', selected: false }
        ];

        // Clear backup from localStorage
        localStorage.removeItem('teacherSettingsBackup');

        Swal.fire('Reset Complete!', 'All settings have been reset to default values.', 'success');
      }
    });
  }

  // Password validator
  private passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  // Password strength methods
  getPasswordStrength(): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    if (strength <= 2) return 'weak';
    if (strength <= 3) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'weak') return 'Weak';
    if (strength === 'medium') return 'Medium';
    return 'Strong';
  }

  hasMinLength(): boolean {
    return (this.passwordForm.get('newPassword')?.value || '').length >= 8;
  }

  hasUpperCase(): boolean {
    return /[A-Z]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  hasLowerCase(): boolean {
    return /[a-z]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  hasSpecialChar(): boolean {
    return /[^a-zA-Z0-9]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  resetPasswordForm(): void {
    this.passwordForm.reset();
    this.showCurrentPassword = false;
    this.showNewPassword = false;
    this.showConfirmPassword = false;
  }

  // Load library books from API
  loadLibraryBooks(): void {
    this.isLoadingBooks = true;
    this.libraryService.getAllBooks().subscribe({
      next: (response: any) => {
        this.libraryBooks = response;
        this.isLoadingBooks = false;
        console.log('Library books loaded:', response);
      },
      error: (err: any) => {
        console.error('Failed to load library books:', err);
        this.isLoadingBooks = false;
        this.libraryBooks = [];
      }
    });
  }

  // View book details
  viewBook(book: LibraryModel): void {
    if (book.book) {
      this.selectedBookPdf = book.book;
      this.selectedBookTitle = book.title;
      this.isBookViewerOpen = true;
    } else {
      Swal.fire('Info', 'No book file available', 'info');
    }
  }

  closeBookViewer(): void {
    this.isBookViewerOpen = false;
    this.selectedBookPdf = null;
    this.selectedBookTitle = '';
    if (this.isFullscreen) {
      this.exitFullscreen();
    }
  }

  get uniqueGenres(): string[] {
    const genres = this.libraryBooks.map(book => book.genre).filter(genre => genre);
    return ['All', ...Array.from(new Set(genres))];
  }

  getGenreIcon(genre: string): string {
    const icons: { [key: string]: string } = {
      'All': '📚',
      'Fiction': '📖',
      'Non-Fiction': '📰',
      'Science': '🔬',
      'Mathematics': '🔢',
      'History': '📜',
      'Geography': '🌍',
      'Literature': '✍️',
      'Biography': '👤',
      'Fantasy': '🧙',
      'Mystery': '🔍',
      'Romance': '💕',
      'Thriller': '😱',
      'Horror': '👻',
      'Adventure': '🗺️',
      'Poetry': '🎭',
      'Drama': '🎬',
      'Comedy': '😄',
      'Self-Help': '💪',
      'Business': '💼',
      'Technology': '💻',
      'Art': '🎨',
      'Music': '🎵',
      'Sports': '⚽',
      'Cooking': '🍳',
      'Travel': '✈️',
      'Religion': '🕊️',
      'Philosophy': '🤔',
      'Psychology': '🧠',
      'Education': '🎓'
    };
    return icons[genre] || '📕';
  }

  get filteredBooks(): LibraryModel[] {
    let books = this.libraryBooks;
    
    if (this.selectedGenre !== 'All') {
      books = books.filter(book => book.genre === this.selectedGenre);
    }
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      books = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.genre.toLowerCase().includes(query)
      );
    }
    
    return books;
  }

  get paginatedBooks(): LibraryModel[] {
    const start = (this.currentPage - 1) * this.booksPerPage;
    const end = start + this.booksPerPage;
    return this.filteredBooks.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredBooks.length / this.booksPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  selectGenre(genre: string): void {
    this.selectedGenre = genre;
    this.currentPage = 1;
  }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  toggleFullscreen(): void {
    if (!this.isFullscreen) {
      const elem = document.querySelector('.book-viewer-modal') as any;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      this.isFullscreen = true;
    } else {
      this.exitFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
    this.isFullscreen = false;
  }



  changePassword(): void {
    if (!this.passwordForm.valid) {
      Swal.fire('Validation Error', 'Please fill all fields correctly', 'warning');
      return;
    }

    const profile = this.authService.getUserProfile();
    const email = profile?.email || localStorage.getItem('userEmail');
    
    console.log('Changing password for email:', email);
    
    if (!email) {
      Swal.fire('Error', 'Email not found. Please try logging in again.', 'error');
      return;
    }

    this.isChangingPassword = true;
    
    const payload = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      email: email
    };

    this.authService.changePassword(payload).subscribe({
      next: (response) => {
        console.log('Password change response:', response);
        this.isChangingPassword = false;
        this.lastPasswordChange = new Date();
        Swal.fire('Success!', 'Your password has been updated successfully!', 'success');
        this.resetPasswordForm();
      },
      error: (err) => {
        this.isChangingPassword = false;
        console.error('Password change failed:', err);
        console.error('Error status:', err.status);
        console.error('Error text:', err.error);
        
        let errorMessage = 'Failed to change password.';
        
        if (err.status === 500 && err.error) {
          const errorText = err.error.toString();
          if (errorText.includes('current password is incorrect')) {
            errorMessage = 'The current password you entered is incorrect. Please try again.';
          } else if (errorText.includes('AccountLockedException')) {
            errorMessage = 'Your account may be locked. Please contact support.';
          } else {
            errorMessage = 'Server error occurred. Please try again later.';
          }
        } else if (err.status === 400) {
          errorMessage = err.error || 'Invalid password. Please check your input.';
        } else if (err.error) {
          errorMessage = typeof err.error === 'string' ? err.error : 'Failed to change password.';
        }
        
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }
}