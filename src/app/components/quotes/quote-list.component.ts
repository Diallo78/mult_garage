import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
    </div>

    <div *ngIf="!isLoading">
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Quotes
          </h2>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">Search</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterQuotes()"
              class="form-input"
              placeholder="Search by quote number or client"
            />
          </div>
          <div>
            <label class="form-label">Status</label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterQuotes()"
              class="form-input"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
          <div>
            <label class="form-label">From Date</label>
            <input
              type="date"
              [(ngModel)]="fromDate"
              (change)="filterQuotes()"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">To Date</label>
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
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quote #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let quote of filteredQuotes" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ quote.quoteNumber }}</div>
                  <div class="text-sm text-gray-500">{{ quote.createdAt | firestoreDate | date:'short' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getClientName(quote.clientId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getVehicleInfo(quote.vehicleId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">\${{ quote.total.toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="status-badge" [ngClass]="getStatusClass(quote.status)">
                    {{ quote.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ quote.validUntil | firestoreDate | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    [routerLink]="['/quotes', quote.id]"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </button>
                  @if(this.authService.canBtnAccessInterventions && quote.status === 'Accepted'){
                    <button
                      [routerLink]="['/interventions/create', quote.id]"
                      class="text-secondary-600 hover:text-secondary-900"
                    >
                      Start Work
                    </button>
                  }

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  `
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
  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading = true
    try {
      [this.quotes, this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Quote>('quotes'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles')
      ]);
      this.filteredQuotes = [...this.quotes];
    } catch (error) {
      this.notificationService.showError('Failed to load quotes');
    }finally{this.isLoading = false}
  }

  filterQuotes(): void {
    let filtered = [...this.quotes];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(quote =>
        quote.quoteNumber.toLowerCase().includes(term) ||
        this.getClientName(quote.clientId).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(quote => quote.status === this.statusFilter);
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(quote => new Date(quote.createdAt) >= fromDate);
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(quote => new Date(quote.createdAt) <= toDate);
    }

    this.filteredQuotes = filtered;
  }

  getClientName(clientId: string): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'expired': return 'status-rejected';
      default: return 'status-pending';
    }
  }
}