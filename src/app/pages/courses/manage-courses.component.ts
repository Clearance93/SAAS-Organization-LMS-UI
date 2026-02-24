import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { SettingsService } from '../../services/settings/settings.service';
import { CourseStream } from '../../interfaces/settings/course-stream';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-courses',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="manage-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Manage Courses</h1>
        <p>Organize and manage your course catalog</p>
      </header>

      <div class="loading" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading courses...</p>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <p>{{ errorMessage }}</p>
        <button class="retry-btn" (click)="loadCourses()">Retry</button>
      </div>

      <div class="courses-list" *ngIf="!isLoading && !errorMessage">
        <div class="course-item" *ngFor="let course of courseStreams; trackBy: trackByCourse">
          <div class="course-info">
            <h3>{{ course.courseStreamName }}</h3>
            <p>{{ course.description || 'No description available' }}</p>
            <div class="course-meta">
              <span class="course-status" [ngClass]="getStatusClass(true)">Active</span>
            </div>
          </div>
          <div class="course-actions">
            <button class="btn-edit" (click)="editCourse(course)">Edit</button>
            <button class="btn-view" (click)="viewCourse(course)">View</button>
            <button class="btn-delete" (click)="deleteCourse(course)">Delete</button>
          </div>
        </div>

        <div class="empty-state" *ngIf="courseStreams.length === 0">
          <div class="empty-icon">📚</div>
          <h3>No courses found</h3>
          <p>Start by creating your first course stream</p>
        </div>
      </div>

      <button class="btn-add-course" (click)="createCourse()">+ Add New Course</button>
    </div>
  `,
  styles: [`
    .manage-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .loading, .error-message { text-align: center; padding: 2rem; }
    .spinner { width: 40px; height: 40px; border: 4px solid #f3f4f6; border-top: 4px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .retry-btn { background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-top: 1rem; }
    .courses-list { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
    .course-item { background: white; padding: 1.5rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; }
    .course-info h3 { margin: 0 0 0.5rem 0; color: #1f2937; }
    .course-info p { margin: 0 0 0.5rem 0; color: #6b7280; }
    .course-meta { display: flex; gap: 1rem; align-items: center; }
    .course-status { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; }
    .course-status.active { background: #dcfce7; color: #166534; }
    .course-actions { display: flex; gap: 0.5rem; }
    .btn-edit, .btn-view, .btn-delete { padding: 0.5rem 1rem; border: none; border-radius: 0.25rem; cursor: pointer; font-size: 0.875rem; }
    .btn-edit { background: #3b82f6; color: white; }
    .btn-view { background: #6b7280; color: white; }
    .btn-delete { background: #ef4444; color: white; }
    .btn-add-course { background: #10b981; color: white; border: none; padding: 1rem 2rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; }
    .empty-state { text-align: center; padding: 3rem; color: #6b7280; }
    .empty-icon { font-size: 4rem; margin-bottom: 1rem; }
    .error-message { color: #ef4444; }
  `]
})
export class ManageCoursesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  courseStreams: CourseStream[] = [];
  organizationId: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.organizationId = params['organizationId'] || localStorage.getItem('organizationId') || '';
        if (this.organizationId) {
          this.loadCourses();
        } else {
          this.errorMessage = 'Organization ID not found. Please navigate from the dashboard.';
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourses(): void {
    if (!this.organizationId) {
      this.errorMessage = 'Organization ID is required to load courses.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.settingsService.getAllCoursesStreamsByOrganizationId(this.organizationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (courses) => {
          this.courseStreams = courses;
          this.isLoading = false;
          console.log('Courses loaded:', courses);
        },
        error: (error) => {
          console.error('Error loading courses:', error);
          this.errorMessage = 'Failed to load courses. Please try again.';
          this.isLoading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }

  createCourse(): void {
    this.router.navigate(['/add-course-stream'], {
      queryParams: { organizationId: this.organizationId }
    });
  }

  editCourse(course: CourseStream): void {
    const courseStreamId = course.courseStreamId || (course as any).id;
    if (courseStreamId) {
      this.router.navigate(['/edit-course-stream'], {
        queryParams: { 
          courseStreamId: courseStreamId,
          organizationId: this.organizationId 
        }
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'Course ID not found. Cannot edit this course.',
        icon: 'error'
      });
    }
  }

  viewCourse(course: CourseStream): void {
    const courseStreamId = course.courseStreamId || (course as any).id;
    if (courseStreamId) {
      this.router.navigate(['/details'], {
        queryParams: { 
          courseStreamId: courseStreamId,
          organizationId: this.organizationId 
        }
      });
    } else {
      Swal.fire({
        title: 'Course Details',
        html: `
          <div style="text-align: left;">
            <p><strong>Course:</strong> ${course.courseStreamName}</p>
            <p><strong>Description:</strong> ${course.description || 'No description'}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  deleteCourse(course: CourseStream): void {
    const courseStreamId = course.courseStreamId || (course as any).id;
    if (!courseStreamId) {
      Swal.fire({
        title: 'Error',
        text: 'Course ID not found. Cannot delete this course.',
        icon: 'error'
      });
      return;
    }

    Swal.fire({
      title: 'Delete Course',
      text: `Are you sure you want to delete "${course.courseStreamName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteCourseStream(courseStreamId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Course has been deleted successfully.', 'success');
              this.loadCourses(); // Reload the list
            },
            error: (error) => {
              console.error('Error deleting course:', error);
              Swal.fire('Error', 'Failed to delete course. Please try again.', 'error');
            }
          });
      }
    });
  }

  getStatusClass(isActive: boolean): string {
    return 'active';
  }

  trackByCourse(index: number, course: CourseStream): any {
    return course.courseStreamId || (course as any).id || index;
  }
}