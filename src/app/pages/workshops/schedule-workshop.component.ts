import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MediaCompressionUtil } from '../../utils/media-compression.util';

@Component({
  selector: 'app-schedule-workshop',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="workshop-container">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Schedule Workshop</h1>
        <p>Create and schedule interactive workshops</p>
      </header>

      <form [formGroup]="workshopForm" (ngSubmit)="onSubmit()" class="workshop-form">
        <div class="form-group">
          <label>Workshop Title</label>
          <input type="text" formControlName="title" placeholder="Enter workshop title">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea formControlName="description" placeholder="Workshop description"></textarea>
        </div>

        <div class="form-group">
          <label>Cover Image / Thumbnail</label>
          <div class="file-upload-area">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*" class="file-input">
            <div class="upload-placeholder" (click)="fileInput.click()" *ngIf="!imagePreview">
              <div class="upload-icon">📷</div>
              <p>Click to upload cover image</p>
              <small>PNG, JPG up to 5MB</small>
            </div>
            <div class="image-preview" *ngIf="imagePreview">
              <img [src]="imagePreview" alt="Cover preview">
              <button type="button" class="remove-btn" (click)="removeImage()">×</button>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" formControlName="date">
          </div>
          <div class="form-group">
            <label>Time</label>
            <input type="time" formControlName="time">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Duration (hours)</label>
            <input type="number" formControlName="duration" min="1" max="8">
          </div>
          <div class="form-group">
            <label>Max Participants</label>
            <input type="number" formControlName="maxParticipants" min="1">
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="goBack()">Cancel</button>
          <button type="submit" class="btn-primary" [disabled]="workshopForm.invalid">Schedule Workshop</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .workshop-container { padding: 2rem; max-width: 800px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .back-btn { background: #f3f4f6; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; margin-bottom: 1rem; }
    .workshop-form { background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .form-group { margin-bottom: 1.5rem; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; }
    input, textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
    textarea { height: 100px; resize: vertical; }
    .file-upload-area { position: relative; }
    .file-input { display: none; }
    .upload-placeholder { border: 2px dashed #d1d5db; border-radius: 0.5rem; padding: 2rem; text-align: center; cursor: pointer; transition: border-color 0.2s; }
    .upload-placeholder:hover { border-color: #84cc16; }
    .upload-icon { font-size: 2rem; margin-bottom: 0.5rem; }
    .image-preview { position: relative; display: inline-block; }
    .image-preview img { max-width: 200px; max-height: 150px; border-radius: 0.5rem; }
    .remove-btn { position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-size: 16px; line-height: 1; }
    .form-actions { display: flex; gap: 1rem; justify-content: flex-end; margin-top: 2rem; }
    .btn-primary { background: #84cc16; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-secondary { background: #6b7280; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; }
    .btn-primary:disabled { background: #9ca3af; cursor: not-allowed; }
  `]
})
export class ScheduleWorkshopComponent implements OnInit {
  workshopForm!: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.workshopForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      date: ['', Validators.required],
      time: ['', Validators.required],
      duration: [2, [Validators.required, Validators.min(1)]],
      maxParticipants: [50, [Validators.required, Validators.min(1)]]
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire('Error', 'File size must be less than 5MB', 'error');
        return;
      }
      
      this.selectedFile = file;
      // Create compressed preview
      try {
        const compressed = await MediaCompressionUtil.compressImage(file, 400, 0.6);
        this.imagePreview = `data:image/jpeg;base64,${compressed}`;
      } catch (error) {
        console.error('Image compression failed:', error);
        // Fallback to original
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.workshopForm.valid) {
      const workshop = this.workshopForm.value;
      Swal.fire({
        title: '🎯 Workshop Scheduled Successfully!',
        html: `<strong>Title:</strong> ${workshop.title}<br><strong>Date:</strong> ${workshop.date}<br><strong>Time:</strong> ${workshop.time}<br><strong>Duration:</strong> ${workshop.duration} hours<br><strong>Max Participants:</strong> ${workshop.maxParticipants}<br>${this.selectedFile ? '<br><strong>Cover Image:</strong> Uploaded' : ''}<br><br>Workshop has been added to the calendar and participants can now register.`,
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