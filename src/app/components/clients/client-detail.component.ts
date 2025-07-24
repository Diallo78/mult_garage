import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';
;

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  template: `

  <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  </div>

  <div *ngIf="!isLoading">
    <div class="space-y-6" *ngIf="client">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ client.firstName }} {{ client.lastName }}
          </h2>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3" *ngIf="this.authService.canAccessBtnEdit">
          <button [routerLink]="['/clients', client.id, 'edit']" class="btn-secondary">
            Modifier le client
          </button>
          <button [routerLink]="['/visits/new']" [queryParams]="{clientId: client.id}" class="btn-primary">
            Nouvelle visite
          </button>
        </div>
      </div>

      <!-- Client Information -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom et prénom</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Téléphone</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Address</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.address || 'N/A' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Client depuis</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.createdAt | firestoreDate | date:'mediumDate' }}</p>
          </div>
        </div>
      </div>

      <!-- Vehicles -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Véhicules</h3>
          <button [routerLink]="['/vehicles/new']" [queryParams]="{clientId: client.id}" class="btn-primary">
            Ajouter un véhicule
          </button>
        </div>
        <div *ngIf="vehicles.length === 0" class="text-center py-8 text-gray-500">
          Aucun véhicule enregistré pour ce client
        </div>
        <div *ngIf="vehicles.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div *ngFor="let vehicle of vehicles" class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
               [routerLink]="['/vehicles', vehicle.id]">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-medium text-gray-900">{{ vehicle.brand }} {{ vehicle.model }}</h4>
                <p class="text-sm text-gray-500">{{ vehicle.year }} • {{ vehicle.licensePlate }}</p>
                <p class="text-sm text-gray-500" *ngIf="vehicle.color">{{ vehicle.color }}</p>
              </div>
              <div class="text-2xl">🚗</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Visits -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Visites récentes</h3>
          <button [routerLink]="['/visits']" [queryParams]="{clientId: client.id}" class="text-primary-600 hover:text-primary-900">
            Tout voir
          </button>
        </div>
        <div *ngIf="recentVisits.length === 0" class="text-center py-8 text-gray-500">
          Aucune visite enregistrée pour ce client
        </div>
        <div *ngIf="recentVisits.length > 0" class="space-y-4">
          <div *ngFor="let visit of recentVisits" class="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
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
export class ClientDetailComponent implements OnInit {
  client: Client | null = null;
  vehicles: Vehicle[] = [];
  recentVisits: Visit[] = [];
  clientId: string | null = null;
  isLoading = true;

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute,
    public authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId) {
      await this.loadClientData();
    }
  }

  private async loadClientData(): Promise<void> {
    this.isLoading = true;
    try {
      // Load client
      this.client = await this.garageDataService.getById<Client>('clients', this.clientId!);

      if (this.client) {
        // Load vehicles
        this.vehicles = await this.garageDataService.getWithFilter<Vehicle>('vehicles', [
          { field: 'clientId', operator: '==', value: this.clientId }
        ]);

        // Load recent visits
        this.recentVisits = await this.garageDataService.getWithFilter<Visit>('visits', [
          { field: 'clientId', operator: '==', value: this.clientId }
        ]);
        this.recentVisits = this.recentVisits.slice(0, 5); // Show only 5 recent visits
      }
    } catch (error) {
      this.notificationService.showError('Failed to load client data');
    }finally {
      this.isLoading = false;
    }
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