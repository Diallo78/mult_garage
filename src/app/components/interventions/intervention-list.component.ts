import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Intervention } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-intervention-list',
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
              Interventions
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
                (input)="filterInterventions()"
                class="form-input"
                placeholder="Search by client or vehicle"
              />
            </div>
            <div>
              <label class="form-label">Statut</label>
              <select
                [(ngModel)]="statusFilter"
                (change)="filterInterventions()"
                class="form-input"
              >
                <option value="">Tous les statuts</option>
                <option value="Scheduled">Programmé</option>
                <option value="InProgress">En cours</option>
                <option value="Completed">Terminé</option>
                <option value="OnHold">En attente</option>
              </select>
            </div>
            <div>
              <label class="form-label">Technicien</label>
              <select
                [(ngModel)]="technicianFilter"
                (change)="filterInterventions()"
                class="form-input"
              >
                <option value="">Tous les techniciens</option>
                <!-- Add technician options here -->
              </select>
            </div>
            <div>
              <label class="form-label">Date de début</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (change)="filterInterventions()"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Interventions Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date de début
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vehicle
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Durée estimée
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Progression
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
                  *ngFor="let intervention of paginatedInterventions"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{
                        intervention.startDate
                          | firestoreDate
                          | date : 'dd/MM/yyyy'
                      }}
                    </div>
                    <div
                      class="text-sm text-gray-500"
                      *ngIf="intervention.endDate"
                    >
                      Fin:
                      {{
                        intervention.endDate
                          | firestoreDate
                          | date : 'dd/MM/yyyy HH:mm'
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(intervention.quoteId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(intervention.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{
                        intervention.actualDuration ||
                          intervention.estimatedDuration
                      }}h
                    </div>
                    <!-- <div class="text-sm text-gray-500">
                    Est: {{ intervention.estimatedDuration }}h
                  </div> -->
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="status-badge"
                      [ngClass]="getStatusClass(intervention.status)"
                    >
                      {{ intervention.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-primary-600 h-2 rounded-full"
                        [style.width.%]="getProgress(intervention)"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ getCompletedTasks(intervention) }}/{{
                        intervention.tasks.length
                      }}
                      tâches
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      [routerLink]="['/interventions', intervention.id]"
                      class="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Voir
                    </button>
                    <button
                      [routerLink]="['/invoices/create', intervention.id]"
                      class="text-secondary-600 hover:text-secondary-900"
                      *ngIf="intervention.status === 'Completed'"
                    >
                      Créer facture
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="flex justify-between items-center mt-4">
              <div>Page {{ currentPage }} sur {{ totalPages }}</div>

              <div class="space-x-2">
                <button
                  class="btn  px-4 py-2 bg-blue-500 text-white rounded"
                  [disabled]="currentPage === 1"
                  (click)="currentPage = currentPage - 1"
                >
                  Précédent
                </button>

                <button
                  class="btn px-4 py-2 bg-blue-500 text-white rounded"
                  [disabled]="currentPage === totalPages"
                  (click)="currentPage = currentPage + 1"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InterventionListComponent implements OnInit {
  interventions: Intervention[] = [];
  filteredInterventions: Intervention[] = [];
  quotes: Quote[] = [];
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  searchTerm = '';
  statusFilter = '';
  technicianFilter = '';
  fromDate = '';
  isLoading = true;
  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService
  ) {}

  async ngOnInit() {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      [this.interventions, this.quotes, this.clients, this.vehicles] =
        await Promise.all([
          this.garageDataService.getAll<Intervention>('interventions'),
          this.garageDataService.getAll<Quote>('quotes'),
          this.garageDataService.getAll<Client>('clients'),
          this.garageDataService.getAll<Vehicle>('vehicles'),
        ]);
      this.filteredInterventions = [...this.interventions];
    } catch (error) {
      this.notificationService.showError('Failed to load interventions');
    } finally {
      this.isLoading = false;
    }
  }

  filterInterventionsv1(): void {
    let filtered = [...this.interventions];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((intervention) => {
        const client = this.getClientName(intervention.quoteId).toLowerCase();
        const vehicle = this.getVehicleInfo(
          intervention.vehicleId
        ).toLowerCase();
        return client.includes(term) || vehicle.includes(term);
      });
    }

    if (this.statusFilter) {
      filtered = filtered.filter(
        (intervention) => intervention.status === this.statusFilter
      );
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (intervention) => new Date(intervention.startDate) >= fromDate
      );
    }

    this.filteredInterventions = filtered;
  }

  filterInterventions(): void {
    let filtered = [...this.interventions];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((intervention) => {
        const client = this.getClientName(intervention.quoteId).toLowerCase();
        const vehicle = this.getVehicleInfo(
          intervention.vehicleId
        ).toLowerCase();
        return client.includes(term) || vehicle.includes(term);
      });
    }

    if (this.statusFilter) {
      filtered = filtered.filter(
        (intervention) => intervention.status === this.statusFilter
      );
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (intervention) => new Date(intervention.startDate) >= fromDate
      );
    }

    this.filteredInterventions = filtered;
    this.currentPage = 1; // reset pagination
  }

  getClientName(quoteId: string): string {
    const quote = this.quotes.find((q) => q.id === quoteId);
    if (quote) {
      const client = this.clients.find((c) => c.id === quote.clientId);
      return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
    }
    return 'Unknown';
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
      : 'Unknown';
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'status-pending';
      case 'inprogress':
        return 'status-accepted';
      case 'completed':
        return 'status-paid';
      case 'onhold':
        return 'status-partial';
      default:
        return 'status-pending';
    }
  }

  getProgress(intervention: Intervention): number {
    const completed = this.getCompletedTasks(intervention);
    return (completed / intervention.tasks.length) * 100;
  }

  getCompletedTasks(intervention: Intervention): number {
    return intervention.tasks.filter((task) => task.completed).length;
  }

  // Pagination
  // Pagination
  currentPage = 1;
  itemsPerPage = 20;

  get paginatedInterventions(): Intervention[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredInterventions.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredInterventions.length / this.itemsPerPage);
  }
}