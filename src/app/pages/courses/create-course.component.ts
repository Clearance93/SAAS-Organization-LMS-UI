import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-course',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="course-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Create Course</h1>
        <p>Design and create new courses for your curriculum</p>
      </header>

      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()" class="course-form">
        <div class="form-group">
          <label>Course Stream</label>
          <select formControlName="courseStreamId" class="form-input">
            <option value="">Select Course Stream</option>
            <option value="32591B1D-858A-41BE-86BE-013FA5B3EFD3">Mathematics</option>
            <!-- Add more course streams dynamically -->
          </select>
        </div>

        <div class="form-group">
          <label>Course Name</label>
          <input type="text" formControlName="name" placeholder="e.g., Algebra I, Biology 101">
        </div>

        <div class="form-group">
          <label>Course Code</label>
          <input type="text" formControlName="code" placeholder="e.g., MATH101">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea formControlName="description" placeholder="Course description"></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Duration (weeks)</label>
            <input type="number" formControlName="duration" min="1">
          </div>
          <div class="form-group">
            <label>Credits</label>
            <input type="number" formControlName="credits" min="1">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="courseForm.invalid">Create Course</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .course-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .course-form { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
    textarea { height: 100px; resize: vertical; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
    .btn-primary { background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-secondary { background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class CreateCourseComponent implements OnInit {
  courseForm!: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.courseForm = this.fb.group({
      courseStreamId: ['', Validators.required],
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      duration: [12, [Validators.required, Validators.min(1)]],
      credits: [3, [Validators.required, Validators.min(1)]]
    });
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      const course = this.courseForm.value;
      Swal.fire({
        title: '✅ Course Created Successfully!',
        html: `<strong>Name:</strong> ${course.name}<br><strong>Code:</strong> ${course.code}<br><strong>Duration:</strong> ${course.duration} weeks<br><strong>Credits:</strong> ${course.credits}<br><br>Course has been added to the curriculum.`,
        icon: 'success',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/school-admin-dashboard']);
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/school-admin-dashboard']);
  }
}