import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { Diagnostic } from '../../models/diagnostic.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-visit-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  template: `

  <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  </div>

  <div *ngIf="!isLoading">
    <div class="space-y-6" *ngIf="visit">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Détails de la Déclaration / visite
          </h2>
          <p class="text-lg text-gray-600">{{ visit.visitDate | firestoreDate | date:'full' }}</p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button [routerLink]="['/visits', visit.id, 'edit']" class="btn-secondary">
            Modifier la visite
          </button>
          <button
            [routerLink]="['/diagnostics/create', visit.id]"
            class="btn-primary"
            *ngIf="visit.status === 'InProgress' && !hasDiagnostic"
          >
            Démarrer le diagnostic
          </button>
        </div>
      </div>

      <!-- Visit Information -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations sur la visite</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Date de la visite</label>
            <p class="mt-1 text-sm text-gray-900">{{ visit.visitDate | firestoreDate | date:'full' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Statut</label>
            <p class="mt-1">
              <span class="status-badge" [ngClass]="getStatusClass(visit.status)">
                {{ visit.status }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Client Information -->
      <div class="card" *ngIf="client">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations client</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom</label>
            <p class="mt-1 text-sm text-gray-900">
              <a [routerLink]="['/clients', client.id]" class="text-primary-600 hover:text-primary-900">
                {{ client.firstName }} {{ client.lastName }}
              </a>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Téléphone</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">E-mail</label>
            <p class="mt-1 text-sm text-gray-900">{{ client.email }}</p>
          </div>
        </div>
      </div>

      <!-- Vehicle Information -->
      <div class="card" *ngIf="vehicle">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations sur le véhicule</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Véhicule</label>
            <p class="mt-1 text-sm text-gray-900">
              <a [routerLink]="['/vehicles', vehicle.id]" class="text-primary-600 hover:text-primary-900">
                {{ vehicle.brand }} {{ vehicle.model }}
              </a>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Plaque d'immatriculation</label>
            <p class="mt-1 text-sm text-gray-900">{{ vehicle.licensePlate }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Année</label>
            <p class="mt-1 text-sm text-gray-900">{{ vehicle.year }}</p>
          </div>
        </div>
      </div>

      <!-- Driver Information -->
      <div class="card" *ngIf="visit.driverId">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Informations sur conducteur</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom du chauffeur</label>
            <p class="mt-1 text-sm text-gray-900">{{ visit.driverId.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Numéro de téléphone</label>
            <p class="mt-1 text-sm text-gray-900">{{ visit.driverId.phone }}</p>
          </div>
           <div>
            <label class="text-sm font-medium text-gray-500">Numéro de licence</label>
            <p class="mt-1 text-sm text-gray-900">{{ visit.driverId.licenseNumber }}</p>
          </div>
        </div>
      </div>

      <!-- Reported Issues -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Problèmes signalés</h3>
        <div class="space-y-2">
          <div *ngFor="let issue of visit.reportedIssues; let i = index" class="flex items-start">
            <span class="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
              {{ i + 1 }}
            </span>
            <p class="text-sm text-gray-900">{{ issue }}</p>
          </div>
        </div>
      </div>

      <!-- Diagnostic Information -->
      <div class="card" *ngIf="diagnostic">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">Rapport de diagnostic</h3>
          <button [routerLink]="['/diagnostics', diagnostic.id]" class="btn-primary">
            Rapport de diagnostic
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Titre de diagnostique</label>
            <p class="mt-1 text-sm text-gray-900">{{ diagnostic.title }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Décision finale</label>
            <p class="mt-1 text-sm text-gray-900">{{ diagnostic.finalDecision }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-500">Résumé</label>
            <p class="mt-1 text-sm text-gray-900">{{ diagnostic.summary }}</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  `
})
export class VisitDetailComponent implements OnInit {
  visit: Visit | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  diagnostic: Diagnostic | null = null;
  visitId: string | null = null;
  hasDiagnostic = false;
  isLoading = true;
  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.visitId = this.route.snapshot.paramMap.get('id');
    if (this.visitId) {
      await this.loadVisitData();
    }
  }

  private async loadVisitData(): Promise<void> {
    this.isLoading = true
    try {
      // Load visit
      this.visit = await this.garageDataService.getById<Visit>('visits', this.visitId!);

      if (this.visit) {
        // Load related data
        [this.client, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Client>('clients', this.visit.clientId),
          this.garageDataService.getById<Vehicle>('vehicles', this.visit.vehicleId)
        ]);

        // Check for diagnostic
        const diagnostics = await this.garageDataService.getWithFilter<Diagnostic>('diagnostics', [
          { field: 'visitId', operator: '==', value: this.visitId }
        ]);

        if (diagnostics.length > 0) {
          this.diagnostic = diagnostics[0];
          this.hasDiagnostic = true;
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load visit data');
    }finally{
      this.isLoading = false
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

  viewDocument(document: any): void {
    window.open(document.url, '_blank');
  }

  downloadDocument(document: any): void {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.notificationService.showSuccess('Document downloaded successfully');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}