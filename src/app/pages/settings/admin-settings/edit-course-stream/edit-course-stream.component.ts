import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { CourseStream } from '../../../../interfaces/settings/course-stream';
import { SettingsService } from '../../../../services/settings/settings.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-course-stream',
  imports: [CommonModule,
            ReactiveFormsModule,
            MatIconModule,
            MatProgressSpinnerModule,
            MatTooltipModule
  ],
  templateUrl: './edit-course-stream.component.html',
  styleUrl: './edit-course-stream.component.css'
})
export class EditCourseStreamComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  courseStreamForms!: FormGroup;
  courseStreamId: string = '';
  organizationId: string = '';

  isLoading: boolean = false;
  loadError: string = '';
  isSaving: boolean = false;

  originalData: CourseStream | null = null;

  constructor(
    private fb: FormBuilder,
    private service: SettingsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.courseStreamId = params['courseStreamId'] || '';
      this.organizationId = params['organizationId'] || '';

      console.log('Edit Course Stream - ID:', this.courseStreamId, 'Organization ID:', this.organizationId);

      if (this.courseStreamId){
        this.loadCourseStream();
      } else {
        this.loadError = 'Invalid Course Stream ID.';
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm() {
    this.courseStreamForms = this.fb.group({
      courseStreamName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(2000), Validators.minLength(10)]]
    });
  }

  loadCourseStream() {
    this.isLoading = true;
    this.loadError = '';

    this.service.getCourseStreamById(this.courseStreamId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: CourseStream) => {
        this.originalData = data;
        this.courseStreamForms.patchValue({
          courseStreamName: data.courseStreamName,
          description: data.description
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course stream:', error);
        this.loadError = 'Failed to load course stream data. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.courseStreamForms.invalid || !this.originalData) {
      this.markFormGroupTouched(this.courseStreamForms);
      return;
    }

    this.isSaving = true;

    const updatedData: Partial<CourseStream> = {
      courseStreamName: this.courseStreamForms.value.courseStreamName,
      description: this.courseStreamForms.value.description
    };

    this.service.updateCourseStream(this.courseStreamId, updatedData).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.isSaving = false;
        console.log('Course stream updated successfully.');
        this.navigateBack();
      },
      error: () => {
        console.error('Error updating course stream:');
        this.isSaving = false;
        this.loadError = 'Failed to save changes. Please try again later.';
        alert(this.loadError);
      }
    })
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      const confirmDiscard = confirm('You have unsaved changes. Discard changes and go back?');
      if (confirmDiscard) {
        this.navigateBack();
      }
      return;
    }

    this.navigateBack();
  }

  hasUnsavedChanges(): boolean {
    if (!this.originalData) {
      return false;
    }

    const currentValues = this.courseStreamForms.value;

    return (
      currentValues.courseStreamName !== this.originalData.courseStreamName ||
      currentValues.description !== this.originalData.description
    );
  }

  navigateBack() {
    this.router.navigate(['/admin-settings'], {
      queryParams: { organizationId: this.organizationId }
    });
  }

  markFormGroupTouched(formgroup: FormGroup): void {
    Object.keys(formgroup.controls).forEach(key => {
      const control = formgroup.get(key);

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }

  get courseStreamName() {
    return this.courseStreamForms.get('courseStreamName');
  }

  get description() {
    return this.courseStreamForms.get('description');
  }

  get isFormValid(): boolean {
    return this.courseStreamForms.valid;
  }

  get isFormDirty(): boolean {
    return this.hasUnsavedChanges();
  }
}