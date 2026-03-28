import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GlobalMediaOptimizationService {
  
  /**
   * Compress any image file to reduce base64 size by 70-80%
   */
  static async compressImageFile(file: File, maxWidth: number = 400, quality: number = 0.6): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate optimal dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // Draw compressed image
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        
        // Return only base64 data without prefix
        resolve(compressed.split(',')[1]);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Profile picture compression (300px, 60% quality) - ~75% size reduction
   */
  static async compressProfilePicture(file: File): Promise<string> {
    return this.compressImageFile(file, 300, 0.6);
  }

  /**
   * Thumbnail compression (200px, 50% quality) - ~85% size reduction
   */
  static async compressThumbnail(file: File): Promise<string> {
    return this.compressImageFile(file, 200, 0.5);
  }

  /**
   * Document/attachment compression for communication
   */
  static async compressAttachment(file: File): Promise<{data: string, type: string, name: string}> {
    if (file.type.startsWith('image/')) {
      const compressed = await this.compressImageFile(file, 600, 0.7);
      return {
        data: compressed,
        type: 'image/jpeg',
        name: file.name
      };
    }
    
    // For non-images, convert to binary
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return {
      data: base64,
      type: file.type,
      name: file.name
    };
  }
}
