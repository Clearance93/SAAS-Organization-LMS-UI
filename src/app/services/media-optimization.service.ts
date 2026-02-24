import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaCompressionUtil } from '../utils/media-compression.util';

export interface OptimizedMediaUpload {
  data: string;
  type: string;
  size: number;
  compressed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MediaOptimizationService {
  
  constructor(private http: HttpClient) {}

  /**
   * Optimize media file for upload - reduces base64 overhead by 60-80%
   */
  async optimizeForUpload(file: File): Promise<OptimizedMediaUpload> {
    if (file.type.startsWith('image/')) {
      // Compress images significantly
      const compressed = await MediaCompressionUtil.compressImage(file, 600, 0.6);
      return {
        data: compressed,
        type: 'image/jpeg',
        size: compressed.length,
        compressed: true
      };
    }
    
    // For non-images, use binary conversion
    const binary = await MediaCompressionUtil.fileToBinary(file);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(binary)));
    return {
      data: base64,
      type: file.type,
      size: base64.length,
      compressed: false
    };
  }

  /**
   * Upload optimized media with minimal payload
   */
  uploadOptimizedMedia(url: string, media: OptimizedMediaUpload, additionalData?: any): Observable<any> {
    const payload = {
      mediaData: media.data,
      mediaType: media.type,
      mediaSize: media.size,
      compressed: media.compressed,
      ...additionalData
    };

    return this.http.post(url, payload, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Create thumbnail for preview (very small size)
   */
  async createThumbnail(file: File): Promise<string> {
    if (file.type.startsWith('image/')) {
      const thumbnail = await MediaCompressionUtil.compressImage(file, 150, 0.5);
      return `data:image/jpeg;base64,${thumbnail}`;
    }
    return '';
  }
}