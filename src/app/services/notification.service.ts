import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  showSuccess(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      message,
      duration
    });
  }

  showError(message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      message,
      duration
    });
  }

  showWarning(message: string, duration: number = 4000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      message,
      duration
    });
  }

  showInfo(message: string, duration: number = 3000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      message,
      duration
    });
  }

  private addNotification(notification: Notification): void {
    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...notifications, notification]);

    if (notification.duration) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}