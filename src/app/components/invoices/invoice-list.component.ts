import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Invoice } from '../../models/invoice.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-invoice-list',
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
            Invoices
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
              (input)="filterInvoices()"
              class="form-input"
              placeholder="Search by invoice number or client"
            />
          </div>
          <div>
            <label class="form-label">Status</label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterInvoices()"
              class="form-input"
            >
              <option value="">All Statuses</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
          <div>
            <label class="form-label">From Date</label>
            <input
              type="date"
              [(ngModel)]="fromDate"
              (change)="filterInvoices()"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">To Date</label>
            <input
              type="date"
              [(ngModel)]="toDate"
              (change)="filterInvoices()"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white">
                💰
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Total Revenue</div>
              <div class="text-2xl font-bold text-gray-900">\${{ getTotalRevenue().toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white">
                📋
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Outstanding</div>
              <div class="text-2xl font-bold text-gray-900">\${{ getOutstandingAmount().toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                📊
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Paid Invoices</div>
              <div class="text-2xl font-bold text-gray-900">{{ getPaidInvoicesCount() }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white">
                ⏰
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Overdue</div>
              <div class="text-2xl font-bold text-gray-900">{{ getOverdueInvoicesCount() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Due
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let invoice of filteredInvoices" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ invoice.invoiceNumber }}</div>
                  <div class="text-sm text-gray-500">{{ invoice.createdAt | firestoreDate | date:'short' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getClientName(invoice.clientId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ getVehicleInfo(invoice.vehicleId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">\${{ invoice.totalAmount.toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">\${{ invoice.amountDue.toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ invoice.dueDate | firestoreDate | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    [routerLink]="['/invoices', invoice.id]"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View
                  </button>
                  <button
                    [routerLink]="['/payments/create', invoice.id]"
                    class="text-secondary-600 hover:text-secondary-900"
                    *ngIf="invoice.status !== 'Paid'"
                  >
                    Add Payment
                  </button>
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
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  searchTerm = '';
  statusFilter = '';
  fromDate = '';
  toDate = '';
  isLoading = true;

  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      [this.invoices, this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Invoice>('invoices'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles')
      ]);
      this.filteredInvoices = [...this.invoices];
    } catch (error) {
      this.notificationService.showError('Failed to load invoices');
    }finally{this.isLoading = false}
  }

  filterInvoices(): void {
    let filtered = [...this.invoices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        this.getClientName(invoice.clientId).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === this.statusFilter);
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) >= fromDate);
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(invoice => new Date(invoice.createdAt) <= toDate);
    }

    this.filteredInvoices = filtered;
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
      case 'paid': return 'status-paid';
      case 'unpaid': return 'status-unpaid';
      case 'partial': return 'status-partial';
      case 'overdue': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  getTotalRevenue(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  }

  getOutstandingAmount(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  }

  getPaidInvoicesCount(): number {
    return this.invoices.filter(invoice => invoice.status === 'Paid').length;
  }

  getOverdueInvoicesCount(): number {
    return this.invoices.filter(invoice => invoice.status === 'Overdue').length;
  }
}