import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignmentSubmissionService } from '../../services/assignment-submission.service';

@Component({
  selector: 'app-submit-assignment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Submit Assignment</h2>
          <button class="close-btn" (click)="close()">×</button>
        </div>

        <div class="modal-body">
          <h3>{{assignment?.title}}</h3>
          <p>{{assignment?.description}}</p>

          <div class="form-group">
            <label>Your Answer:</label>
            <textarea 
              [(ngModel)]="submissionText" 
              placeholder="Type your answer here..."
              rows="8"></textarea>
          </div>

          <div class="form-group">
            <label>Attach Files:</label>
            <input 
              type="file" 
              multiple 
              (change)="onFileSelect($event)">
            <div class="file-list" *ngIf="selectedFiles.length > 0">
              <div *ngFor="let file of selectedFiles; let i = index" class="file-item">
                <span>📎 {{file.name}}</span>
                <button (click)="removeFile(i)">×</button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="close()">Cancel</button>
          <button 
            class="btn-submit" 
            (click)="submit()"
            [disabled]="isSubmitting">
            {{isSubmitting ? 'Submitting...' : 'Submit'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #eee; }
    .close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
    .modal-body { padding: 20px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: 600; }
    textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
    .file-item { display: flex; justify-content: space-between; padding: 8px; background: #f5f5f5; border-radius: 4px; margin: 8px 0; }
    .modal-footer { padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end; }
    button { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }
    .btn-cancel { background: #f5f5f5; }
    .btn-submit { background: #4CAF50; color: white; }
    .btn-submit:disabled { background: #ccc; }
  `]
})
export class SubmitAssignmentModalComponent {
  @Input() isOpen = false;
  @Input() assignment: any;
  @Input() studentId: string = '';
  @Output() closed = new EventEmitter();
  @Output() submitted = new EventEmitter();

  submissionText = '';
  selectedFiles: File[] = [];
  isSubmitting = false;

  constructor(private submissionService: AssignmentSubmissionService) {}

  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[];
    this.selectedFiles.push(...files);
  }

  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
  }

  submit() {
    this.isSubmitting = true;
    this.submissionService.submitAssignment(
      this.assignment.assignmentId,
      this.studentId,
      this.submissionText,
      this.selectedFiles
    ).subscribe({
      next: (result) => {
        this.submitted.emit(result);
        this.close();
      },
      error: () => {
        alert('Failed to submit');
        this.isSubmitting = false;
      }
    });
  }

  close() {
    this.submissionText = '';
    this.selectedFiles = [];
    this.isSubmitting = false;
    this.closed.emit();
  }
}
