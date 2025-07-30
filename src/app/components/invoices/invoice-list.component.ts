import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Invoice } from '../../models/invoice.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  // template: `
  //   <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div
  //       class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
  //     ></div>
  //   </div>

  //   <div *ngIf="!isLoading">
  //     <div class="space-y-6">
  //       <div class="md:flex md:items-center md:justify-between">
  //         <div class="flex-1 min-w-0">
  //           <h2
  //             class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
  //           >
  //             Invoices
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
  //               (input)="filterInvoices()"
  //               class="form-input"
  //               placeholder="Search by invoice number or client"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">Status</label>
  //             <select
  //               [(ngModel)]="statusFilter"
  //               (change)="filterInvoices()"
  //               class="form-input"
  //             >
  //               <option value="">All Statuses</option>
  //               <option value="Unpaid">Unpaid</option>
  //               <option value="Partial">Partial</option>
  //               <option value="Paid">Paid</option>
  //               <option value="Overdue">Overdue</option>
  //             </select>
  //           </div>
  //           <div>
  //             <label class="form-label">From Date</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="fromDate"
  //               (change)="filterInvoices()"
  //               class="form-input"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">To Date</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="toDate"
  //               (change)="filterInvoices()"
  //               class="form-input"
  //             />
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Summary Cards -->
  //       <div
  //         *ngIf="this.authService.canBtnAccessInov"
  //         class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
  //       >
  //         <div class="card">
  //           <div class="flex items-center">
  //             <div class="flex-shrink-0">
  //               <div
  //                 class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white"
  //               >
  //                 💰
  //               </div>
  //             </div>
  //             <div class="ml-4">
  //               <div class="text-sm font-medium text-gray-500">
  //                 Total Revenue
  //               </div>
  //               <div class="text-2xl font-bold text-gray-900">
  //                 \${{ getTotalRevenue().toFixed(2) }}
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="card">
  //           <div class="flex items-center">
  //             <div class="flex-shrink-0">
  //               <div
  //                 class="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white"
  //               >
  //                 📋
  //               </div>
  //             </div>
  //             <div class="ml-4">
  //               <div class="text-sm font-medium text-gray-500">Outstanding</div>
  //               <div class="text-2xl font-bold text-gray-900">
  //                 \${{ getOutstandingAmount().toFixed(2) }}
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="card">
  //           <div class="flex items-center">
  //             <div class="flex-shrink-0">
  //               <div
  //                 class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white"
  //               >
  //                 📊
  //               </div>
  //             </div>
  //             <div class="ml-4">
  //               <div class="text-sm font-medium text-gray-500">
  //                 Paid Invoices
  //               </div>
  //               <div class="text-2xl font-bold text-gray-900">
  //                 {{ getPaidInvoicesCount() }}
  //               </div>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="card">
  //           <div class="flex items-center">
  //             <div class="flex-shrink-0">
  //               <div
  //                 class="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white"
  //               >
  //                 ⏰
  //               </div>
  //             </div>
  //             <div class="ml-4">
  //               <div class="text-sm font-medium text-gray-500">Overdue</div>
  //               <div class="text-2xl font-bold text-gray-900">
  //                 {{ getOverdueInvoicesCount() }}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Invoices Table -->
  //       <div class="card">
  //         <div class="overflow-x-auto">
  //           <table class="min-w-full divide-y divide-gray-200">
  //             <thead class="bg-gray-50">
  //               <tr>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Invoice #
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
  //                   Total Amount
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Amount Due
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Status
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Due Date
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
  //                 *ngFor="let invoice of filteredInvoices"
  //                 class="hover:bg-gray-50"
  //               >
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     {{ invoice.invoiceNumber }}
  //                   </div>
  //                   <div class="text-sm text-gray-500">
  //                     {{ invoice.createdAt | firestoreDate | date : 'short' }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getClientName(invoice.clientId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getVehicleInfo(invoice.vehicleId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     \${{ invoice.totalAmount.toFixed(2) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     \${{ invoice.amountDue.toFixed(2) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="status-badge"
  //                     [ngClass]="getStatusClass(invoice.status)"
  //                   >
  //                     {{ invoice.status }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                   {{ invoice.dueDate | firestoreDate | date : 'short' }}
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                   <button
  //                     [routerLink]="['/invoices', invoice.id]"
  //                     class="text-primary-600 hover:text-primary-900 mr-3"
  //                   >
  //                     View
  //                   </button>
  //                   <button
  //                     [routerLink]="['/payments/create', invoice.id]"
  //                     class="text-secondary-600 hover:text-secondary-900"
  //                     *ngIf="invoice.status !== 'Paid'"
  //                   >
  //                     Add Payment
  //                   </button>
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
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
      ></div>
    </div>

    <div *ngIf="!isLoading" class="p-3 sm:p-4">
      <div class="space-y-4 md:space-y-6">
        <!-- Header Section -->
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
              Factures
            </h2>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card p-3 sm:p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div class="sm:col-span-2 lg:col-span-1">
              <label class="form-label text-xs sm:text-sm">Recherche</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterInvoices()"
                class="form-input text-xs sm:text-sm"
                placeholder="N° facture ou client"
              />
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">Statut</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterInvoices()"
                class="form-input text-xs sm:text-sm"
              >
                <option value="">Tous</option>
                <option value="Unpaid">Impayée</option>
                <option value="Partial">Partielle</option>
                <option value="Paid">Payée</option>
                <option value="Overdue">En retard</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">De</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (change)="filterInvoices()"
                class="form-input text-xs sm:text-sm"
              />
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">À</label>
              <input
                type="date"
                [(ngModel)]="toDate"
                (change)="filterInvoices()"
                class="form-input text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div
          *ngIf="this.authService.canBtnAccessInov"
          class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          <div class="card p-3">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-green-500 text-white text-sm"
                >
                  💰
                </div>
              </div>
              <div class="ml-3">
                <div class="text-xs sm:text-sm font-medium text-gray-500">
                  Chiffre d'affaires
                </div>
                <div class="text-lg sm:text-xl font-bold text-gray-900">
                  \${{ getTotalRevenue().toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <div class="card p-3">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-red-500 text-white text-sm"
                >
                  📋
                </div>
              </div>
              <div class="ml-3">
                <div class="text-xs sm:text-sm font-medium text-gray-500">
                  Impayées
                </div>
                <div class="text-lg sm:text-xl font-bold text-gray-900">
                  \${{ getOutstandingAmount().toFixed(2) }}
                </div>
              </div>
            </div>
          </div>

          <div class="card p-3">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-blue-500 text-white text-sm"
                >
                  📊
                </div>
              </div>
              <div class="ml-3">
                <div class="text-xs sm:text-sm font-medium text-gray-500">
                  Factures payées
                </div>
                <div class="text-lg sm:text-xl font-bold text-gray-900">
                  {{ getPaidInvoicesCount() }}
                </div>
              </div>
            </div>
          </div>

          <div class="card p-3">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <div
                  class="flex items-center justify-center h-8 w-8 rounded-md bg-yellow-500 text-white text-sm"
                >
                  ⏰
                </div>
              </div>
              <div class="ml-3">
                <div class="text-xs sm:text-sm font-medium text-gray-500">
                  En retard
                </div>
                <div class="text-lg sm:text-xl font-bold text-gray-900">
                  {{ getOverdueInvoicesCount() }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoices Table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Facture #
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Véhicule
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Dû
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell"
                  >
                    Échéance
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  *ngFor="let invoice of filteredInvoices"
                  class="hover:bg-gray-50"
                >
                  <!-- Mobile View -->
                  <td class="px-3 py-3 sm:px-4 block sm:table-cell">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">
                        {{ invoice.invoiceNumber }}
                      </div>
                      <div class="sm:hidden text-xs text-gray-500 mt-1">
                        <div>Client: {{ getClientName(invoice.clientId) }}</div>
                        <div>
                          Véhicule: {{ getVehicleInfo(invoice.vehicleId) }}
                        </div>
                        <div class="grid grid-cols-2 gap-2 mt-1">
                          <div>
                            <div class="text-xs text-gray-500">Total</div>
                            <div class="text-xs font-medium text-gray-900">
                              \${{ invoice.totalAmount.toFixed(2) }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500">Dû</div>
                            <div class="text-xs font-medium text-gray-900">
                              \${{ invoice.amountDue.toFixed(2) }}
                            </div>
                          </div>
                        </div>
                        <div class="mt-1">
                          <span
                            class="status-badge text-xs"
                            [ngClass]="getStatusClass(invoice.status)"
                          >
                            {{ invoice.status }}
                          </span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">
                          Échéance:
                          {{ invoice.dueDate | firestoreDate | date : 'short' }}
                        </div>
                      </div>
                      <div class="sm:hidden flex flex-wrap gap-2 mt-2">
                        <button
                          [routerLink]="['/invoices', invoice.id]"
                          class="text-primary-600 hover:text-primary-900 text-xs"
                        >
                          Voir
                        </button>
                        <button
                          *ngIf="invoice.status !== 'Paid'"
                          [routerLink]="['/payments/create', invoice.id]"
                          class="text-secondary-600 hover:text-secondary-900 text-xs"
                        >
                          Paiement
                        </button>
                      </div>
                    </div>
                  </td>

                  <!-- Desktop View -->
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(invoice.clientId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(invoice.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm font-medium text-gray-900">
                      \${{ invoice.totalAmount.toFixed(2) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden lg:table-cell">
                    <div class="text-sm font-medium text-gray-900">
                      \${{ invoice.amountDue.toFixed(2) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      class="status-badge text-xs sm:text-sm"
                      [ngClass]="getStatusClass(invoice.status)"
                    >
                      {{ invoice.status }}
                    </span>
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell"
                  >
                    {{ invoice.dueDate | firestoreDate | date : 'short' }}
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell"
                  >
                    <div class="flex flex-wrap gap-2">
                      <button
                        [routerLink]="['/invoices', invoice.id]"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        Voir
                      </button>
                      <button
                        *ngIf="invoice.status !== 'Paid'"
                        [routerLink]="['/payments/create', invoice.id]"
                        class="text-secondary-600 hover:text-secondary-900"
                      >
                        Paiement
                      </button>
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
    private notificationService: NotificationService,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.isClient) await this.loadDataClient();
    else await this.loadDataGarage();
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
          [this.vehicles, this.invoices] = await Promise.all([
            // Étape 1 : récupérer les véhicules du client
            await this.garageDataService.getWithFilter<Vehicle>('vehicles', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
            // Étape 1 : récupérer les devis du client
            await this.garageDataService.getWithFilter<Invoice>('invoices', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
          ]);

          this.clients.push(client[0]);
          this.filteredInvoices = [...this.invoices];
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
      [this.invoices, this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Invoice>('invoices'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
      this.filteredInvoices = [...this.invoices];
    } catch (error) {
      this.notificationService.showError('Failed to load invoices');
    } finally {
      this.isLoading = false;
    }
  }

  filterInvoices(): void {
    let filtered = [...this.invoices];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(term) ||
          this.getClientName(invoice.clientId).toLowerCase().includes(term)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(
        (invoice) => invoice.status === this.statusFilter
      );
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (invoice) => new Date(invoice.createdAt) >= fromDate
      );
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(
        (invoice) => new Date(invoice.createdAt) <= toDate
      );
    }

    this.filteredInvoices = filtered;
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
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'partial':
        return 'status-partial';
      case 'overdue':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  getTotalRevenue(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
  }

  getOutstandingAmount(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.amountDue, 0);
  }

  getPaidInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === 'Paid').length;
  }

  getOverdueInvoicesCount(): number {
    return this.invoices.filter((invoice) => invoice.status === 'Overdue')
      .length;
  }
}