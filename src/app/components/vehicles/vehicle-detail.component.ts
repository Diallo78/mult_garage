import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { NotificationService } from '../../services/notification.service';
import { GarageDataService } from '../../services/garage-data.service';
import { AuthService } from '../../services/auth.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';


@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
    </div>

    <div *ngIf="!isLoading">
      <div class="space-y-6" *ngIf="vehicle">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {{ vehicle.brand }} {{ vehicle.model }}
            </h2>
            <p class="text-lg text-gray-600">{{ vehicle.licensePlate }}</p>
          </div>
          @if(this.authService.canAccessBtnEdit){
            <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
              <button [routerLink]="['/vehicles', vehicle.id, 'edit']" class="btn-secondary">
                Modifier le véhicule
              </button>
              <button [routerLink]="['/visits/new']" [queryParams]="{vehicleId: vehicle.id}" class="btn-primary">
                Nouvelle visite
              </button>
            </div>
          }
        </div>

        <!-- Informations du véhicule -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Informations sur le véhicule</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label class="text-sm font-medium text-gray-500">Marque & Modèle</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Plaque d'immatriculation</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.licensePlate }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Année</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.year }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Couleur</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.color || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Kilométrage</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ vehicle.mileage ? (vehicle.mileage | number) + ' km' : 'N/A' }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Numéro VIN</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.vin || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Informations du propriétaire -->
        <div class="card" *ngIf="owner">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Informations du propriétaire</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="text-sm font-medium text-gray-500">Nom</label>
              <p class="mt-1 text-sm text-gray-900">
                <a [routerLink]="['/clients', owner.id]" class="text-primary-600 hover:text-primary-900">
                  {{ owner.firstName }} {{ owner.lastName }}
                </a>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Téléphone</label>
              <p class="mt-1 text-sm text-gray-900">{{ owner.phone }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 text-sm text-gray-900">{{ owner.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Adresse</label>
              <p class="mt-1 text-sm text-gray-900">{{ owner.address || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Historique des services -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-medium text-gray-900">Historique des entretiens</h3>
            <button [routerLink]="['/visits']" [queryParams]="{vehicleId: vehicle.id}" class="text-primary-600 hover:text-primary-900">
              Voir tout
            </button>
          </div>
          <div *ngIf="serviceHistory.length === 0" class="text-center py-8 text-gray-500">
            Aucun historique d’entretien disponible pour ce véhicule
          </div>
          <div *ngIf="serviceHistory.length > 0" class="space-y-4">
            <div *ngFor="let visit of serviceHistory" class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                [routerLink]="['/visits', visit.id]">
              <div class="flex items-center justify-between">
                <div>
                  <h4 class="font-medium text-gray-900">{{ visit.visitDate | firestoreDate | date:'mediumDate' }}</h4>
                  <p class="text-sm text-gray-500">{{ visit.reportedIssues.join(', ') }}</p>
                </div>
                <span class="status-badge" [ngClass]="getStatusClass(visit.status)">
                  {{ visit.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Vehicle | null = null;
  owner: Client | null = null;
  serviceHistory: Visit[] = [];
  vehicleId: string | null = null;
  isLoading = true
  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    if (this.vehicleId) {
      await this.loadVehicleData();
    }
  }

  private async loadVehicleData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load vehicle
      this.vehicle = await this.garageDataService.getById<Vehicle>('vehicles', this.vehicleId!);

      if (this.vehicle) {
        // Load owner
        this.owner = await this.garageDataService.getById<Client>('clients', this.vehicle.clientId);

        // Load service history
        this.serviceHistory = await this.garageDataService.getWithFilter<Visit>('visits', [
          { field: 'vehicleId', operator: '==', value: this.vehicleId }
        ]);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load vehicle data');
    }finally{this.isLoading = false}
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'inprogress': return 'status-accepted';
      case 'completed': return 'status-paid';
      case 'cancelled': return 'status-rejected';
      default: return 'status-pending';
    }
  }
}