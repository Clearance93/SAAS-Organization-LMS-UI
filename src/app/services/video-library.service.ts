import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Video {
  videoId: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  grade: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  uploadDate: Date;
  views: number;
  isYouTube: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VideoLibraryService {
  private apiUrl = 'https://localhost:7270/api';

  constructor(private http: HttpClient) {}

  uploadVideo(formData: FormData): Observable<Video> {
    return this.http.post<Video>(`${this.apiUrl}/Videos/upload`, formData);
  }

  addYouTubeVideo(videoData: any): Observable<Video> {
    return this.http.post<Video>(`${this.apiUrl}/Videos/youtube`, videoData);
  }

  getTeacherVideos(teacherId: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/Videos/teacher/${teacherId}`);
  }

  getVideosBySubject(subject: string, grade: string): Observable<Video[]> {
    return this.http.get<Video[]>(`${this.apiUrl}/Videos/subject/${subject}/grade/${grade}`);
  }

  deleteVideo(videoId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Videos/${videoId}`);
  }

  extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}
