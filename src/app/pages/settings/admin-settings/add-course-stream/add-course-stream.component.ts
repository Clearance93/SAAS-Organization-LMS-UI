import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsService } from '../../../../services/settings/settings.service';
import { CourseStream } from '../../../../interfaces/settings/course-stream';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-course-stream',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-course-stream.component.html',
  styleUrl: './add-course-stream.component.css'
})
export class AddCourseStreamComponent implements OnInit, OnDestroy{
  courseStreamForm!: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  private destroy$ = new Subject<void>();

  organizationId: string = '';


  constructor(
    private fb: FormBuilder,
    private service: SettingsService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.courseStreamForm = this.fb.group({
      courseStreamName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.organizationId = params['organizationId'];
        if (!this.organizationId) {
          console.error('Organization ID is missing from route parameters!');
        }
      });
  }

  onSubmit(): void {
    if (this.courseStreamForm.valid) {
      this.isSubmitting = true;
      this.submitError = null;
      this.submitSuccess = false;

      const courseStreamData: CourseStream = {
        ...this.courseStreamForm.value,
        organizationId: this.organizationId
      };

      this.service.addCourseStream(courseStreamData).subscribe({
        next: (response: CourseStream) => {
          console.log('Course stream added:', response);
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.courseStreamForm.reset();

          Swal.fire({
            title: '✅ Course Stream Added!',
            html: `<strong>Course Stream:</strong> ${courseStreamData.courseStreamName}<br><strong>Description:</strong> ${courseStreamData.description}<br><br>Course stream has been successfully added to your organization.`,
            icon: 'success',
            confirmButtonText: 'OK'
          }).then(() => {
            this.router.navigate(['/admin-settings'], {
              queryParams: { organizationId: this.organizationId }
            });
          });
        },
        error: (error) => {
          console.error('Error adding course stream:', error);
          this.submitError = error.message || 'Failed to add course stream. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      Object.keys(this.courseStreamForm.controls).forEach(key => {
        this.courseStreamForm.controls[key].markAsTouched();
      });
      }
    }

    isFieldInvalid(fieldName: string): boolean {
      const field = this.courseStreamForm.get(fieldName);

      return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getErrorMessage(fieldName: string): string {
      const field = this.courseStreamForm.get(fieldName);

      if (field && field.invalid && (field.dirty || field.touched)) {
        if(field.hasError('required')) {
          return  `${this.getFieldLabel(fieldName)} is required`;
        }
        if(field.hasError('minlength')) {
          const minLength = field.getError('minlength').requiredLength;
          return `Minimum length for ${this.getFieldLabel(fieldName)} is ${minLength} characters`;
        }
      }
      return '';
    }

    private getFieldLabel(fieldName: string): string {
      const label: { 
        [key: string]: string
      } = {
        courseStreamName: 'Course Stream Name',
        description: 'Description'
      }
      return label[fieldName] || fieldName;
    }

    onReset(): void {
      this.courseStreamForm.reset();
      this.submitError = null;
      this.submitSuccess = false;
    }

    ngOnDestroy(): void {
      this.destroy$.next();
      this.destroy$.complete();
    }
    
}
