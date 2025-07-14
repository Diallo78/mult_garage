import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Invoice, Payment } from '../../models/invoice.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Payments
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
              (input)="filterPayments()"
              class="form-input"
              placeholder="Search by invoice or client"
            />
          </div>
          <div>
            <label class="form-label">Payment Method</label>
            <select
              [(ngModel)]="methodFilter"
              (change)="filterPayments()"
              class="form-input"
            >
              <option value="">All Methods</option>
              <option value="Cash">Cash</option>
              <option value="MobileMoney">Mobile Money</option>
              <option value="Cheque">Cheque</option>
              <option value="BankTransfer">Bank Transfer</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div>
            <label class="form-label">From Date</label>
            <input
              type="date"
              [(ngModel)]="fromDate"
              (change)="filterPayments()"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">To Date</label>
            <input
              type="date"
              [(ngModel)]="toDate"
              (change)="filterPayments()"
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
              <div class="text-sm font-medium text-gray-500">Total Payments</div>
              <div class="text-2xl font-bold text-gray-900">\${{ getTotalPayments().toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white">
                💳
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Cash Payments</div>
              <div class="text-2xl font-bold text-gray-900">\${{ getCashPayments().toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-purple-500 text-white">
                📱
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Mobile Money</div>
              <div class="text-2xl font-bold text-gray-900">\${{ getMobileMoneyPayments().toFixed(2) }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-center h-8 w-8 rounded-md bg-orange-500 text-white">
                📊
              </div>
            </div>
            <div class="ml-4">
              <div class="text-sm font-medium text-gray-500">Total Transactions</div>
              <div class="text-2xl font-bold text-gray-900">{{ getTotalTransactions() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="card">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let payment of filteredPayments" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">
                    {{ payment.date | firestoreDate | date:'short' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ payment.invoiceNumber }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ payment.clientName }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">\${{ payment.amount.toFixed(2) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="getMethodClass(payment.method)">
                    {{ payment.method }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ payment.reference || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    [routerLink]="['/invoices', payment.invoiceId]"
                    class="text-primary-600 hover:text-primary-900 mr-3"
                  >
                    View Invoice
                  </button>
                  <button
                    (click)="downloadReceipt(payment)"
                    class="text-secondary-600 hover:text-secondary-900"
                  >
                    Receipt
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PaymentListComponent implements OnInit {
  payments: any[] = [];
  filteredPayments: any[] = [];
  invoices: Invoice[] = [];
  clients: Client[] = [];
  searchTerm = '';
  methodFilter = '';
  fromDate = '';
  toDate = '';

  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      [this.invoices, this.clients] = await Promise.all([
        this.garageDataService.getAll<Invoice>('invoices'),
        this.garageDataService.getAll<Client>('clients')
      ]);

      this.extractPayments();
      this.filteredPayments = [...this.payments];
    } catch (error) {
      this.notificationService.showError('Failed to load payments');
    }
  }

  private extractPayments(): void {
    this.payments = [];

    this.invoices.forEach(invoice => {
      const client = this.clients.find(c => c.id === invoice.clientId);
      const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown';

      invoice.payments.forEach(payment => {
        this.payments.push({
          ...payment,
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          clientName
        });
      });
    });

    // Sort by date (newest first)
    this.payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  filterPayments(): void {
    let filtered = [...this.payments];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        payment.invoiceNumber.toLowerCase().includes(term) ||
        payment.clientName.toLowerCase().includes(term)
      );
    }

    if (this.methodFilter) {
      filtered = filtered.filter(payment => payment.method === this.methodFilter);
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(payment => new Date(payment.date) >= fromDate);
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(payment => new Date(payment.date) <= toDate);
    }

    this.filteredPayments = filtered;
  }

  getMethodClass(method: string): string {
    switch (method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'MobileMoney': return 'bg-purple-100 text-purple-800';
      case 'Cheque': return 'bg-blue-100 text-blue-800';
      case 'BankTransfer': return 'bg-indigo-100 text-indigo-800';
      case 'Card': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTotalPayments(): number {
    return this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getCashPayments(): number {
    return this.payments
      .filter(payment => payment.method === 'Cash')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getMobileMoneyPayments(): number {
    return this.payments
      .filter(payment => payment.method === 'MobileMoney')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getTotalTransactions(): number {
    return this.payments.length;
  }

  downloadReceipt(payment: any): void {
    // Implementation for downloading receipt
    this.notificationService.showSuccess('Receipt download feature coming soon');
  }
}