import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';
import { DateFonction } from '../../services/fonction/date-fonction';


@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
        ></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div
      *ngIf="!isLoading"
      class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Devis
            </h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
          @if(this.authService.canBtnAccessInterventions){
            <button  routerLink="/quotes/new" class="btn-primary">
              Créer un devis
            </button>
          }
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="form-label">Rechercher</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterQuotes()"
                class="form-input"
                placeholder="Rechercher par numéro de devis ou client"
              />
            </div>
            <div>
              <label class="form-label">Statut</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterQuotes()"
                class="form-input"
              >
                <option value="">Tous les statuts</option>
                <option value="Pending">En attente</option>
                <option value="Accepted">Accepté</option>
                <option value="Rejected">Rejeté</option>
                <option value="Expired">Expiré</option>
              </select>
            </div>
            <div>
              <label class="form-label">Date de début</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (change)="filterQuotes()"
                class="form-input"
              />
            </div>
            <div>
              <label class="form-label">Date de fin</label>
              <input
                type="date"
                [(ngModel)]="toDate"
                (change)="filterQuotes()"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Quotes Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Devis #
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client(e)
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Véhicule
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total (GNF)
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    *ngIf="!this.authService.isClient"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Visibilité client
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Valide jusqu'à
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  *ngFor="let quote of filteredQuotes"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ quote.quoteNumber }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ quote.createdAt | firestoreDate | date : 'dd-MM-yyyy HH:mm' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(quote.clientId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(quote.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      \GNF {{ quote.total.toFixed(2) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="status-badge"
                      [ngClass]="getStatusClass(quote.status)"
                    >
                      {{ quote.status }}
                    </span>
                  </td>
                  <td *ngIf="!this.authService.isClient" class="px-6 py-4 whitespace-nowrap">
                    <span
                      *ngIf="quote.isVisibleToClient"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      title="Visible par le client"
                    >
                      <svg class="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                      </svg>
                      Visible client
                    </span>
                    <span
                      *ngIf="!quote.isVisibleToClient"
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                      title="Non envoyé au client"
                    >
                      <svg class="mr-1 h-3 w-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                      Brouillon / Non envoyé
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ quote.validUntil | firestoreDate | date : 'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      [routerLink]="['/quotes', quote.id]"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Voir
                    </button>
                    <button
                      *ngIf="!this.authService.isClient && this.authService.canAccessBtnEdit"
                      [routerLink]="['/quotes', quote.id, 'edit']"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      Modifier
                    </button>
                    <!-- Actions de visibilité pour l'administrateur -->
                    <button
                      *ngIf="!this.authService.isClient && !quote.isVisibleToClient"
                      (click)="confirmToggleVisibility(quote, true)"
                      class="text-emerald-600 hover:text-emerald-900 font-semibold"
                    >
                      Envoyer au client
                    </button>
                    <button
                      *ngIf="!this.authService.isClient && quote.isVisibleToClient"
                      (click)="confirmToggleVisibility(quote, false)"
                      class="text-amber-600 hover:text-amber-900"
                    >
                      Retirer visibilité
                    </button>
                    @if(this.authService.canBtnAccessInterventions &&
                    quote.status === 'Accepted'){
                    <button
                      [routerLink]="['/interventions/create', quote.id]"
                      class="text-secondary-600 hover:text-secondary-900"
                    >
                      Démarrer le travail
                    </button>
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Confirmation Modal for Visibility -->
        <div
          *ngIf="showVisibilityModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        >
          <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 animate-fadeIn">
            <div class="flex items-center space-x-3 mb-4">
              <div
                class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                [ngClass]="pendingVisibilityState ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'"
              >
                <svg *ngIf="pendingVisibilityState" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg *ngIf="!pendingVisibilityState" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">
                  {{ pendingVisibilityState ? 'Envoyer le devis au client' : 'Retirer la visibilité du devis' }}
                </h3>
                <p class="text-sm text-gray-500">
                  Devis N° {{ targetQuoteForVisibility?.quoteNumber }}
                </p>
              </div>
            </div>

            <p class="text-sm text-gray-600 mb-6">
              <span *ngIf="pendingVisibilityState">
                Êtes-vous sûr de vouloir rendre ce devis visible par le client ? Celui-ci pourra alors le consulter, le télécharger et l'accepter ou le rejeter depuis son espace client.
              </span>
              <span *ngIf="!pendingVisibilityState">
                Êtes-vous sûr de vouloir retirer temporairement l'accès à ce devis ? Le client ne pourra plus le consulter depuis son espace.
              </span>
            </p>

            <div class="flex justify-end space-x-3">
              <button
                type="button"
                (click)="cancelVisibilityModal()"
                [disabled]="isUpdatingVisibility"
                class="btn-secondary"
              >
                Annuler
              </button>
              <button
                type="button"
                (click)="executeToggleVisibility()"
                [disabled]="isUpdatingVisibility"
                [ngClass]="pendingVisibilityState ? 'btn-primary' : 'bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg shadow transition duration-150 ease-in-out'"
              >
                <span *ngIf="isUpdatingVisibility" class="mr-2">Action en cours...</span>
                {{ pendingVisibilityState ? 'Confirmer l\'envoi' : 'Confirmer le retrait' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QuoteListComponent implements OnInit {
  quotes: Quote[] = [];
  filteredQuotes: Quote[] = [];
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  searchTerm = '';
  statusFilter = '';
  fromDate = '';
  toDate = '';
  isLoading = true;

  // Modale de contrôle de visibilité
  showVisibilityModal = false;
  pendingVisibilityState = false;
  targetQuoteForVisibility: Quote | null = null;
  isUpdatingVisibility = false;

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    (async () => {
      if (this.authService.isClient) await this.loadDataClient();
      else await this.loadDataGarage();
    })();
  }

  private async loadDataClient(): Promise<void> {
    this.isLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Utiliser le service de gestion des utilisateurs
        const client = (await this.garageDataService.getWithFilter<Client>(
          'clients',
          [{ field: 'userId', operator: '==', value: currentUser.uid }]
        )) as Client[];

        if (client[0]) {
          [this.vehicles, this.quotes] = await Promise.all([
            // Étape 1 : récupérer les véhicules du client
            await this.garageDataService.getWithFilter<Vehicle>('vehicles', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
            // Étape 1 : récupérer uniquement les devis autorisés pour le client
            await this.garageDataService.getWithFilter<Quote>('quotes', [
              { field: 'clientId', operator: '==', value: client[0].id },
              { field: 'isVisibleToClient', operator: '==', value: true },
            ]),
          ]);

          this.clients.push(client[0]);
          // Filtrage mémoire strict : seuls les devis autorisés apparaissent côté client
          this.quotes = (this.quotes || []).filter((q) => q.isVisibleToClient === true);
          this.filteredQuotes = DateFonction.sortByCreatedAtDesc([...this.quotes]);
        }
      }
    } catch (error) {
      this.notificationService.showError('Echec de chargement des données' + error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDataGarage(): Promise<void> {
    this.isLoading = true;
    try {
      [this.quotes, this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Quote>('quotes'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
      this.filteredQuotes = DateFonction.sortByCreatedAtDesc([...this.quotes]);
    } catch (error) {
      this.notificationService.showError('Echec de chargement des données' + error);
    } finally {
      this.isLoading = false;
    }
  }

  filterQuotes(): void {
    let filtered = [...this.quotes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (quote) =>
          quote.quoteNumber.toLowerCase().includes(term) ||
          this.getClientName(quote.clientId).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter((quote) => quote.status === this.statusFilter);
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (quote) => new Date(quote.createdAt) >= fromDate
      );
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(
        (quote) => new Date(quote.createdAt) <= toDate
      );
    }

    this.filteredQuotes = filtered;
  }

  getClientName(clientId: string): string {
    const client = this.clients.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
      : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'expired':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  // --- Gestion du contrôle de visibilité ---
  confirmToggleVisibility(quote: Quote, makeVisible: boolean): void {
    this.targetQuoteForVisibility = quote;
    this.pendingVisibilityState = makeVisible;
    this.showVisibilityModal = true;
  }

  cancelVisibilityModal(): void {
    this.showVisibilityModal = false;
    this.targetQuoteForVisibility = null;
    this.pendingVisibilityState = false;
  }

  async executeToggleVisibility(): Promise<void> {
    if (!this.targetQuoteForVisibility) return;
    this.isUpdatingVisibility = true;

    try {
      const currentUser = this.authService.getCurrentUser();
      const adminName = currentUser?.displayName || currentUser?.email || 'Administrateur';
      const quoteId = this.targetQuoteForVisibility.id;
      const makeVisible = this.pendingVisibilityState;

      const updates: Partial<Quote> = {
        isVisibleToClient: makeVisible,
      };

      if (makeVisible) {
        updates.sentToClientAt = new Date();
        updates.sentToClientBy = adminName;
        updates.sentToClientById = currentUser?.uid;
      } else {
        updates.visibilityRevokedAt = new Date();
        updates.visibilityRevokedBy = adminName;
      }

      await this.garageDataService.update('quotes', quoteId, updates);

      // Création d'une notification pour le client si visibilité accordée
      if (makeVisible && this.targetQuoteForVisibility.clientId) {
        const client = this.clients.find((c) => c.id === this.targetQuoteForVisibility!.clientId);
        if (client?.email) {
          await this.garageDataService.create('notifications', {
            title: 'Nouveau devis disponible',
            message: `Votre devis N° ${this.targetQuoteForVisibility.quoteNumber} est maintenant disponible sur votre espace client.`,
            read: false,
            quoteId: quoteId,
            emailDesitnateur: client.email,
            type: 'Devis',
            garageId: this.targetQuoteForVisibility.garageId,
            createdAt: new Date(),
          });
        }
      }

      // Mise à jour locale
      this.targetQuoteForVisibility.isVisibleToClient = makeVisible;
      if (makeVisible) {
        this.targetQuoteForVisibility.sentToClientAt = updates.sentToClientAt;
        this.targetQuoteForVisibility.sentToClientBy = updates.sentToClientBy;
      } else {
        this.targetQuoteForVisibility.visibilityRevokedAt = updates.visibilityRevokedAt;
        this.targetQuoteForVisibility.visibilityRevokedBy = updates.visibilityRevokedBy;
      }

      this.notificationService.showSuccess(
        makeVisible
          ? 'Le devis a été envoyé et est désormais visible par le client'
          : 'La visibilité du devis a été retirée pour le client'
      );

      this.cancelVisibilityModal();
    } catch (error) {
      this.notificationService.showError('Échec de la mise à jour de la visibilité : ' + error);
    } finally {
      this.isUpdatingVisibility = false;
    }
  }
}