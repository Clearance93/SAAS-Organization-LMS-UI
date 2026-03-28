import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeColorSubject = new BehaviorSubject<string>('#3B82F6');
  public themeColor$ = this.themeColorSubject.asObservable();

  constructor() {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('themeColor');
      if (savedTheme) {
        this.setTheme(savedTheme);
      }
    }
  }

  setTheme(color: string): void {
    this.themeColorSubject.next(color);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('themeColor', color);
    }
    this.applyThemeToDOM(color);
  }

  private applyThemeToDOM(color: string): void {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    
    const rgb = this.hexToRgb(color);
    
    if (rgb) {
      root.style.setProperty('--theme-primary', color);
      root.style.setProperty('--theme-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
      
      root.style.setProperty('--theme-primary-light', this.lightenColor(color, 40));
      root.style.setProperty('--theme-primary-lighter', this.lightenColor(color, 60));
      root.style.setProperty('--theme-primary-dark', this.darkenColor(color, 20));
      root.style.setProperty('--theme-primary-darker', this.darkenColor(color, 40));
      
      root.style.setProperty('--theme-primary-10', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
      root.style.setProperty('--theme-primary-20', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`);
      root.style.setProperty('--theme-primary-50', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`);
    }
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  private lightenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * (percent / 100)));
    const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * (percent / 100)));
    const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * (percent / 100)));

    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  private darkenColor(hex: string, percent: number): string {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, Math.floor(rgb.r * (1 - percent / 100)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - percent / 100)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - percent / 100)));

    return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
  }

  private componentToHex(c: number): string {
    const hex = c.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }

  getCurrentTheme(): string {
    return this.themeColorSubject.value;
  }
}
