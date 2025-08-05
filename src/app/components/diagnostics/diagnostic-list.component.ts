import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Diagnostic, DiagnosticCategory } from '../../models/diagnostic.model';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { Personnel } from '../../models/garage.model';


@Component({
  selector: 'app-diagnostic-list',
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
              Diagnostic
            </h2>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="form-label">Recherche</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterDiagnostics()"
                class="form-input"
                placeholder="Rechercher par client ou véhicule"
              />
            </div>
            <div>
              <label class="form-label">Catégorie</label>
              <select
                [(ngModel)]="categoryFilter"
                (change)="filterDiagnostics()"
                class="form-input"
              >
                <option value="">Toutes les catégories</option>
                <option
                  *ngFor="let ctg of diagnosticCategory"
                  value="ctg.categorie"
                >
                  {{ ctg.categorie }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Décision</label>
              <select
                [(ngModel)]="decisionFilter"
                (change)="filterDiagnostics()"
                class="form-input"
              >
                <option value="">Toutes les décisions</option>
                <option value="Repair">Réparation</option>
                <option value="Monitor">Monitoring</option>
                <option value="NonRepairable">Non réparable</option>
              </select>
            </div>
            <div>
              <label class="form-label">Période</label>
              <input
                type="date"
                [(ngModel)]="fromDate"
                (change)="filterDiagnostics()"
                class="form-input"
              />
            </div>
          </div>
        </div>

        <!-- Diagnostics Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date de création
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Véhicule
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Client
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Titre diagnostique
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Technicien
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Décision
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
                  *ngFor="let diagnostic of filteredDiagnostics"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{
                        diagnostic.createdAt | firestoreDate | date : 'medium'
                      }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getVehicleInfo(diagnostic.vehicleId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(diagnostic.visitId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                    >
                      {{ diagnostic.title.slice(0, 25) }}
                    </span>
                    <span
                      *ngIf="diagnostic.title.length > 25"
                      class="text-gray-500"
                    >
                      +{{ diagnostic.title.length - 25 }} autres
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getTechnicianName(diagnostic.technicianId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="status-badge"
                      [ngClass]="getDecisionClass(diagnostic.finalDecision)"
                    >
                      {{ diagnostic.finalDecision }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      [routerLink]="['/diagnostics', diagnostic.id]"
                      class="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Voir
                    </button>
                    <button
                      [routerLink]="['/quotes/create', diagnostic.id]"
                      class="text-secondary-600 hover:text-secondary-900"
                      *ngIf="diagnostic.finalDecision === 'Repair'"
                    >
                      Créer devis
                    </button>
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
export class DiagnosticListComponent implements OnInit {
  diagnostics: Diagnostic[] = [];
  filteredDiagnostics: Diagnostic[] = [];
  visits: Visit[] = [];
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  personnel: Personnel[] = [];
  diagnosticCategory: DiagnosticCategory[] = [];
  searchTerm = '';
  categoryFilter = '';
  decisionFilter = '';
  fromDate = '';
  isLoading = true;
  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      [
        this.diagnostics,
        this.visits,
        this.clients,
        this.vehicles,
        this.personnel,
        this.diagnosticCategory,
      ] = await Promise.all([
        this.garageDataService.getAll<Diagnostic>('diagnostics'),
        this.garageDataService.getAll<Visit>('visits'),
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
        this.garageDataService.getAll<Personnel>('personnel'),
        this.garageDataService.getAll<DiagnosticCategory>('diagnosticCategory'),
      ]);
      this.filteredDiagnostics = [...this.diagnostics];
    } catch (error) {
      this.notificationService.showError('Failed to load diagnostics');
    } finally {
      this.isLoading = false;
    }
  }

  filterDiagnostics(): void {
    let filtered = [...this.diagnostics];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter((diagnostic) => {
        const vehicle = this.getVehicleInfo(diagnostic.vehicleId).toLowerCase();
        const client = this.getClientName(diagnostic.visitId).toLowerCase();
        return vehicle.includes(term) || client.includes(term);
      });
    }

    if (this.categoryFilter) {
      filtered = filtered.filter(
        (diagnostic) => diagnostic.title === this.categoryFilter
      );
    }

    if (this.decisionFilter) {
      filtered = filtered.filter(
        (diagnostic) => diagnostic.finalDecision === this.decisionFilter
      );
    }

    if (this.fromDate) {
      const fromDate = new Date(this.fromDate);
      filtered = filtered.filter(
        (diagnostic) => new Date(diagnostic.createdAt) >= fromDate
      );
    }

    this.filteredDiagnostics = filtered;
  }

  getVehicleInfo(vehicleId: string): string {
    const vehicle = this.vehicles.find((v) => v.id === vehicleId);
    return vehicle
      ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
      : 'Unknown';
  }

  getClientName(visitId: string): string {
    const visit = this.visits.find((v) => v.id === visitId);
    if (visit) {
      const client = this.clients.find((c) => c.id === visit.clientId);
      return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
    }
    return 'Unknown';
  }

  getTechnicianName(technicianId: string): string {
    const technician = this.personnel.find((p) => p.id === technicianId);
    return technician
      ? `${technician.firstName} ${technician.lastName}`
      : 'Unknown';
  }

  getDecisionClass(decision: string): string {
    switch (decision) {
      case 'Repair':
        return 'status-accepted';
      case 'Monitor':
        return 'status-pending';
      case 'NonRepairable':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }
}