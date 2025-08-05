import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Diagnostic } from '../../models/diagnostic.model';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { Personnel } from '../../models/garage.model';
import { FirestoreDatePipe, FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';


@Component({
  selector: 'app-diagnostic-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
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
      <div class="space-y-6" *ngIf="diagnostic">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Rapport de diagnostic
            </h2>
            <p class="text-lg text-gray-600">
              {{ diagnostic.title }} -
              {{ diagnostic.createdAt | firestoreDate | date : 'full' }}
            </p>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button (click)="downloadPDF()" class="btn-secondary">
              Télécharger PDF
            </button>
            <button
              [routerLink]="['/quotes/create', diagnostic.id]"
              class="btn-primary"
              *ngIf="diagnostic.finalDecision === 'Repair'"
            >
              Créer devis
            </button>
          </div>
        </div>

        <!-- Vehicle & Client Info -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="card" *ngIf="client">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Informations client
            </h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Nom complet</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ client.firstName }} {{ client.lastName }}
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

          <div class="card" *ngIf="vehicle">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Informations véhicule
            </h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Marque</label>
                <p class="mt-1 text-sm text-gray-900">
                  {{ vehicle.brand }} {{ vehicle.model }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500"
                  >Plaque d'immatriculation</label
                >
                <p class="mt-1 text-sm text-gray-900">
                  {{ vehicle.licensePlate }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Année</label>
                <p class="mt-1 text-sm text-gray-900">{{ vehicle.year }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Diagnostic Details -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Informations diagnostic
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label class="text-sm font-medium text-gray-500"
                >Titre</label
              >
              <p class="mt-1 text-sm text-gray-900">{{ diagnostic.title }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500"
                >Technicien</label
              >
              <p class="mt-1 text-sm text-gray-900" *ngIf="technician">
                {{ technician.firstName }} {{ technician.lastName }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500"
                >Décision finale</label
              >
              <p class="mt-1">
                <span
                  class="status-badge"
                  [ngClass]="getDecisionClass(diagnostic.finalDecision)"
                >
                  {{ diagnostic.finalDecision }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Date de création</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ diagnostic.createdAt | firestoreDate | date : 'medium' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Diagnostic Checks -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Vérifications
          </h3>
          <!-- Bouton Tout valider -->
          <div class="mb-4" *ngIf="hasUnvalidatedChecks()">
            <button (click)="validerTout()" class="btn-primary">
              Tout valider
            </button>
          </div>
          <div class="space-y-4">
            <div
              *ngFor="let check of diagnostic.checks; let i = index"
              class="border rounded-lg p-4"
              [ngClass]="
                check.compliant
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              "
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">
                    {{ check.description }}
                  </h4>
                  <div
                    class="mt-2 grid grid-cols-2 md:grid-cols-5 gap-5 text-sm"
                  >
                    <div>
                      <span class="text-gray-500">Category:</span>
                      <span
                        class="ml-1"
                        [ngClass]="
                          check.category ? 'text-green-600' : 'text-red-600'
                        "
                      >
                        {{ check.category }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500">Statut:</span>
                      <span
                        class="ml-1"
                        [ngClass]="
                          check.compliant ? 'text-green-600' : 'text-red-600'
                        "
                      >
                        {{ check.compliant ? 'Compliant' : 'Non-Compliant' }}
                      </span>
                    </div>
                    <div>
                      <span class="text-gray-500">Gravité:</span>
                      <span
                        class="ml-1"
                        [ngClass]="getSeverityClass(check.severityLevel)"
                      >
                        {{ check.severityLevel }}
                      </span>
                    </div>
                    <div *ngIf="check.quantity">
                      <span class="text-gray-500">Quantité:</span>
                      <span class="ml-1 text-gray-900">{{
                        check.quantity
                      }}</span>
                    </div>
                    <div>
                      <span class="text-gray-500">Post-réparation:</span>
                      <span class="ml-1 text-gray-900">{{
                        check.postRepairVerification ? 'Yes' : 'No'
                      }}</span>
                    </div>
                  </div>
                  <div *ngIf="check.comments" class="mt-2">
                    <span class="text-gray-500">Commentaires:</span>
                    <p class="mt-1 text-sm text-gray-900">
                      {{ check.comments }}
                    </p>
                  </div>
                </div>
                <div class="ml-4 flex flex-col items-end gap-2">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
                    [ngClass]="
                      check.compliant
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    "
                  >
                    {{ check.compliant ? '✓' : '✗' }}
                  </span>
                  <!-- Bouton Valider individuel -->
                  <button
                    *ngIf="!check.postRepairVerification"
                    (click)="validerCheck(i)"
                    class="btn-secondary px-2 py-1 text-xs rounded mt-2"
                  >
                    Valider
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Résumé</h3>
          <p class="text-gray-900 whitespace-pre-wrap">
            {{ diagnostic.summary }}
          </p>
        </div>
      </div>
    </div>
  `,
})
export class DiagnosticDetailComponent implements OnInit {
  diagnostic: Diagnostic | null = null;
  visit: Visit | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  diagnosticId: string | null = null;
  technician: Personnel | null = null;
  isLoading = true;

  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private pdfService: PDFService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.diagnosticId = this.route.snapshot.paramMap.get('id');
    if (this.diagnosticId) {
      await this.loadDiagnosticData();
    }
  }

  private async loadDiagnosticData(): Promise<void> {
    this.isLoading = true;
    try {
      this.diagnostic = await this.garageDataService.getById<Diagnostic>(
        'diagnostics',
        this.diagnosticId!
      );

      if (this.diagnostic) {
        [this.visit, this.vehicle, this.technician] = await Promise.all([
          this.garageDataService.getById<Visit>(
            'visits',
            this.diagnostic.visitId
          ),
          this.garageDataService.getById<Vehicle>(
            'vehicles',
            this.diagnostic.vehicleId
          ),
          this.garageDataService.getById<Personnel>(
            'personnel',
            this.diagnostic.technicianId
          ),
        ]);

        if (this.visit) {
          this.client = await this.garageDataService.getById<Client>(
            'clients',
            this.visit.clientId
          );
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load diagnostic data');
    } finally {
      this.isLoading = false;
    }
  }

  async downloadPDF(): Promise<void> {
    if (!this.diagnostic || !this.client || !this.vehicle) return;

    try {
      const clientName = `${this.client.firstName} ${this.client.lastName}`;
      const vehicleInfo = `${this.vehicle.brand} ${this.vehicle.model} (${this.vehicle.licensePlate})`;

      const pipeDate = new FirestoreDatePipeTS();
      const dateFonctio = pipeDate.transform(this.diagnostic.createdAt);
      this.diagnostic.createdAt = new Date(dateFonctio);

      await this.pdfService.generateDiagnosticReportPDF(
        this.diagnostic,
        clientName,
        vehicleInfo
      );
      this.notificationService.showSuccess('PDF downloaded successfully');
    } catch (error) {
      this.notificationService.showError('Failed to generate PDF');
    }
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

  getSeverityClass(severity: string): string {
    switch (severity) {
      case 'Low':
        return 'text-green-600';
      case 'Medium':
        return 'text-yellow-600';
      case 'High':
        return 'text-orange-600';
      case 'Critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }

  async validerCheck(index: number): Promise<void> {
    if (!this.diagnostic) return;
    const updatedChecks = this.diagnostic.checks.map((c, i) =>
      i === index ? { ...c, postRepairVerification: true } : c
    );
    try {
      await this.garageDataService.update('diagnostics', this.diagnostic.id, {
        checks: updatedChecks,
        updatedAt: new Date(),
      });
      this.diagnostic.checks = updatedChecks;
      this.notificationService.showSuccess('Check validé avec succès');
    } catch (error) {
      this.notificationService.showError(
        'Erreur lors de la validation du check'
      );
    }
  }

  async validerTout(): Promise<void> {
    if (!this.diagnostic) return;
    const updatedChecks = this.diagnostic.checks.map((c) => ({
      ...c,
      postRepairVerification: true,
    }));
    try {
      await this.garageDataService.update('diagnostics', this.diagnostic.id, {
        checks: updatedChecks,
        updatedAt: new Date(),
      });
      this.diagnostic.checks = updatedChecks;
      this.notificationService.showSuccess('Tous les checks ont été validés');
    } catch (error) {
      this.notificationService.showError(
        'Erreur lors de la validation globale'
      );
    }
  }

  hasUnvalidatedChecks(): boolean {
    return !!this.diagnostic?.checks.some((c) => !c.postRepairVerification);
  }
}