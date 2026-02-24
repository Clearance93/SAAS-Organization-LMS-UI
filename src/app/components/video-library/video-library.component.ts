import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoLibraryService, Video } from '../../services/video-library.service';
import { SafePipe } from '../../pipes/safe.pipe';

@Component({
  selector: 'app-video-library',
  standalone: true,
  imports: [CommonModule, FormsModule, SafePipe],
  template: `
    <div class="video-library">
      <div class="header">
        <h2>📹 Video Library</h2>
        <button class="upload-btn" (click)="showUploadModal = true">+ Upload Video</button>
      </div>

      <div class="video-grid">
        <div *ngFor="let video of videos" class="video-card">
          <div class="thumbnail" (click)="playVideo(video)">
            <img *ngIf="video.thumbnailUrl" [src]="video.thumbnailUrl">
            <div *ngIf="!video.thumbnailUrl" class="placeholder">🎥</div>
            <div class="duration">{{formatDuration(video.duration)}}</div>
          </div>
          <div class="video-info">
            <h3>{{video.title}}</h3>
            <p>{{video.description}}</p>
            <div class="meta">
              <span>{{video.subject}} - {{video.grade}}</span>
              <span>👁️ {{video.views}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Modal -->
      <div class="modal" *ngIf="showUploadModal" (click)="showUploadModal = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h3>Upload Video</h3>
          
          <div class="tabs">
            <button [class.active]="uploadType === 'file'" (click)="uploadType = 'file'">Upload File</button>
            <button [class.active]="uploadType === 'youtube'" (click)="uploadType = 'youtube'">YouTube Link</button>
          </div>

          <div *ngIf="uploadType === 'file'">
            <input type="file" accept="video/*" (change)="onVideoSelect($event)">
            <p *ngIf="selectedVideo">{{selectedVideo.name}}</p>
          </div>

          <div *ngIf="uploadType === 'youtube'">
            <input type="text" [(ngModel)]="youtubeUrl" placeholder="Paste YouTube URL">
          </div>

          <input type="text" [(ngModel)]="videoTitle" placeholder="Title">
          <textarea [(ngModel)]="videoDescription" placeholder="Description"></textarea>
          <input type="text" [(ngModel)]="videoSubject" placeholder="Subject">
          <input type="text" [(ngModel)]="videoGrade" placeholder="Grade">

          <div class="modal-actions">
            <button (click)="showUploadModal = false">Cancel</button>
            <button (click)="uploadVideo()" [disabled]="isUploading">
              {{isUploading ? 'Uploading...' : 'Upload'}}
            </button>
          </div>
        </div>
      </div>

      <!-- Video Player Modal -->
      <div class="modal" *ngIf="currentVideo" (click)="currentVideo = null">
        <div class="player-modal" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="currentVideo = null">×</button>
          <h3>{{currentVideo.title}}</h3>
          <div class="player-container">
            <iframe *ngIf="currentVideo.isYouTube" 
              [src]="getYouTubeEmbed(currentVideo.videoUrl) | safe: 'resourceUrl'"
              frameborder="0" allowfullscreen></iframe>
            <video *ngIf="!currentVideo.isYouTube" controls>
              <source [src]="currentVideo.videoUrl">
            </video>
          </div>
          <p>{{currentVideo.description}}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-library { padding: 20px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    .upload-btn { background: #2196F3; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
    .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .video-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; }
    .thumbnail { position: relative; padding-top: 56.25%; background: #000; }
    .thumbnail img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
    .placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 48px; }
    .duration { position: absolute; bottom: 8px; right: 8px; background: rgba(0,0,0,0.8); color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .video-info { padding: 15px; }
    .meta { display: flex; justify-content: space-between; color: #666; font-size: 14px; margin-top: 10px; }
    .modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal-content { background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 500px; }
    .player-modal { background: white; padding: 20px; border-radius: 12px; width: 90%; max-width: 900px; position: relative; }
    .player-container { position: relative; padding-top: 56.25%; margin: 20px 0; }
    .player-container iframe, .player-container video { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    .tabs { display: flex; gap: 10px; margin: 20px 0; }
    .tabs button { flex: 1; padding: 10px; border: 1px solid #ddd; background: white; cursor: pointer; }
    .tabs button.active { background: #2196F3; color: white; }
    input, textarea { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 6px; }
    .modal-actions { display: flex; gap: 10px; margin-top: 20px; }
    .modal-actions button { flex: 1; padding: 10px; border: none; border-radius: 6px; cursor: pointer; }
    .close-btn { position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 24px; cursor: pointer; }
  `]
})
export class VideoLibraryComponent implements OnInit {
  videos: Video[] = [];
  showUploadModal = false;
  uploadType: 'file' | 'youtube' = 'file';
  selectedVideo: File | null = null;
  youtubeUrl = '';
  videoTitle = '';
  videoDescription = '';
  videoSubject = '';
  videoGrade = '';
  isUploading = false;
  currentVideo: Video | null = null;
  teacherId = '';

  constructor(private videoService: VideoLibraryService) {}

  ngOnInit() {
    this.teacherId = localStorage.getItem('teacherId') || '';
    this.loadVideos();
  }

  loadVideos() {
    this.videoService.getTeacherVideos(this.teacherId).subscribe({
      next: (videos) => this.videos = videos,
      error: (err) => console.error(err)
    });
  }

  onVideoSelect(event: any) {
    this.selectedVideo = event.target.files[0];
  }

  uploadVideo() {
    this.isUploading = true;
    
    if (this.uploadType === 'file' && this.selectedVideo) {
      const formData = new FormData();
      formData.append('video', this.selectedVideo);
      formData.append('title', this.videoTitle);
      formData.append('description', this.videoDescription);
      formData.append('subject', this.videoSubject);
      formData.append('grade', this.videoGrade);
      formData.append('teacherId', this.teacherId);

      this.videoService.uploadVideo(formData).subscribe({
        next: () => {
          this.loadVideos();
          this.showUploadModal = false;
          this.resetForm();
        },
        error: () => this.isUploading = false
      });
    } else if (this.uploadType === 'youtube') {
      const videoId = this.videoService.extractYouTubeId(this.youtubeUrl);
      this.videoService.addYouTubeVideo({
        videoUrl: this.youtubeUrl,
        videoId: videoId,
        title: this.videoTitle,
        description: this.videoDescription,
        subject: this.videoSubject,
        grade: this.videoGrade,
        teacherId: this.teacherId,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      }).subscribe({
        next: () => {
          this.loadVideos();
          this.showUploadModal = false;
          this.resetForm();
        },
        error: () => this.isUploading = false
      });
    }
  }

  playVideo(video: Video) {
    this.currentVideo = video;
  }

  getYouTubeEmbed(url: string): string {
    const videoId = this.videoService.extractYouTubeId(url);
    return `https://www.youtube.com/embed/${videoId}`;
  }

  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  resetForm() {
    this.selectedVideo = null;
    this.youtubeUrl = '';
    this.videoTitle = '';
    this.videoDescription = '';
    this.videoSubject = '';
    this.videoGrade = '';
    this.isUploading = false;
  }
}
