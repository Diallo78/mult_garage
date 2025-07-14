import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NotificationService, Notification as AppNotification } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let notification of notifications$ | async"
        class="max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out"
        [ngClass]="{
          'border-l-4 border-green-400': notification.type === 'success',
          'border-l-4 border-red-400': notification.type === 'error',
          'border-l-4 border-yellow-400': notification.type === 'warning',
          'border-l-4 border-blue-400': notification.type === 'info'
        }"
      >
        <div class="p-4">
          <div class="flex items-start">
            <div class="flex-shrink-0">
              <div
                class="h-6 w-6 rounded-full flex items-center justify-center"
                [ngClass]="{
                  'bg-green-100 text-green-600': notification.type === 'success',
                  'bg-red-100 text-red-600': notification.type === 'error',
                  'bg-yellow-100 text-yellow-600': notification.type === 'warning',
                  'bg-blue-100 text-blue-600': notification.type === 'info'
                }"
              >
                <span *ngIf="notification.type === 'success'">✓</span>
                <span *ngIf="notification.type === 'error'">✗</span>
                <span *ngIf="notification.type === 'warning'">⚠</span>
                <span *ngIf="notification.type === 'info'">i</span>
              </div>
            </div>
            <div class="ml-3 w-0 flex-1">
              <p class="text-sm font-medium text-gray-900">{{ notification.message }}</p>
            </div>
            <div class="ml-4 flex-shrink-0 flex">
              <button
                (click)="removeNotification(notification.id)"
                class="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span class="sr-only">Close</span>
                <span class="text-lg">×</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotificationComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void {}

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}