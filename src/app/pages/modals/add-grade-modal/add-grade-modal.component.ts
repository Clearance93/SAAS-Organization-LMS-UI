import { Component, Inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../services/settings/settings.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Teacher } from './teacher.model';
import { Subject, takeUntil, finalize } from 'rxjs';

export interface AddGradeDialogData {
  organizationId: string;
  selectedTeacherEmail?: string;
}

@Component({
  selector: 'app-add-grade-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './add-grade-modal.component.html',
  styleUrl: './add-grade-modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddGradeModalComponent implements OnInit, OnDestroy {
  gradeForm!: FormGroup;
  isSubmitting = false;
  isLoadingTeachers = false;
  teachers: Teacher[] = [];
  organizationId: string;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<AddGradeModalComponent>,
              private settingsService: SettingsService,
              private cdr: ChangeDetectorRef,
              @Inject(MAT_DIALOG_DATA) public data: AddGradeDialogData
  ) {
    this.organizationId = data.organizationId;
  }
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadTeachers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initializeForm(): void {
    this.gradeForm = this.fb.group({
      gradeName: ['', [Validators.required, Validators.minLength(1)]],
      streamName: ['', [Validators.required, Validators.minLength(1)]],
      teacherId: ['', Validators.required]
    });
  }

  loadTeachers(): void {
    if (!this.organizationId) {
      console.error('Organization ID could not be determined.');
      return;
    }

    this.isLoadingTeachers = true;
    this.cdr.detectChanges();
    
    this.settingsService.getTeachersByOrganization(this.organizationId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingTeachers = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (teachers: Teacher[]) => {
          this.teachers = teachers;
          console.log('Teachers loaded:', this.teachers);
          
          // Pre-select teacher if provided
          if (this.data?.selectedTeacherEmail && this.gradeForm) {
            this.gradeForm.patchValue({ teacherId: this.data.selectedTeacherEmail });
          }
        },
        error: (err) => {
          console.error('Failed to load teachers:', err);
          this.teachers = [];
        }
      });
  } 

  onSubmit(): void {
    if (this.gradeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.cdr.detectChanges();
      const formValue = this.gradeForm.value;

      // The dropdown binds teacherEmail directly as the value
      const now = new Date();
      const payload = {
        gradeName: formValue.gradeName,
        teacherEmail: formValue.teacherId,
        streamName: formValue.streamName,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      console.log('Submitting grade & stream payload:', payload);

      this.settingsService.addGradeWithStream(payload).subscribe({
        next: (response) => {
          console.log('Grade and stream added successfully:', response);
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error adding grade and stream:', error);
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get f() {
    return this.gradeForm.controls;
  }
}
