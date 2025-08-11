import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { Quote } from '../../models/quote.model';
import { Invoice } from '../../models/invoice.model';
import { UserManagementService } from '../../services/user-management.service';
import { Intervention } from '../../models/intervention.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-pulse flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <!-- Header amélioré -->
      <header class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-20 items-center">
            <div class="flex items-center space-x-2">
              <svg class="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <h1 class="text-2xl font-bold text-gray-800">Mon Espace Client</h1>
            </div>

            <!-- <div class="flex items-center space-x-6">
              <div class="relative group">
                <div class="flex items-center space-x-2 cursor-pointer">
                  <div class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-medium">{{ currentUser?.displayName?.charAt(0) }}</span>
                  </div>
                  <span class="text-gray-700 font-medium">{{ currentUser?.displayName }}</span>
                </div>
                <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 invisible group-hover:visible transition-all duration-200">
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon Profil</a>
                  <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Déconnexion</a>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </header>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Cartes de statistiques -->
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <!-- Carte Véhicules -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium text-gray-500">Mes véhicules</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ vehicles.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Visites -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium text-gray-500">Visites enregistrées</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ visits.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Devis -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-yellow-100 p-3 rounded-lg">
                  <svg class="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium text-gray-500">Devis en attente</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ pendingQuotes.length }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Carte Factures -->
          <div class="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
            <div class="p-6">
              <div class="flex items-center">
                <div class="flex-shrink-0 bg-red-100 p-3 rounded-lg">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"/>
                  </svg>
                </div>
                <div class="ml-5">
                  <p class="text-sm font-medium text-gray-500">Factures impayées</p>
                  <p class="text-2xl font-semibold text-gray-900">{{ unpaidInvoices.length }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions rapides -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-gray-800 mb-4">Actions rapides</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a routerLink="/quotes" class="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:border-primary-300 transition-all duration-200 hover:shadow-md group">
              <div class="flex items-center">
                <div class="bg-blue-50 p-3 rounded-lg mr-4 group-hover:bg-blue-100 transition-colors duration-200">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Mes Devis</h3>
                  <p class="text-sm text-gray-500 mt-1">Consulter et valider vos devis</p>
                </div>
              </div>
            </a>

            <a routerLink="/invoices" class="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:border-green-300 transition-all duration-200 hover:shadow-md group">
              <div class="flex items-center">
                <div class="bg-green-50 p-3 rounded-lg mr-4 group-hover:bg-green-100 transition-colors duration-200">
                  <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Mes Factures</h3>
                  <p class="text-sm text-gray-500 mt-1">Suivre vos paiements</p>
                </div>
              </div>
            </a>

            <a routerLink="/vehicles" class="bg-white rounded-lg shadow-sm p-5 border border-gray-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md group">
              <div class="flex items-center">
                <div class="bg-purple-50 p-3 rounded-lg mr-4 group-hover:bg-purple-100 transition-colors duration-200">
                  <svg class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-800">Mes Véhicules</h3>
                  <p class="text-sm text-gray-500 mt-1">Gérer vos véhicules</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        <!-- Activités récentes -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          <!-- Devis récents -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Derniers Devis</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div *ngFor="let quote of recentQuotes" class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">Devis #{{ quote.quoteNumber }}</p>
                    <p class="text-sm text-gray-500 mt-1">{{ quote.createdAt | firestoreDate | date:'mediumDate' }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">{{ quote.total | currency:'GNF ':'symbol':'1.2-2' }}</p>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1"
                          [ngClass]="{
                            'bg-green-100 text-green-800': quote.status === 'Accepted',
                            'bg-yellow-100 text-yellow-800': quote.status === 'Pending',
                            'bg-red-100 text-red-800': quote.status === 'Rejected'
                          }">
                      {{ quote.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div *ngIf="recentQuotes.length === 0" class="px-6 py-8 text-center">
                <p class="text-gray-500">Aucun devis récent</p>
              </div>
            </div>
            <div class="px-6 py-3 bg-gray-50 text-right">
              <a routerLink="/quotes" class="text-sm font-medium text-primary-600 hover:text-primary-700">
                Voir tous les devis →
              </a>
            </div>
          </div>

          <!-- Visites récentes -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
              <h2 class="text-lg font-semibold text-gray-800">Dernières Visites</h2>
            </div>
            <div class="divide-y divide-gray-200">
              <div *ngFor="let visit of recentVisits" class="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ getVehicleInfo(visit.vehicleId) }}</p>
                    <p class="text-sm text-gray-500 mt-1">{{ visit.visitDate | firestoreDate | date:'mediumDate' }}</p>
                  </div>
                  <div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          [ngClass]="{
                            'bg-blue-100 text-blue-800': visit.status === 'Completed',
                            'bg-yellow-100 text-yellow-800': visit.status === 'InProgress',
                            'bg-purple-100 text-purple-800': visit.status === 'Cancelled'
                          }">
                      {{ visit.status }}
                    </span>
                  </div>
                </div>
              </div>
              <div *ngIf="recentVisits.length === 0" class="px-6 py-8 text-center">
                <p class="text-gray-500">Aucune visite récente</p>
              </div>
            </div>
            <div class="px-6 py-3 bg-gray-50 text-right">
              <a routerLink="/visits" class="text-sm font-medium text-primary-600 hover:text-primary-700">
                Voir toutes les visites →
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class ClientDashboardComponent implements OnInit {
  currentUser: User | null = null;
  client: Client | null = null;
  vehicles: Vehicle[] = [];
  visits: Visit[] = [];
  quotes: Quote[] = [];
  invoices: Invoice[] = [];
  isLoading = true

  recentQuotes: Quote[] = [];
  recentVisits: Visit[] = [];
  pendingQuotes: Quote[] = [];
  unpaidInvoices: Invoice[] = [];


  constructor(
    private readonly authService: AuthService,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly userManagementService: UserManagementService
  ) {}

  ngOnInit() {
      (async() => {
          this.authService.currentUser$.subscribe(user => {
              this.currentUser = user;
              if (user) {
              this.loadClientData();
              }
          })
      })()

  }

  private async loadClientData(): Promise<void> {
    this.isLoading = true
    if (!this.currentUser) return;

    try {
      // Utiliser le service de gestion des utilisateurs
      this.client = await this.userManagementService.getClientByUserId(this.currentUser.uid);

      if (this.client) {
        await this.loadRelatedData();
      }
    } catch (error) {
      this.notificationService.showError('Échec de chargement des données client ' + error);
    }finally{ this.isLoading = false}
  }

  private async loadRelatedData(): Promise<void> {
    if (!this.client) return;

    try {
      [this.vehicles, this.visits, this.quotes, this.invoices] = await Promise.all([
        this.garageDataService.getWithFilter<Vehicle>('vehicles', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ]),
        this.garageDataService.getWithFilter<Visit>('visits', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ]),
        this.garageDataService.getWithFilter<Quote>('quotes', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ]),
        this.garageDataService.getWithFilter<Invoice>('invoices', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ])
      ]);

      // Filter recent items
      // this.recentQuotes = this.quotes.slice(0, 2);
      // this.recentVisits = this.visits.slice(0, 2);
      const sortedQuotes = [...this.quotes].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      this.recentQuotes = sortedQuotes.slice(0, 5);

      const sortedVisits = [...this.visits].sort(
        (a, b) =>
          new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
      );
      this.recentVisits = sortedVisits.slice(0, 5);

      this.pendingQuotes = this.quotes.filter(q => q.status === 'Pending');
      this.unpaidInvoices = this.invoices.filter(i => i.status === 'Unpaid');

    } catch (error) {
      this.notificationService.showError('Failed to load related data: ' +error);
    }
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getVisitStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'inprogress': return 'status-accepted';
      case 'completed': return 'status-paid';
      case 'cancelled': return 'status-rejected';
      default: return 'status-pending';
    }
  }



}