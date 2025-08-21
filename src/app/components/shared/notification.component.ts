import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import {
  NotificationService,
  Notification as AppNotification,
} from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div
    class="fixed top-4 right-2 sm:right-4 z-50 space-y-3 w-full max-w-xs sm:max-w-md"
  >
    <div
      *ngFor="let notification of notifications$ | async"
      class="bg-white shadow-lg rounded-xl pointer-events-auto ring-1 ring-gray-100 overflow-hidden transform transition-all duration-300 ease-in-out animate-slide-in mx-2 sm:mx-0 backdrop-blur-sm bg-opacity-90"
      [ngClass]="{
        'border-l-4 border-emerald-400': notification.type === 'success',
        'border-l-4 border-rose-400': notification.type === 'error',
        'border-l-4 border-amber-300': notification.type === 'warning',
        'border-l-4 border-sky-400': notification.type === 'info'
      }"
    >
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div class="flex-shrink-0">
            <div
              class="h-7 w-7 rounded-lg flex items-center justify-center text-white shadow-sm"
              [ngClass]="{
                'bg-emerald-400': notification.type === 'success',
                'bg-rose-400': notification.type === 'error',
                'bg-amber-300': notification.type === 'warning',
                'bg-sky-400': notification.type === 'info'
              }"
            >
              <span *ngIf="notification.type === 'success'" class="text-lg leading-none">✓</span>
              <span *ngIf="notification.type === 'error'" class="text-lg leading-none">✕</span>
              <span *ngIf="notification.type === 'warning'" class="text-lg leading-none">!</span>
              <span *ngIf="notification.type === 'info'" class="text-lg leading-none">i</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p
              class="text-sm font-medium text-gray-800 leading-snug break-words"
            >
              {{ notification.message }}
            </p>
          </div>
          <div class="flex-shrink-0">
            <button
              (click)="removeNotification(notification.id)"
              class="text-gray-400 hover:text-gray-600 transition-colors duration-150 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div *ngIf="notification" class="h-0.5 w-full bg-gray-100">
        <div class="h-full bg-gray-300 animate-progress" [style.animationDuration]="notification.duration + 'ms'"></div>
      </div>
    </div>
  </div>
`,
  styles: [
    `
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    .animate-slide-in {
      animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .animate-progress {
      animation: progress linear forwards;
    }

    .break-words {
      word-wrap: break-word;
      word-break: break-word;
    }
  `,
  ]
})
export class NotificationComponent implements OnInit {
  notifications$: Observable<AppNotification[]>;

  constructor(private readonly notificationService: NotificationService) {
    this.notifications$ = this.notificationService.notifications$;
  }

  ngOnInit(): void { }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}
