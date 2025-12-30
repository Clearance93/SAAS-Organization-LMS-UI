import { Component, Inject, OnInit } from '@angular/core';
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

export interface AddGradeDialogData {
  organizationId: string;
}

@Component({
  selector: 'app-add-grade-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './add-grade-modal.component.html',
  styleUrl: './add-grade-modal.component.css'
})
export class AddGradeModalComponent implements OnInit{
  gradeForm!: FormGroup;
  isSubmitting = false;
  isLoadingTeachers = false;
  teachers: Teacher[] = [];
  organizationId: string;

  constructor(private fb: FormBuilder,
              private dialogRef: MatDialogRef<AddGradeModalComponent>,
              private settingsService: SettingsService,
              @Inject(MAT_DIALOG_DATA) public data: AddGradeDialogData
  ) {
    this.organizationId = data.organizationId;
  }
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadTeachers();
  }

  initializeForm(): void {
    this.gradeForm = this.fb.group({
      gradeName: ['', [Validators.required, Validators.minLength(1)]],
      streamName: ['', [Validators.required, Validators.minLength(1)]],
      teacherId: ['', Validators.required]
    });
  }

  loadTeachers(): void {
    if (this.organizationId) {
      this.isLoadingTeachers = true;
      this.settingsService.getTeachersByOrganization(this.organizationId).subscribe({
        next: (teachers: Teacher[]) => {
          this.teachers = teachers;
          this.isLoadingTeachers = false;
          console.log('Teachers loaded:', this.teachers); 
        },
        error: (err) => {
          console.error('Failed to load teachers:', err);
          this.isLoadingTeachers = false;
          
        }
      });
    } else {
      console.error('Organization ID could not be determined.');
     
    }
  } 

  onSubmit(): void {
    if (this.gradeForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const formValue = this.gradeForm.value;
      const now = new Date();
      const payload = {
        gradeName: formValue.gradeName,
        teacherEmail: formValue.teacherId, 
        streamName: formValue.streamName,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      };

      this.settingsService.addGradeWithStream(payload).subscribe({
        next: () => {
          console.log('Grade and stream added succesfully:');
          this.isSubmitting = false;
          this.dialogRef.close();
        },
        error: (error) => {
          console.error('Error adding grade and stream:', error);
          this.isSubmitting = false;
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
