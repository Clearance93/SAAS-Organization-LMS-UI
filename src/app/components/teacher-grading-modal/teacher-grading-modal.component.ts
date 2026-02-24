import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiGradingService, EssayGrading } from '../../services/ai-grading.service';
import { AssignmentSubmissionService } from '../../services/assignment-submission.service';

@Component({
  selector: 'app-teacher-grading-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" *ngIf="isOpen" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Grade Assignment</h2>
          <button class="close-btn" (click)="close()">×</button>
        </div>

        <div class="modal-body">
          <div class="student-info">
            <h3>{{submission?.studentName}}</h3>
            <p>{{submission?.assignmentTitle}}</p>
          </div>

          <div class="submission-content">
            <h4>Student Answer:</h4>
            <p>{{submission?.submissionText}}</p>
            <div *ngIf="submission?.attachments?.length">
              <strong>Attachments:</strong>
              <div *ngFor="let file of submission.attachments">📎 {{file}}</div>
            </div>
          </div>

          <button class="ai-btn" (click)="getAiSuggestion()" [disabled]="isLoadingAi">
            🤖 {{isLoadingAi ? 'AI Analyzing...' : 'Get AI Grading Suggestion'}}
          </button>

          <div *ngIf="aiSuggestion" class="ai-panel">
            <h4>AI Suggestion ({{aiSuggestion.confidence * 100}}% confidence)</h4>
            <div class="ai-scores">
              <div><strong>Score:</strong> {{aiSuggestion.score}}/{{maxScore}}</div>
              <div *ngIf="aiSuggestion.grammar"><strong>Grammar:</strong> {{aiSuggestion.grammar}}%</div>
              <div *ngIf="aiSuggestion.structure"><strong>Structure:</strong> {{aiSuggestion.structure}}%</div>
              <div *ngIf="aiSuggestion.content"><strong>Content:</strong> {{aiSuggestion.content}}%</div>
            </div>
            <p><strong>Feedback:</strong> {{aiSuggestion.feedback}}</p>
            <div *ngIf="aiSuggestion.strengths?.length">
              <strong>Strengths:</strong>
              <ul><li *ngFor="let s of aiSuggestion.strengths">{{s}}</li></ul>
            </div>
            <button class="apply-btn" (click)="applyAiSuggestion()">✅ Apply AI Suggestion</button>
          </div>

          <div class="grading-form">
            <div class="form-group">
              <label>Score (out of {{maxScore}}):</label>
              <input type="number" [(ngModel)]="grade" [max]="maxScore" min="0">
            </div>
            <div class="form-group">
              <label>Feedback:</label>
              <textarea [(ngModel)]="feedback" rows="6"></textarea>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" (click)="close()">Cancel</button>
          <button class="btn-submit" (click)="submitGrade()" [disabled]="isSubmitting">
            {{isSubmitting ? 'Saving...' : 'Submit Grade'}}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 90vh; overflow-y: auto; }
    .modal-header { display: flex; justify-content: space-between; padding: 20px; border-bottom: 1px solid #eee; }
    .modal-body { padding: 20px; }
    .submission-content { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .ai-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; margin: 15px 0; width: 100%; }
    .ai-panel { background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #667eea; }
    .ai-scores { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 10px 0; }
    .apply-btn { background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px; }
    .form-group { margin: 15px 0; }
    label { display: block; margin-bottom: 8px; font-weight: 600; }
    input, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    .modal-footer { padding: 20px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end; }
    button { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; }
    .btn-cancel { background: #f5f5f5; }
    .btn-submit { background: #2196F3; color: white; }
  `]
})
export class TeacherGradingModalComponent {
  @Input() isOpen = false;
  @Input() submission: any;
  @Input() maxScore = 100;
  @Output() closed = new EventEmitter();
  @Output() graded = new EventEmitter();

  grade = 0;
  feedback = '';
  aiSuggestion: any = null;
  isLoadingAi = false;
  isSubmitting = false;

  constructor(
    private aiGrading: AiGradingService,
    private submissionService: AssignmentSubmissionService
  ) {}

  async getAiSuggestion() {
    this.isLoadingAi = true;
    this.aiSuggestion = await this.aiGrading.gradeEssay(
      this.submission.assignmentTitle,
      this.submission.submissionText,
      this.maxScore
    );
    this.isLoadingAi = false;
  }

  applyAiSuggestion() {
    if (this.aiSuggestion) {
      this.grade = this.aiSuggestion.score;
      this.feedback = this.aiSuggestion.feedback;
    }
  }

  submitGrade() {
    this.isSubmitting = true;
    this.submissionService.gradeSubmission(
      this.submission.submissionId,
      this.grade,
      this.feedback
    ).subscribe({
      next: () => {
        this.graded.emit({ grade: this.grade, feedback: this.feedback });
        this.close();
      },
      error: () => {
        alert('Failed to submit grade');
        this.isSubmitting = false;
      }
    });
  }

  close() {
    this.grade = 0;
    this.feedback = '';
    this.aiSuggestion = null;
    this.isSubmitting = false;
    this.closed.emit();
  }
}
