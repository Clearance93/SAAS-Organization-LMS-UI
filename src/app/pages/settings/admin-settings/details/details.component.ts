import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { CourseStream } from '../../../../interfaces/settings/course-stream';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from '../../../../services/settings/settings.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class DetailsComponent implements OnInit, OnDestroy{
  private destroy$ = new Subject<void>();

  courseStream: CourseStream | null = null;
  loading: boolean = true;
  error: string | null = null;
  courseStreamId: string = '';

  constructor(
    private route: ActivatedRoute,
    private service: SettingsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(q => {
      this.courseStreamId = q['courseStreamId'] || q['id'] || this.courseStreamId;
      this.tryLoad();
    });

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(p => {
      this.courseStreamId = p['id'] || this.courseStreamId;
      this.tryLoad();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private tryLoad() {
    if (!this.courseStreamId) {
      this.error = 'No course streamId provided.';
      this.loading = false;
      return;
    }

    if (!this.courseStream || (this.courseStream && this.courseStream.courseStreamId !== this.courseStreamId)) {
      this.loadCourseStream();
    }
  }

  loadCourseStream() {
    this.loading = true;
    this.error = null;

    this.service.getCourseStreamById(this.courseStreamId).subscribe({
      next: (data: CourseStream) => {
        this.courseStream = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load course stream details.';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/admin-settings']);
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
        this.service.deleteCourseStream(courseStreamId).pipe(take(1)).subscribe({
          next: () => {
            console.log('Delete successful for id=', courseStreamId);
            try { 
              Swal.fire('Deleted!', 'Course stream has been deleted.', 'success'); 
            } catch (e) { }
          },
          error: (err) => {
            console.error('Error deleting course stream:', err);
            try { Swal.fire('Error', 'Failed to delete course stream. Please try again.', 'error'); } catch (e) { alert('Failed to delete course stream.'); }
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

  addSchoolSubject(): void {
    console.log('Navigating to add-school-subject with courseStreamId=', this.courseStreamId);
    this.router.navigate(['/add-school-subject'], {
      queryParams: { 
        courseStreamId: this.courseStreamId,
        organizationId: this.route.snapshot.queryParams['organizationId']
      }
    });
  }
}
