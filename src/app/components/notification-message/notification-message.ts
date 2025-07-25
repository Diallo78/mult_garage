import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NotificationMessageService } from '../../services/notification-message.service';
import { NotificationModel } from '../../models/notification';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [CommonModule, FirestoreDatePipe],
  template: `
  <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  </div>

  <div *ngIf="!isLoading">
    <div class="max-w-3xl mx-auto p-4">
      <h2 class="text-2xl font-bold mb-4 text-primary-700">📬 Boîte de réception</h2>

      <div class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div class="divide-y divide-gray-200 max-h-[70vh] overflow-y-auto">
          <div *ngFor="let notif of notifications" class="p-4 hover:bg-gray-50 cursor-pointer">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-medium text-gray-900">
                {{ notif.title }}
              </h3>
              <span
                class="text-xs px-2 py-1 rounded-full"
                [ngClass]="notif.read ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-800 font-semibold'"
              >
                {{ notif.read ? 'Lu' : 'Non lu' }}
              </span>
            </div>
            <p class="text-sm text-gray-700 mt-2" (click)="markAsRead(notif)">{{ notif.message }}</p>
            <p class="text-xs text-gray-500 mt-1">
              {{ notif.createdAt | firestoreDate | date:'medium' }}  <i *ngIf="notif.quoteId"> - {{ notif.quoteId }}</i>
            </p>
          </div>
        </div>
      </div>

      <div *ngIf="notifications.length === 0" class="text-center text-gray-500 mt-6">
        Aucune notification pour le moment.
      </div>
    </div>
    </div>
  `
})
export class NotificationMessage implements OnInit {
  notifications: NotificationModel[] = [];
  isLoading = true;
  constructor(
    private notificationService: NotificationMessageService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true
    try {
       const user: User | null = await this.authService.getCurrentUser();
      if (!user) return;

      const garageId = user.garageId;
      const emailClient = user.role === 'Client' ? user.email : '';
      const role: 'Client' | 'Garage' = user.role === 'Client' ? 'Client' : 'Garage';
      this.notifications = await this.notificationService.getAllLatestNotifications(emailClient, garageId, role, 100);
    } catch (error) {

    }finally{ this.isLoading = false}
  }

  // async markAllAsRead(): Promise<void> {
  //   await this.notificationService.markAllAsRead(this.notifications);
  //   this.notifications.forEach(n => (n.read = true));
  // }

  async markAsRead(notification: NotificationModel): Promise<void> {
    if (!notification.read) {
      await this.notificationService.markAsRead(notification.id);
      notification.read = true; // Mise à jour locale
    }
  }
}
