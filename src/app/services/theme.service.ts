import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly darkThemeSubject = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.darkThemeSubject.asObservable();

  constructor() {
    // Initialize from localStorage if available
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.darkThemeSubject.next(savedTheme === 'dark');
    }
  }

  toggleTheme(): void {
    const newValue = !this.darkThemeSubject.value;
    this.darkThemeSubject.next(newValue);
    localStorage.setItem('theme', newValue ? 'dark' : 'light');
    this.applyTheme(newValue);
  }

  setDarkTheme(isDark: boolean): void {
    this.darkThemeSubject.next(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    this.applyTheme(isDark);
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}