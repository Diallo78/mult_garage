import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { NotificationMessageService } from '../../services/notification-message.service';
import { NotificationModel } from '../../models/notification';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-message',
  standalone: true,
  imports: [CommonModule, FormsModule, FirestoreDatePipe],
  styles: [
    `
      @keyframes fadeInDown {
        from {
          opacity: 0;
          transform: translate3d(0, -20px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
        }
      }

      .animate-fade-in-down {
        animation: fadeInDown 0.5s ease-out;
      }

      .animate-pulse-blue {
        animation: pulse 2s infinite;
      }
    `,
  ],
  template: `
    <div
      *ngIf="isLoading"
      class="flex flex-col justify-center items-center h-[60vh]"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid mb-4"
      ></div>
      <p class="text-gray-500 animate-pulse">Chargement des notifications...</p>
    </div>

    <!-- Notification de succès -->
    <div
      *ngIf="showSuccessMessage"
      class="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50 animate-fade-in-down"
      role="alert"
    >
      <div class="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2 text-green-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"
          />
        </svg>
        <span>{{ successMessage }}</span>
      </div>
    </div>

    <div *ngIf="!isLoading" class="bg-gray-50 min-h-screen py-6">
      <div class="max-w-4xl mx-auto p-4">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-primary-700 flex items-center">
            <span class="mr-2">📬</span> Boîte de réception
            <span
              *ngIf="unreadCount > 0"
              class="ml-3 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full"
            >
              {{ unreadCount }} non lu{{ unreadCount > 1 ? 's' : '' }}
            </span>
          </h2>

          <div class="flex space-x-2">
            <button
              (click)="refreshNotifications()"
              class="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors shadow-sm flex items-center mr-2"
              title="Rafraîchir les notifications"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Rafraîchir
            </button>
            <button
              *ngIf="unreadCount > 0"
              (click)="markAllAsRead()"
              class="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-md transition-colors shadow-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Tout marquer comme lu
            </button>
          </div>
        </div>

        <!-- Recherche et filtres -->
        <div
          class="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-200"
        >
          <!-- Champ de recherche -->
          <div class="mb-3">
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"
              >
                <svg
                  class="w-4 h-4 text-gray-500"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                [(ngModel)]="searchText"
                (ngModelChange)="applyFilters()"
                class="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Rechercher dans les notifications..."
              />
            </div>
          </div>

          <div class="flex flex-wrap gap-3 items-center">
            <div class="flex items-center">
              <label class="mr-2 text-sm font-medium text-gray-700"
                >Filtrer par :</label
              >
              <select
                [(ngModel)]="filterType"
                (change)="applyFilters()"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 p-2"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>

            <div class="flex items-center ml-3">
              <label class="mr-2 text-sm font-medium text-gray-700"
                >Période :</label
              >
              <select
                [(ngModel)]="dateFilter"
                (change)="applyFilters()"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 p-2"
              >
                <option value="all">Toutes les dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>

            <div class="flex-grow"></div>

            <div class="flex items-center">
              <label class="mr-2 text-sm font-medium text-gray-700"
                >Trier par :</label
              >
              <select
                [(ngModel)]="sortOrder"
                (change)="applyFilters()"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-primary-500 focus:border-primary-500 p-2"
              >
                <option value="newest">Plus récentes</option>
                <option value="oldest">Plus anciennes</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Résumé des filtres et compteur -->
        <div
          *ngIf="notifications.length > 0"
          class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm"
        >
          <div class="flex justify-between items-center">
            <div>
              <span class="font-medium">{{
                filteredNotifications.length
              }}</span>
              notification{{ filteredNotifications.length !== 1 ? 's' : '' }}
              <span class="text-gray-500"
                >sur {{ notifications.length }} au total</span
              >
            </div>
            <button
              *ngIf="
                filterType !== 'all' ||
                dateFilter !== 'all' ||
                sortOrder !== 'newest'
              "
              (click)="resetFilters()"
              class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- Liste des notifications -->
        <div
          class="bg-white shadow rounded-lg border border-gray-200 overflow-hidden transition-all duration-300"
        >
          <div class="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
            <div
              *ngFor="let notif of filteredNotifications; let i = index"
              class="p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer relative"
              [ngClass]="{ 'bg-blue-50': !notif.read }"
              [style.animation-delay]="!notif.read ? i * 0.1 + 's' : '0s'"
            >
              <!-- Animation pour les notifications non lues -->
              <div
                *ngIf="!notif.read"
                class="absolute top-0 right-0 bottom-0 left-0 animate-pulse-blue opacity-50 pointer-events-none rounded-md"
              ></div>

              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center">
                    <div
                      *ngIf="!notif.read"
                      class="w-2 h-2 bg-blue-500 rounded-full mr-2"
                    ></div>
                    <h3
                      class="text-lg font-medium"
                      [ngClass]="notif.read ? 'text-gray-700' : 'text-gray-900'"
                    >
                      {{ notif.title }}
                    </h3>
                  </div>
                  <p
                    class="text-sm mt-2"
                    [ngClass]="notif.read ? 'text-gray-600' : 'text-gray-800'"
                    (click)="markAsRead(notif)"
                  >
                    {{ notif.message }}
                  </p>
                  <div class="flex items-center mt-2 text-xs text-gray-500">
                    <span class="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {{
                        notif.createdAt
                          | firestoreDate
                          | date : 'dd/MM/yyyy à HH:mm'
                      }}
                    </span>
                    <span
                      *ngIf="notif.quoteId"
                      class="ml-3 flex items-center"
                      (click)="opentUrl(notif)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3.5 w-3.5 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Devis N°{{ notif.quoteId }}
                    </span>
                  </div>
                </div>
                <span
                  class="text-xs px-2 py-1 rounded-full ml-2 whitespace-nowrap"
                  [ngClass]="
                    notif.read
                      ? 'bg-gray-200 text-gray-600'
                      : 'bg-blue-100 text-blue-800 font-semibold'
                  "
                >
                  {{ notif.read ? 'Lu' : 'Non lu' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message si aucune notification -->
        <div
          *ngIf="filteredNotifications.length === 0"
          class="text-center bg-white p-8 rounded-lg shadow-sm mt-4 border border-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-12 w-12 mx-auto text-gray-400 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <p class="text-gray-500 font-medium">
            {{
              notifications.length === 0
                ? 'Aucune notification pour le moment.'
                : 'Aucune notification ne correspond à vos filtres.'
            }}
          </p>
          <p class="text-gray-400 text-sm mt-1">
            Changez les filtres ou revenez plus tard
          </p>
        </div>

        <!-- Pagination -->
        <div
          *ngIf="notifications.length > 0"
          class="mt-4 flex justify-between items-center"
        >
          <div class="text-sm text-gray-600">
            Affichage de {{ filteredNotifications.length }} notification{{
              filteredNotifications.length > 1 ? 's' : ''
            }}
            sur {{ notifications.length }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class NotificationMessage implements OnInit, OnDestroy {
  notifications: NotificationModel[] = [];
  filteredNotifications: NotificationModel[] = [];
  isLoading = true;
  filterType: 'all' | 'read' | 'unread' = 'all';
  sortOrder: 'newest' | 'oldest' = 'newest';
  dateFilter: 'all' | 'today' | 'week' | 'month' = 'all';
  searchText = '';

  // Propriétés pour les messages de succès
  showSuccessMessage = false;
  successMessage = '';

  // Propriétés pour le rafraîchissement automatique
  private refreshInterval: any;
  private lastNotificationCount = 0;

  constructor(
    private readonly notificationService: NotificationMessageService,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    (async () => {
      this.isLoading = true;
      try {
        await this.loadNotifications();

        // Si des notifications non lues sont présentes, afficher un message
        const unreadCount = this.unreadCount;
        if (unreadCount > 0) {
          this.showSuccess(
            `Vous avez ${unreadCount} notification${
              unreadCount > 1 ? 's' : ''
            } non lue${unreadCount > 1 ? 's' : ''}`
          );
        }

        // Démarrer le rafraîchissement automatique des notifications (toutes les 2 minutes)
        this.startAutoRefresh();
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      } finally {
        this.isLoading = false;
      }
    })();
  }

  ngOnDestroy(): void {
    // Nettoyer l'intervalle lors de la destruction du composant
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  private async loadNotifications(): Promise<void> {
    const user: User | null = this.authService.getCurrentUser();
    if (!user) return;

    const garageId = user.garageId;
    const emailClient = user.role === 'Client' ? user.email : '';
    const role: 'Client' | 'Garage' =
      user.role === 'Client' ? 'Client' : 'Garage';

    // Récupérer toutes les notifications (jusqu'à 100)
    this.notifications =
      await this.notificationService.getAllLatestNotifications(
        emailClient,
        garageId,
        role,
        100
      );
    this.lastNotificationCount = this.notifications.filter(
      (n) => !n.read
    ).length;

    // Appliquer les filtres initiaux
    this.applyFilters();
  }

  private startAutoRefresh(): void {
    // Rafraîchir les notifications toutes les 2 minutes
    this.refreshInterval = setInterval(async () => {
      const previousUnreadCount = this.lastNotificationCount;
      await this.loadNotifications();

      // Si de nouvelles notifications non lues sont arrivées, afficher un message
      const currentUnreadCount = this.notifications.filter(
        (n) => !n.read
      ).length;
      if (currentUnreadCount > previousUnreadCount) {
        const newCount = currentUnreadCount - previousUnreadCount;
        this.showSuccess(
          `${newCount} nouvelle${newCount > 1 ? 's' : ''} notification${
            newCount > 1 ? 's' : ''
          }`
        );
      }
    }, 120000); // 2 minutes
  }

  /**
   * Applique les filtres et le tri aux notifications
   */
  applyFilters(): void {
    // Filtrer les notifications
    let filtered = [...this.notifications];

    // Filtre par statut de lecture
    if (this.filterType === 'read') {
      filtered = filtered.filter((notif) => notif.read);
    } else if (this.filterType === 'unread') {
      filtered = filtered.filter((notif) => !notif.read);
    }

    // Filtre par texte de recherche
    if (this.searchText && this.searchText.trim() !== '') {
      const searchLower = this.searchText.toLowerCase().trim();
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(searchLower) ||
          notif.message.toLowerCase().includes(searchLower) ||
          (notif.quoteId && notif.quoteId.toString().includes(searchLower))
      );
    }

    // Filtre par date
    if (this.dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((notif) => {
        const notifDate =
          notif.createdAt instanceof Date
            ? notif.createdAt
            : notif.createdAt.toDate();

        if (this.dateFilter === 'today') {
          return notifDate >= today;
        } else if (this.dateFilter === 'week') {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          return notifDate >= weekStart;
        } else if (this.dateFilter === 'month') {
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          return notifDate >= monthStart;
        }
        return true;
      });
    }

    // Trier les notifications
    filtered.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();

      return this.sortOrder === 'newest'
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });

    this.filteredNotifications = filtered;
  }

  /**
   * Réinitialise tous les filtres à leurs valeurs par défaut
   */
  resetFilters(): void {
    this.filterType = 'all';
    this.dateFilter = 'all';
    this.sortOrder = 'newest';
    this.searchText = '';
    this.applyFilters();
    this.showSuccess('Filtres réinitialisés');
  }

  /**
   * Retourne le nombre de notifications non lues
   */
  get unreadCount(): number {
    return this.notifications.filter((notif) => !notif.read).length;
  }

  /**
   * Affiche un message de succès temporaire
   */
  private showSuccess(message: string, duration: number = 3000): void {
    this.successMessage = message;
    this.showSuccessMessage = true;

    setTimeout(() => {
      this.showSuccessMessage = false;
    }, duration);
  }

  /**
   * Marque toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<void> {
    try {
      const unreadCount = this.unreadCount;
      if (unreadCount === 0) return;

      await this.notificationService.markAllAsRead(this.notifications);
      this.notifications.forEach((n) => (n.read = true));
      this.applyFilters(); // Mettre à jour l'affichage

      // Afficher un message de succès
      this.showSuccess(
        `${unreadCount} notification${unreadCount > 1 ? 's' : ''} marquée${
          unreadCount > 1 ? 's' : ''
        } comme lue${unreadCount > 1 ? 's' : ''}`
      );
    } catch (error) {
      console.error(
        'Erreur lors du marquage des notifications comme lues:',
        error
      );
    }
  }

  /**
   * Marque une notification comme lue
   */
  async markAsRead(notification: NotificationModel): Promise<void> {
    if (!notification.read) {
      try {
        await this.notificationService.markAsRead(notification.id);
        notification.read = true; // Mise à jour locale
        this.applyFilters(); // Mettre à jour l'affichage si nécessaire
        this.opentUrl(notification);
        // Afficher un message de succès
        this.showSuccess('Notification marquée comme lue');
      } catch (error) {
        console.error(
          'Erreur lors du marquage de la notification comme lue:',
          error
        );
      }
    }
  }

  opentUrl(notification: NotificationModel) {
    if (notification.type === 'Devis')
      this.router.navigate(['/quotes', notification.quoteId]);
    if (notification.type === 'Facture')
      this.router.navigate(['/invoices', notification.quoteId]);
  }



  /**
   * Rafraîchit manuellement les notifications
   */
  async refreshNotifications(): Promise<void> {
    try {
      this.isLoading = true;
      await this.loadNotifications();
      this.showSuccess('Notifications rafraîchies');
    } catch (error) {
      console.error(
        'Erreur lors du rafraîchissement des notifications:',
        error
      );
    } finally {
      this.isLoading = false;
    }
  }
}
