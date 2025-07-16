import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { User } from '../../models/user.model';
import { Client, Vehicle } from '../../models/client.model';
import { Quote } from '../../models/quote.model';

import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-client-quotes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <button routerLink="/client/dashboard" class="mr-4 text-gray-600 hover:text-gray-900">
                ← Back to Dashboard
              </button>
              <h1 class="text-xl font-semibold text-gray-900">My Quotes</h1>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="space-y-6">
          <!-- Quotes List -->
          <div class="card">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quote #
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr *ngFor="let quote of quotes" class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{{ quote.quoteNumber }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ getVehicleInfo(quote.vehicleId) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{{ quote.createdAt | date:'short' }}</div>
                      <div class="text-sm text-gray-500">Valid until: {{ quote.validUntil | date:'short' }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">\${{ quote.total.toFixed(2) }}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="status-badge" [ngClass]="getStatusClass(quote.status)">
                        {{ quote.status }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        (click)="viewQuote(quote)"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      <button
                        (click)="downloadQuote(quote)"
                        class="text-secondary-600 hover:text-secondary-900"
                      >
                        Download
                      </button>
                      <button
                        (click)="approveQuote(quote)"
                        class="text-green-600 hover:text-green-900"
                        *ngIf="quote.status === 'Pending'"
                      >
                        Approve
                      </button>
                      <button
                        (click)="rejectQuote(quote)"
                        class="text-red-600 hover:text-red-900"
                        *ngIf="quote.status === 'Pending'"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="quotes.length === 0" class="text-center py-8 text-gray-500">
              No quotes available
            </div>
          </div>
        </div>
      </div>

      <!-- Quote Detail Modal -->
      <div *ngIf="selectedQuote" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div class="mt-3">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-medium text-gray-900">Quote {{ selectedQuote.quoteNumber }}</h3>
              <button (click)="closeModal()" class="text-gray-400 hover:text-gray-600">
                <span class="text-2xl">&times;</span>
              </button>
            </div>

            <!-- Quote Items -->
            <div class="mb-6">
              <h4 class="text-md font-medium text-gray-900 mb-3">Items</h4>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let item of selectedQuote.items">
                      <td class="px-4 py-2 text-sm text-gray-900">{{ item.designation }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900">{{ item.quantity }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900">\${{ item.unitPrice.toFixed(2) }}</td>
                      <td class="px-4 py-2 text-sm text-gray-900">\${{ item.subtotal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Quote Totals -->
            <div class="border-t pt-4 mb-6">
              <div class="flex justify-end">
                <div class="w-64 space-y-2">
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">Subtotal:</span>
                    <span class="text-sm font-medium">\${{ selectedQuote.subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-sm text-gray-600">VAT ({{ selectedQuote.vatRate }}%):</span>
                    <span class="text-sm font-medium">\${{ selectedQuote.vatAmount.toFixed(2) }}</span>
                  </div>
                  <div class="border-t pt-2">
                    <div class="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>\${{ selectedQuote.total.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex justify-end space-x-3" *ngIf="selectedQuote.status === 'Pending'">
              <button (click)="rejectQuote(selectedQuote)" class="btn-outline text-red-600 border-red-300 hover:bg-red-50">
                Reject
              </button>
              <button (click)="approveQuote(selectedQuote)" class="btn-primary">
                Approve Quote
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ClientQuotesComponent implements OnInit {
  currentUser: User | null = null;
  client: Client | null = null;
  quotes: Quote[] = [];
  vehicles: Vehicle[] = [];
  selectedQuote: Quote | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly pdfService: PDFService,
    private readonly userManagementService: UserManagementService
  ) {}

  ngOnInit(){

    (async() => {
        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            if (user) {
              this.loadClientData();
            }
          });
    })()

  }

  private async loadClientData(): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Utiliser le service de gestion des utilisateurs
      this.client = await this.userManagementService.getClientByUserId(this.currentUser.uid);

      if (this.client) {
        await this.loadQuotes();
      }
    } catch (error) {
      this.notificationService.showError('Échec de chargement des données client');
    }
  }

  private async loadQuotes(): Promise<void> {
    if (!this.client) return;

    try {
      [this.quotes, this.vehicles] = await Promise.all([
        this.garageDataService.getWithFilter<Quote>('quotes', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ]),
        this.garageDataService.getWithFilter<Vehicle>('vehicles', [
          { field: 'clientId', operator: '==', value: this.client.id }
        ])
      ]);
    } catch (error) {
      this.notificationService.showError('Failed to load quotes');
    }
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Unknown Vehicle';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  viewQuote(quote: Quote): void {
    this.selectedQuote = quote;
  }

  closeModal(): void {
    this.selectedQuote = null;
  }

  async downloadQuote(quote: Quote): Promise<void> {
    if (!this.client) return;

    try {
      const vehicle = this.vehicles.find(v => v.id === quote.vehicleId);
      const clientName = `${this.client.firstName} ${this.client.lastName}`;
      const vehicleInfo = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : 'Unknown Vehicle';

      await this.pdfService.generateQuotePDF(quote, clientName, vehicleInfo);
      this.notificationService.showSuccess('Quote downloaded successfully');
    } catch (error) {
      this.notificationService.showError('Failed to download quote');
    }
  }

  async approveQuote(quote: Quote): Promise<void> {
    try {
      await this.garageDataService.update('quotes', quote.id, {
        status: 'Accepted',
        clientSignature: `${this.client?.firstName} ${this.client?.lastName} - ${new Date().toISOString()}`
      });

      quote.status = 'Accepted';
      this.selectedQuote = null;
      this.notificationService.showSuccess('Quote approved successfully');
    } catch (error) {
      this.notificationService.showError('Failed to approve quote');
    }
  }

  async rejectQuote(quote: Quote): Promise<void> {
    if (confirm('Are you sure you want to reject this quote?')) {
      try {
        await this.garageDataService.update('quotes', quote.id, { status: 'Rejected' });
        quote.status = 'Rejected';
        this.selectedQuote = null;
        this.notificationService.showSuccess('Quote rejected');
      } catch (error) {
        this.notificationService.showError('Failed to reject quote');
      }
    }
  }
}