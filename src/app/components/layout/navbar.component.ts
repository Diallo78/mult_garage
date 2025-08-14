import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
      <div class="px-3 sm:px-4 lg:px-6">
        <div class="flex justify-between h-14 sm:h-16 items-center">
          <!-- Logo -->
          <div class="flex items-center">
            <div
              class="text-lg sm:text-xl lg:text-2xl font-bold text-primary-600"
            >
              🚗 <span class="ml-1 hidden xs:inline">GarageManager</span>
            </div>
          </div>

          <!-- Burger menu (mobile only) -->
          <div class="flex lg:hidden">
            <button
              (click)="toggleMobileMenu()"
              class="text-gray-600 hover:text-primary-600 focus:outline-none p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg
                class="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path *ngIf="!mobileMenuOpen" d="M4 6h16M4 12h16M4 18h16" />
                <path *ngIf="mobileMenuOpen" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Desktop menu -->
          <div class="hidden lg:flex items-center space-x-4">
            <!-- Notifications -->
            <div class="relative">
              <button
                [ngClass]="{
                  'relative p-2 text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transition-colors': true,
                  'text-primary-600': unreadCount > 0,
                  'animate-pulse': unreadCount > 0
                }"
                (click)="toggleNotifications()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  [ngClass]="{'text-primary-600': unreadCount > 0}"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C8.67 6.165 8 7.388 8 9v5.159c0 .538-.214 1.055-.595 1.436L6 17h5m4 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>

                <!-- Badge -->
                <span
                  *ngIf="unreadCount > 0"
                  class="notification-badge absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full shadow-md"
                >
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Dropdown de notifications -->
              <div
                *ngIf="showNotifications"
                class="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 border border-gray-200 transform transition-all duration-200 ease-out origin-top-right"
                [ngClass]="{'scale-100 opacity-100': showNotifications, 'scale-95 opacity-0': !showNotifications}"
                (mouseenter)="resetNotificationTimeout()"
                (mousemove)="resetNotificationTimeout()"
                (click)="resetNotificationTimeout()"
              >
                <div
                  class="px-4 py-2 border-b font-semibold text-gray-800 flex justify-between items-center"
                >
                  <div class="flex items-center gap-2">
                    Notifications non lues
                    <span class="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {{ unreadCount }}
                    </span>
                  </div>
                  <button
                    class="text-xs text-blue-500 hover:underline"
                    (click)="markAllAsRead()"
                  >
                    Marquer tous lu
                  </button>
                </div>

                <div
                  *ngFor="let notif of unreadNotifications"
                  class="px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b cursor-pointer"
                  (click)="markAsRead(notif)"
                >
                  <div class="font-semibold text-primary-600">
                    {{ notif.title }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ notif.message }}
                  </div>

                  <p class="text-xs text-gray-500 mt-1">
                    {{ notif.createdAt | firestoreDate | date : 'medium' }}
                    <i *ngIf="notif.quoteId">, N°:{{ notif.quoteId }}</i>
                  </p>
                </div>

                <div
                  *ngIf="unreadNotifications.length === 0"
                  class="px-4 py-2 text-center text-sm text-gray-500"
                >
                  Aucune notification non lue
                </div>

                <div class="px-4 py-2 border-t text-center">
                  <a routerLink="/notifications" class="text-xs text-blue-500 hover:underline">
                    Voir toutes les notifications
                  </a>
                </div>
              </div>
            </div>

            <!-- Profile -->
            <div class="relative" *ngIf="currentUser$ | async as user">
              <button
                (click)="toggleDropdown()"
                class="flex items-center text-sm rounded-full focus:outline-none"
              >
                <div
                  class="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <span class="text-white text-sm font-medium">{{
                    user.displayName.charAt(0).toUpperCase()
                  }}</span>
                </div>
                <div class="ml-2 hidden sm:block">
                  <div class="text-sm font-medium text-gray-900">
                    {{ user.displayName }}
                  </div>
                  <div class="text-xs text-gray-500">{{ user.role }}</div>
                </div>
              </button>

              <div
                *ngIf="showDropdown"
                class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
              >
                <a
                  (click)="routerProfile()"
                  class="cursor-pointer block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Profil</a
                >
                <a
                  *ngIf="authService.canAccessBtnEdit"
                  routerLink="/checksDiagnostique"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Catégorie</a
                >
                <a
                  routerLink="/dictionnaire"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Dictionnaire</a
                >
                <a
                  routerLink="/notifications"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >Notifications</a
                >
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

      <!-- Mobile dropdown menu -->
      <div
        *ngIf="mobileMenuOpen"
        class="sm:hidden px-4 py-2 border-t space-y-2"
      >
        <div *ngIf="currentUser$ | async as user">
          <div class="font-semibold">{{ user.displayName }}</div>
          <div class="text-sm text-gray-600">{{ user.role }}</div>
        </div>

        <a (click)="routerProfile()" class="block text-sm text-gray-700"
          >Profil</a
        >
        <a
          *ngIf="authService.canAccessBtnEdit"
          routerLink="/checksDiagnostique"
          class="block text-sm text-gray-700"
          >Catégorie</a
        >
        <a routerLink="/dictionnaire" class="block text-sm text-gray-700"
          >Dictionnaire</a
        >
        <a routerLink="/notifications" class="block text-sm text-gray-700"
          >Notifications</a
        >
        <button
          (click)="signOut()"
          class="block text-left text-sm text-gray-700 w-full"
        >
          Se déconnecter
        </button>
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;
  showDropdown = false;
  showNotifications = false;

  notifications: NotificationModel[] = [];

  get unreadNotifications(): NotificationModel[] {
    return this.notifications.filter(notif => !notif.read);
  }

  constructor(
    public readonly authService: AuthService,
    private readonly notifcationService: NotificationMessageService,
    private readonly router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadNotificationsOnInit();
    // Rafraîchir les notifications toutes les 2 minutes
    this.startNotificationRefreshInterval();
  }

  private startNotificationRefreshInterval(): void {
    // Rafraîchir les notifications en arrière-plan toutes les 2 minutes
    setInterval(async () => {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const garageId = user.garageId;
      const emailClient = user.role === 'Client' ? user.email : '';
      const role: 'Client' | 'Garage' = user.role === 'Client' ? 'Client' : 'Garage';

      // Récupérer les nouvelles notifications
      const newNotifications = await this.notifcationService.getAllLatestNotifications(
        emailClient,
        garageId,
        role,
        15
      );

      // Vérifier s'il y a de nouvelles notifications non lues
      const currentUnreadCount = this.unreadCount;
      this.notifications = newNotifications;

      // Si de nouvelles notifications non lues sont arrivées, ajouter une animation
      if (this.unreadCount > currentUnreadCount && this.unreadCount > 0) {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
          badge.classList.add('animate-bounce');
          setTimeout(() => {
            badge.classList.remove('animate-bounce');
          }, 2000);
        }
      }
    }, 120000); // 2 minutes
  }

  private async loadNotificationsOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const garageId = user.garageId;
    const emailClient = user.role === 'Client' ? user.email : '';
    const role: 'Client' | 'Garage' =
      user.role === 'Client' ? 'Client' : 'Garage';

    // Charger toutes les notifications (15 maximum)
    this.notifications =
      await this.notifcationService.getAllLatestNotifications(
        emailClient,
        garageId,
        role,
        15
      );

    // Si des notifications non lues sont présentes, ajouter une animation au badge
    if (this.unreadCount > 0) {
      // Animation subtile pour attirer l'attention sur les nouvelles notifications
      setTimeout(() => {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
          badge.classList.add('animate-bounce');
          setTimeout(() => {
            badge.classList.remove('animate-bounce');
          }, 2000);
        }
      }, 1000);
    }
  }

  routerProfile() {
    //  [routerLink]="['/payments/create', invoice.id]"
    // ['/clients', client.id, 'edit']
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      const encodedEmail = encodeURIComponent(currentUser.email);
      this.router.navigate(['/profile', encodedEmail, 'edit']);
    }
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  private notificationTimeout: any = null;
  private lastInteraction: number = 0;

  resetNotificationTimeout(): void {
    // Mettre à jour le timestamp de la dernière interaction
    this.lastInteraction = Date.now();

    // Annuler le timeout existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
    }

    // Définir un nouveau timeout si les notifications sont affichées
    if (this.showNotifications) {
      this.notificationTimeout = setTimeout(() => {
        // Vérifier si l'utilisateur a interagi récemment (dans les 5 dernières secondes)
        if (Date.now() - this.lastInteraction > 5000) {
          this.showNotifications = false;
        } else {
          // Sinon, réessayer plus tard
          this.resetNotificationTimeout();
        }
      }, 10000); // 10 secondes
    }
  }

  async toggleNotifications(): Promise<void> {
    this.showNotifications = !this.showNotifications;

    // Annuler tout timeout existant
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = null;
    }

    if (!this.showNotifications) return;

    const user: User | null = this.authService.getCurrentUser();
    if (!user) return;

    const garageId = user.garageId;
    const emailClient = user.role === 'Client' ? user.email : '';
    const role: 'Client' | 'Garage' =
      user.role === 'Client' ? 'Client' : 'Garage';

    // Charger toutes les notifications (10 maximum)
    this.notifications =
      await this.notifcationService.getAllLatestNotifications(
        emailClient,
        garageId,
        role,
        10
      );

    // Si aucune notification non lue, fermer automatiquement après 2 secondes
    if (this.unreadCount === 0) {
      this.notificationTimeout = setTimeout(() => {
        this.showNotifications = false;
      }, 2000);
    } else {
      // Sinon, fermer automatiquement après 15 secondes d'inactivité
      this.notificationTimeout = setTimeout(() => {
        this.showNotifications = false;
      }, 15000);
    }
  }

  get unreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  async markAllAsRead(): Promise<void> {
    await this.notifcationService.markAllAsRead(this.notifications);
    this.notifications.forEach((n) => (n.read = true));
  }

  async markAsRead(notification: NotificationModel): Promise<void> {
    if (!notification.read) {
      await this.notifcationService.markAsRead(notification.id);
      notification.read = true;
      if (notification.type === 'Devis')
        this.router.navigate(['/quotes', notification.quoteId])
      if (notification.type === 'Facture')
        this.router.navigate(['/invoices', notification.quoteId])
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  mobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
