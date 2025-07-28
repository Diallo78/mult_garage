import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { NotificationMessageService } from '../../services/notification-message.service';
import { NotificationModel } from '../../models/notification';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  template: `
    <nav class="bg-white shadow-lg border-b border-gray-200">
      <div class="w-full px-0 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <div class="text-2xl font-bold text-primary-600">🚗 <span class="ml-1">GarageManager</span></div>
            </div>
          </div>

          <div class="flex items-center space-x-4">

            <!-- Icône de notification avec badge -->
            <div class="relative">
              <button
                class="relative p-2 text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full"
                (click)="toggleNotifications()"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 9v5.159c0 .538-.214 1.055-.595 1.436L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>

                <!-- Badge -->
                <span *ngIf="unreadCount > 0"
                  class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Dropdown de notifications -->
              <div
                *ngIf="showNotifications"
                class="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 animate-slide-in-right border border-gray-200"
              >
                <div class="px-4 py-2 border-b font-semibold text-gray-800 flex justify-between items-center">
                  Notifications
                  <button class="text-xs text-blue-500 hover:underline" (click)="markAllAsRead()">Marquer tous lu</button>
                </div>

                <div *ngFor="let notif of notifications" class="px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b">
                  <div [ngClass]="{'font-semibold text-primary-600': !notif.read}">
                    {{ notif.title }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1 cursor-pointer" (click)="markAsRead(notif)">
                    {{ notif.message }}
                  </div>

                  <p class="text-xs text-gray-500 mt-1">
                    {{ notif.createdAt | firestoreDate | date:'medium' }}  <i *ngIf="notif.quoteId">, N°:{{ notif.quoteId }}</i>
                  </p>
                </div>

                <div *ngIf="notifications.length === 0" class="px-4 py-2 text-center text-sm text-gray-500">
                  Aucune notification
                </div>
              </div>
            </div>


            <div class="relative" *ngIf="currentUser$ | async as user">
              <button
                (click)="toggleDropdown()"
                class="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <div class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ user.displayName.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div class="ml-2">
                  <div class="text-sm font-medium text-gray-900">{{ user.displayName }}</div>
                  <div class="text-xs text-gray-500">{{ user.role }}</div>
                </div>
              </button>

              <div
                *ngIf="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <a routerLink="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                <a *ngIf="this.authService.canAccessBtnEdit" routerLink="/checksDiagnostique" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Categorie</a>
                <a routerLink="/dictionnaire" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dictionnaire</a>
                <a routerLink="/notifications" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Notifications</a>
                <button
                  (click)="signOut()"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                Se déconnecter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;
  showDropdown = false;
  showNotifications = false;

  notifications: NotificationModel[] = []

  constructor(
    public readonly authService: AuthService,
    private readonly notifcationService: NotificationMessageService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
  this.loadNotificationsOnInit();
}

private async loadNotificationsOnInit(): Promise<void> {
  const user: User | null = await this.authService.getCurrentUser();
  if (!user) return;

  const garageId = user.garageId;
  const emailClient = user.role === 'Client' ? user.email : '';
  const role: 'Client' | 'Garage' = user.role === 'Client' ? 'Client' : 'Garage';

  this.notifications = await this.notifcationService.getAllLatestNotifications(emailClient, garageId, role, 5);
}


toggleDropdown(): void {
  this.showDropdown = !this.showDropdown;
}

async toggleNotifications(): Promise<void> {
  this.showNotifications = !this.showNotifications;
  if (!this.showNotifications) return;

  const user: User | null = await this.authService.getCurrentUser();
  if (!user) return;

  const garageId = user.garageId;
  const emailClient = user.role === 'Client' ? user.email : '';
  const role: 'Client' | 'Garage' = user.role === 'Client' ? 'Client' : 'Garage';

  this.notifications = await this.notifcationService.getAllLatestNotifications(emailClient, garageId, role, 5);
}

get unreadCount(): number {
  return this.notifications.filter(n => !n.read).length;
}

async markAllAsRead(): Promise<void> {
  await this.notifcationService.markAllAsRead(this.notifications);
  this.notifications.forEach(n => (n.read = true));
}

async markAsRead(notification: NotificationModel): Promise<void> {
  if (!notification.read) {
    await this.notifcationService.markAsRead(notification.id);
    notification.read = true;
  }
}

async signOut(): Promise<void> {
  try {
    await this.authService.signOut();
  } catch (error) {
    console.error('Error signing out:', error);
  }
}


}