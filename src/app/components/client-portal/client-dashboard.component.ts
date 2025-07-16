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

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">Client Portal</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-700" *ngIf="currentUser">
                Welcome, {{ currentUser.displayName }}
              </span>
              <button (click)="signOut()" class="btn-outline text-sm">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="space-y-6">
          <!-- Overview Cards -->
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                    🚗
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-500">My Vehicles</div>
                  <div class="text-2xl font-bold text-gray-900">{{ vehicles.length }}</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                    🏥
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-500">Total Visits</div>
                  <div class="text-2xl font-bold text-gray-900">{{ visits.length }}</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white">
                    💰
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-500">Pending Quotes</div>
                  <div class="text-2xl font-bold text-gray-900">{{ pendingQuotes.length }}</div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white">
                    🧾
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-500">Unpaid Invoices</div>
                  <div class="text-2xl font-bold text-gray-900">{{ unpaidInvoices.length }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="card">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                routerLink="/client/quotes"
                class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <div class="text-lg font-medium text-gray-900">View Quotes</div>
                <div class="text-sm text-gray-500">Review and approve pending quotes</div>
              </button>
              <button
                routerLink="/client/invoices"
                class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <div class="text-lg font-medium text-gray-900">View Invoices</div>
                <div class="text-sm text-gray-500">Check invoice status and payments</div>
              </button>
              <button
                routerLink="/client/vehicles"
                class="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
              >
                <div class="text-lg font-medium text-gray-900">My Vehicles</div>
                <div class="text-sm text-gray-500">View vehicle history and status</div>
              </button>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Quotes -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Quotes</h3>
              <div class="space-y-3">
                <div *ngFor="let quote of recentQuotes"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ quote.quoteNumber }}</div>
                    <div class="text-xs text-gray-500">{{ quote.createdAt | date:'short' }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">\${{ quote.total.toFixed(2) }}</div>
                    <span class="status-badge" [ngClass]="getStatusClass(quote.status)">
                      {{ quote.status }}
                    </span>
                  </div>
                </div>
                <div *ngIf="recentQuotes.length === 0" class="text-center py-4 text-gray-500">
                  No quotes available
                </div>
              </div>
            </div>

            <!-- Recent Visits -->
            <div class="card">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Visits</h3>
              <div class="space-y-3">
                <div *ngFor="let visit of recentVisits"
                     class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ visit.visitDate | date:'short' }}</div>
                    <div class="text-xs text-gray-500">{{ getVehicleInfo(visit.vehicleId) }}</div>
                  </div>
                  <span class="status-badge" [ngClass]="getVisitStatusClass(visit.status)">
                    {{ visit.status }}
                  </span>
                </div>
                <div *ngIf="recentVisits.length === 0" class="text-center py-4 text-gray-500">
                  No visits recorded
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
        ;
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
    if (!this.currentUser) return;

    try {
      // Utiliser le service de gestion des utilisateurs
      this.client = await this.userManagementService.getClientByUserId(this.currentUser.uid);

      if (this.client) {
        await this.loadRelatedData();
      }
    } catch (error) {
      this.notificationService.showError('Échec de chargement des données client');
    }
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
      this.recentQuotes = this.quotes.slice(0, 5);
      this.recentVisits = this.visits.slice(0, 5);
      this.pendingQuotes = this.quotes.filter(q => q.status === 'Pending');
      this.unpaidInvoices = this.invoices.filter(i => i.status === 'Unpaid');
    } catch (error) {
      this.notificationService.showError('Failed to load related data');
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

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
    } catch (error) {
      this.notificationService.showError('Failed to sign out');
    }
  }
}