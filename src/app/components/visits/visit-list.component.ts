import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-visit-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  // template: `
  //   <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div class="animate-pulse flex flex-col items-center">
  //       <div
  //         class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
  //       ></div>
  //       <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
  //     </div>
  //   </div>

  //   <div *ngIf="!isLoading">
  //     <div class="space-y-6">
  //       <div class="md:flex md:items-center md:justify-between">
  //         <div class="flex-1 min-w-0">
  //           <h2
  //             class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
  //           >
  //             Visits
  //           </h2>
  //         </div>
  //         <div class="mt-4 flex md:mt-0 md:ml-4">
  //           <button routerLink="/visits/new" class="btn-primary">
  //             Nouvelle déclaration / visite
  //           </button>
  //         </div>
  //       </div>

  //       <!-- Search and Filter -->
  //       <div class="card">
  //         <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
  //           <div>
  //             <label class="form-label">Recherche</label>
  //             <input
  //               type="text"
  //               [(ngModel)]="searchTerm"
  //               (input)="filterVisits()"
  //               class="form-input"
  //               placeholder="Search by client or vehicle"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">Statut</label>
  //             <select
  //               [(ngModel)]="statusFilter"
  //               (change)="filterVisits()"
  //               class="form-input"
  //             >
  //               <option value="">Tous les statuts</option>
  //               <option value="Pending">En attente</option>
  //               <option value="InProgress">En cours</option>
  //               <option value="Completed">Complété</option>
  //               <option value="Cancelled">Annulé</option>
  //             </select>
  //           </div>
  //           <div>
  //             <label class="form-label">À partir de la date</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="fromDate"
  //               (change)="filterVisits()"
  //               class="form-input"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">À ce jour</label>
  //             <input
  //               type="date"
  //               [(ngModel)]="toDate"
  //               (change)="filterVisits()"
  //               class="form-input"
  //             />
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Visits Table -->
  //       <div class="card">
  //         <div class="overflow-x-auto">
  //           <table class="min-w-full divide-y divide-gray-200">
  //             <thead class="bg-gray-50">
  //               <tr>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Date de la visite
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Client
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Véhicule
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Problèmes
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Statut
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
  //                 *ngFor="let visit of filteredVisits"
  //                 class="hover:bg-gray-50"
  //               >
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     {{ visit.visitDate | firestoreDate | date : 'short' }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getClientName(visit.clientId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm text-gray-900">
  //                     {{ getVehicleInfo(visit.vehicleId) }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4">
  //                   <div class="text-sm text-gray-900">
  //                     {{ visit.reportedIssues.slice(0, 2).join(', ') }}
  //                     <span
  //                       *ngIf="visit.reportedIssues.length > 2"
  //                       class="text-gray-500"
  //                     >
  //                       +{{ visit.reportedIssues.length - 2 }} autres
  //                     </span>
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="status-badge"
  //                     [ngClass]="getStatusClass(visit.status)"
  //                   >
  //                     {{ visit.status }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                   <button
  //                     [routerLink]="['/visits', visit.id]"
  //                     class="text-primary-600 hover:text-primary-900 mr-3"
  //                   >
  //                     Voir
  //                   </button>
  //                   @if(visit.status !== 'Completed'){
  //                   <button
  //                     [routerLink]="['/visits', visit.id, 'edit']"
  //                     class="text-secondary-600 hover:text-secondary-900 mr-3"
  //                   >
  //                     Modifier
  //                   </button>
  //                   }

  //                   <button
  //                     (click)="downloadDocuments(visit)"
  //                     class="text-accent-600 hover:text-accent-900 mr-3"
  //                     *ngIf="hasDocuments(visit)"
  //                     title="Download client documents"
  //                   >
  //                     📄 Documents
  //                   </button>
  //                   <button
  //                     [routerLink]="['/diagnostics/create', visit.id]"
  //                     class="text-accent-600 hover:text-accent-900 mr-3"
  //                     *ngIf="visit.status === 'InProgress'"
  //                   >
  //                     Diagnostiquer
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
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
        ></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="p-2 sm:p-4">
      <div class="space-y-4 md:space-y-6">
        <!-- Header Section -->
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
              Visites
            </h2>
          </div>
          <div class="flex justify-end">
            <button
              routerLink="/visits/new"
              class="btn-primary w-full sm:w-auto"
            >
              Nouvelle visite
            </button>
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
                (input)="filterVisits()"
                class="form-input text-xs sm:text-sm"
                placeholder="Client ou véhicule"
              />
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">Statut</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterVisits()"
                class="form-input text-xs sm:text-sm"
              >
                <option value="">Tous</option>
                <option value="Pending">En attente</option>
                <option value="InProgress">En cours</option>
                <option value="Completed">Complété</option>
                <option value="Cancelled">Annulé</option>
              </select>
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">De</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (change)="filterVisits()"
                class="form-input text-xs sm:text-sm"
              />
            </div>
            <div>
              <label class="form-label text-xs sm:text-sm">À</label>
              <input
                type="date"
                [(ngModel)]="toDate"
                (change)="filterVisits()"
                class="form-input text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>

        <!-- Visits Table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
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
                    Problèmes
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
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
                  *ngFor="let visit of filteredVisits"
                  class="hover:bg-gray-50"
                >
                  <!-- Mobile View -->
                  <td class="px-3 py-3 sm:px-4 block sm:table-cell">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">
                        {{ visit.visitDate | firestoreDate | date : 'short' }}
                      </div>
                      <div class="sm:hidden text-xs text-gray-500 mt-1">
                        <div>Client: {{ getClientName(visit.clientId) }}</div>
                        <div>
                          Véhicule: {{ getVehicleInfo(visit.vehicleId) }}
                        </div>
                        <div class="mt-1">
                          <span
                            class="status-badge text-xs"
                            [ngClass]="getStatusClass(visit.status)"
                          >
                            {{ visit.status }}
                          </span>
                        </div>
                        <div class="text-xs mt-1">
                          Problèmes:
                          {{ visit.reportedIssues.slice(0, 2).join(', ') }}
                          <span
                            *ngIf="visit.reportedIssues.length > 2"
                            class="text-gray-500"
                          >
                            +{{ visit.reportedIssues.length - 2 }} autres
                          </span>
                        </div>
                      </div>
                      <div class="sm:hidden flex flex-wrap gap-2 mt-2">
                        <button
                          [routerLink]="['/visits', visit.id]"
                          class="text-primary-600 hover:text-primary-900 text-xs"
                        >
                          Voir
                        </button>
                        @if(visit.status !== 'Completed'){
                        <button
                          [routerLink]="['/visits', visit.id, 'edit']"
                          class="text-secondary-600 hover:text-secondary-900 text-xs"
                        >
                          Modifier
                        </button>
                        } @if(hasDocuments(visit)){
                        <button
                          (click)="downloadDocuments(visit)"
                          class="text-accent-600 hover:text-accent-900 text-xs"
                        >
                          📄 Docs
                        </button>
                        } @if(visit.status === 'InProgress'){
                        <button
                          [routerLink]="['/diagnostics/create', visit.id]"
                          class="text-accent-600 hover:text-accent-900 text-xs"
                        >
                          Diag
                        </button>
                        }
                      </div>
                    </div>
                  </td>

                  <!-- Desktop View -->
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(visit.clientId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(visit.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 hidden sm:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ visit.reportedIssues.slice(0, 2).join(', ') }}
                      <span
                        *ngIf="visit.reportedIssues.length > 2"
                        class="text-gray-500"
                      >
                        +{{ visit.reportedIssues.length - 2 }} autres
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <span
                      class="status-badge text-xs sm:text-sm"
                      [ngClass]="getStatusClass(visit.status)"
                    >
                      {{ visit.status }}
                    </span>
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell"
                  >
                    <div class="flex flex-wrap gap-2">
                      <button
                        [routerLink]="['/visits', visit.id]"
                        class="text-primary-600 hover:text-primary-900"
                      >
                        Voir
                      </button>
                      @if(visit.status !== 'Completed'){
                      <button
                        [routerLink]="['/visits', visit.id, 'edit']"
                        class="text-secondary-600 hover:text-secondary-900"
                      >
                        Modifier
                      </button>
                      } @if(hasDocuments(visit)){
                      <button
                        (click)="downloadDocuments(visit)"
                        class="text-accent-600 hover:text-accent-900"
                        title="Documents client"
                      >
                        📄
                      </button>
                      } @if(visit.status === 'InProgress'){
                      <button
                        [routerLink]="['/diagnostics/create', visit.id]"
                        class="text-accent-600 hover:text-accent-900"
                      >
                        Diagnostiquer
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
export class VisitListComponent implements OnInit {
  visits: Visit[] = [];
  filteredVisits: Visit[] = [];
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
    if (this.authService.isClient) this.loadDataClient();
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
          [this.vehicles, this.visits] = await Promise.all([
            // Étape 1 : récupérer les véhicules du client
            await this.garageDataService.getWithFilter<Vehicle>('vehicles', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
            // Étape 1 : récupérer les devis du client
            await this.garageDataService.getWithFilter<Visit>('visits', [
              { field: 'clientId', operator: '==', value: client[0].id },
            ]),
          ]);

          this.clients.push(client[0]);
          this.filteredVisits = [...this.visits];
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
      [this.visits, this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Visit>('visits'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
      this.filteredVisits = [...this.visits];
    } catch (error) {
      this.notificationService.showError('Failed to load visits');
    } finally {
      this.isLoading = false;
    }
  }

  filterVisits(): void {
    let filtered = [...this.visits];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((visit) => {
        const client = this.getClientName(visit.clientId).toLowerCase();
        const vehicle = this.getVehicleInfo(visit.vehicleId).toLowerCase();
        return client.includes(term) || vehicle.includes(term);
      });
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter((visit) => visit.status === this.statusFilter);
    }

    // Date filters
    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (visit) => new Date(visit.visitDate) >= fromDate
      );
    }

    if (this.toDate) {
      const toDate = new Date(this.toDate);
      filtered = filtered.filter(
        (visit) => new Date(visit.visitDate) <= toDate
      );
    }

    this.filteredVisits = filtered;
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
      case 'inprogress':
        return 'status-accepted';
      case 'completed':
        return 'status-paid';
      case 'cancelled':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  hasDocuments(visit: Visit): boolean {
    return !!(visit.documents && visit.documents.length > 0);
  }

  async downloadDocuments(visit: Visit): Promise<void> {
    if (!visit.documents || visit.documents.length === 0) {
      this.notificationService.showWarning(
        'No documents available for this visit'
      );
      return;
    }

    try {
      // If single document, download directly
      if (visit.documents.length === 1) {
        const doc = visit.documents[0];
        this.downloadFile(doc.url, doc.name);
        this.notificationService.showSuccess(
          'Document downloaded successfully'
        );
        return;
      }

      // Multiple documents - show selection modal or download all
      const shouldDownloadAll = confirm(
        `This visit has ${visit.documents.length} documents. Download all?`
      );

      if (shouldDownloadAll) {
        for (const doc of visit.documents) {
          await this.downloadFile(doc.url, doc.name);
          // Small delay between downloads to avoid browser blocking
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
        this.notificationService.showSuccess(
          `${visit.documents.length} documents downloaded successfully`
        );
      }
    } catch (error) {
      this.notificationService.showError('Failed to download documents');
      console.error('Download error:', error);
    }
  }

  private downloadFile(url: string, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}