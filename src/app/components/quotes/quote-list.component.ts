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


@Component({
  selector: 'app-quote-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  // template: `
  //   <!-- <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  //   </div> -->
  //   <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div class="animate-pulse flex flex-col items-center">
  //       <div
  //         class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
  //       ></div>
  //       <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
  //     </div>
  //   </div>

  //   <div
  //     *ngIf="!isLoading"
  //     class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
  //   >
  //     <div class="space-y-6">
  //       <div class="md:flex md:items-center md:justify-between">
  //         <div class="flex-1 min-w-0">
  //           <h2
  //             class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
  //           >
  //             Quotes
  //           </h2>
  //         </div>
  //       </div>

  //       <!-- Search and Filter -->
  //       <div class="card">
  //         <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  //           <div>
  //             <label class="form-label">Search</label>
  //             <input
  //               type="text"
  //               [(ngModel)]="searchTerm"
  //               (input)="filterQuotes()"
  //               class="form-input"
  //               placeholder="Search by quote number or client"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">Status</label>
  //             <select
  //               [(ngModel)]="statusFilter"
  //               (change)="filterQuotes()"
  //               class="form-input"
  //             >
  //               <option value="">All Statuses</option>
  //               <option value="Pending">Pending</option>
  //               <option value="Accepted">Accepted</option>
  //               <option value="Rejected">Rejected</option>
  //               <option value="Expired">Expired</option>
  //             </select>
  //           </div>
  //           <div>
  //             <label class="form-label">From Date</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="fromDate"
  //               (change)="filterQuotes()"
  //               class="form-input"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">To Date</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="toDate"
  //               (change)="filterQuotes()"
  //               class="form-input"
  //             />
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Quotes Table -->
  //       <div class="card">
  //         <div class="overflow-x-auto">
  //           <table class="min-w-full divide-y divide-gray-200">
  //             <thead class="bg-gray-50">
  //               <tr>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Quote #
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Client
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Vehicle
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Total
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Status
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Valid Until
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody class="bg-white divide-y divide-gray-200">
  //               <tr
  //                 *ngFor="let quote of filteredQuotes"
  //                 class="hover:bg-gray-50"
  //               >
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     {{ quote.quoteNumber }}
  //                   </div>
  //                   <div class="text-sm text-gray-500">
  //                     {{ quote.createdAt | firestoreDate | date : 'short' }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getClientName(quote.clientId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getVehicleInfo(quote.vehicleId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     \${{ quote.total.toFixed(2) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="status-badge"
  //                     [ngClass]="getStatusClass(quote.status)"
  //                   >
  //                     {{ quote.status }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                   {{ quote.validUntil | firestoreDate | date : 'short' }}
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                   <button
  //                     [routerLink]="['/quotes', quote.id]"
  //                     class="text-primary-600 hover:text-primary-900 mr-3"
  //                   >
  //                     View
  //                   </button>
  //                   @if(this.authService.canBtnAccessInterventions &&
  //                   quote.status === 'Accepted'){
  //                   <button
  //                     [routerLink]="['/interventions/create', quote.id]"
  //                     class="text-secondary-600 hover:text-secondary-900"
  //                   >
  //                     Start Work
  //                   </button>
  //                   }
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // `,
  template: `
    <!-- Loading State -->
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
      <div class="space-y-4 md:space-y-6 p-2 sm:p-4">
        <!-- Header -->
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-2"
        >
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
              Quotes
            </h2>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card p-3 sm:p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="col-span-1 sm:col-span-2 lg:col-span-1">
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
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quote #
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Vehicle
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell"
                  >
                    Valid Until
                  </th>
                  <th
                    class="px-3 py-3 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                  <!-- Mobile View -->
                  <td class="px-3 py-4 sm:px-4 block sm:table-cell">
                    <div class="flex items-start">
                      <div class="flex-1">
                        <div class="text-sm font-medium text-gray-900">
                          {{ quote.quoteNumber }}
                        </div>
                        <div class="text-xs text-gray-500 sm:hidden">
                          {{ quote.createdAt | firestoreDate | date : 'short' }}
                        </div>
                        <div class="sm:hidden mt-1">
                          <div class="text-xs text-gray-900">
                            Client: {{ getClientName(quote.clientId) }}
                          </div>
                          <div class="text-xs text-gray-900 mt-1">
                            Vehicle: {{ getVehicleInfo(quote.vehicleId) }}
                          </div>
                          <div class="flex items-center mt-1">
                            <span
                              class="status-badge text-xs"
                              [ngClass]="getStatusClass(quote.status)"
                            >
                              {{ quote.status }}
                            </span>
                            <span class="text-xs font-medium ml-2">
                              \${{ quote.total.toFixed(2) }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            Valid:
                            {{
                              quote.validUntil | firestoreDate | date : 'short'
                            }}
                          </div>
                        </div>
                      </div>
                      <div class="sm:hidden ml-auto flex flex-col space-y-2">
                        <button
                          [routerLink]="['/quotes', quote.id]"
                          class="text-primary-600 hover:text-primary-900 text-xs"
                        >
                          View
                        </button>
                        @if(this.authService.canBtnAccessInterventions &&
                        quote.status === 'Accepted'){
                        <button
                          [routerLink]="['/interventions/create', quote.id]"
                          class="text-secondary-600 hover:text-secondary-900 text-xs"
                        >
                          Start Work
                        </button>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Desktop View -->
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm font-medium text-gray-900">
                      {{ quote.quoteNumber }}
                    </div>
                    <div class="text-xs text-gray-500">
                      {{ quote.createdAt | firestoreDate | date : 'short' }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(quote.clientId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(quote.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm font-medium text-gray-900">
                      \${{ quote.total.toFixed(2) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      class="status-badge text-xs sm:text-sm"
                      [ngClass]="getStatusClass(quote.status)"
                    >
                      {{ quote.status }}
                    </span>
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell"
                  >
                    {{ quote.validUntil | firestoreDate | date : 'short' }}
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell"
                  >
                    <div class="flex flex-wrap gap-2">
                      <button
                        [routerLink]="['/quotes', quote.id]"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        View
                      </button>
                      @if(this.authService.canBtnAccessInterventions &&
                      quote.status === 'Accepted'){
                      <button
                        [routerLink]="['/interventions/create', quote.id]"
                        class="text-secondary-600 hover:text-secondary-900"
                      >
                        Start Work
                      </button>
                      }
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
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

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    public authService: AuthService
  ) {}

  ngOnInit() {
   (async() => {
     if (this.authService.isClient) await this.loadDataClient();
     else await this.loadDataGarage();
   })()
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
            // Étape 1 : récupérer les devis du client
            await this.garageDataService.getWithFilter<Quote>('quotes', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
          ]);

          this.clients.push(client[0]);
          this.filteredQuotes = [...this.quotes];
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load quotes');
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
      this.filteredQuotes = [...this.quotes];
    } catch (error) {
      this.notificationService.showError('Failed to load quotes');
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
}