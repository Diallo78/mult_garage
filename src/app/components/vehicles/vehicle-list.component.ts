import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client, Vehicle } from '../../models/client.model';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from '../../services/auth.service';
import { UserManagementService } from '../../services/user-management.service';


@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
      ></div>
    </div>

    <div *ngIf="!isLoading">
      <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Véhicules
            </h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button routerLink="/vehicles/new" class="btn-primary">
              Ajouter un véhicule
            </button>
          </div>
        </div>

        <!-- Recherche et Filtrage -->
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Recherche</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterVehicles()"
                class="form-input"
                placeholder="Rechercher par marque, modèle ou plaque"
              />
            </div>
          </div>
        </div>

        <!-- Tableau des véhicules -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Véhicule
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Propriétaire
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Plaque
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Année
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Kilométrage
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
                  *ngFor="let vehicle of filteredVehicles"
                  class="hover:bg-gray-50"
                >
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="text-2xl mr-3">🚗</div>
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ vehicle.brand }} {{ vehicle.model }}
                        </div>
                        <div
                          class="text-sm text-gray-500"
                          *ngIf="vehicle.color"
                        >
                          {{ vehicle.color }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                      {{ getClientName(vehicle.clientId) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ vehicle.licensePlate }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ vehicle.year }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{
                      vehicle.mileage
                        ? (vehicle.mileage | number) + ' km'
                        : 'N/A'
                    }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      [routerLink]="['/vehicles', vehicle.id]"
                      class="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Voir
                    </button>
                    @if(this.authService.canAccessBtnEdit){
                    <button
                      [routerLink]="['/vehicles', vehicle.id, 'edit']"
                      class="text-secondary-600 hover:text-secondary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      (click)="deleteVehicle(vehicle)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Supprimer
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
  `,
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  filteredVehicles: Vehicle[] = [];
  clients: Client[] = [];
  client: Client | null = null;
  searchTerm = '';
  isLoading = true;

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly vehicleService: VehicleService,
    public authService: AuthService,
    private readonly userManagementService: UserManagementService
  ) {}

  ngOnInit() {
    (async () => {
      if (this.authService.isClient) await this.loadDataClient();
      else await this.loadDataGarage();
    })();
  }

  private async loadDataClient(): Promise<void> {
    this.isLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Utiliser le service de gestion des utilisateurs
        this.client = await this.userManagementService.getClientByUserId(
          currentUser.uid
        );

        if(this.client){
          // Étape 1 : récupérer les véhicules du client
          this.vehicles = await this.garageDataService.getWithFilter<Vehicle>(
            'vehicles',
            [{ field: 'clientId', operator: '==', value: this.client.id }]
          );
          this.clients.push(this.client)
          this.filteredVehicles = [...this.vehicles];
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load vehicles');
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDataGarage(): Promise<void> {
    this.isLoading = true;
    try {
      [this.vehicles, this.clients] = await Promise.all([
        this.vehicleService.getAllVehicles(),
        this.garageDataService.getAll<Client>('clients'),
      ]);
      this.filteredVehicles = [...this.vehicles];
    } catch (error) {
      this.notificationService.showError('Failed to load vehicles');
    } finally {
      this.isLoading = false;
    }
  }

  filterVehicles(): void {
    if (!this.searchTerm) {
      this.filteredVehicles = [...this.vehicles];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredVehicles = this.vehicles.filter(
      (vehicle) =>
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.model.toLowerCase().includes(term) ||
        vehicle.licensePlate.toLowerCase().includes(term)
    );
  }

  getClientName(clientId: string): string {
    const client = this.clients.find((c) => c.id === clientId);
    return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
  }

  async deleteVehicle(vehicle: Vehicle): Promise<void> {
    if (
      confirm(
        `Are you sure you want to delete ${vehicle.brand} ${vehicle.model}?`
      )
    ) {
      try {
        await this.garageDataService.delete('vehicles', vehicle.id);
        this.vehicles = this.vehicles.filter((v) => v.id !== vehicle.id);
        this.filterVehicles();
        this.notificationService.showSuccess('Vehicle deleted successfully');
      } catch (error) {
        this.notificationService.showError('Failed to delete vehicle');
      }
    }
  }
}