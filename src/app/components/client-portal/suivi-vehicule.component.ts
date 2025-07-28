import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { User } from '../../models/user.model';
import { Client, Vehicle } from '../../models/client.model';
import { Quote } from '../../models/quote.model';

import { UserManagementService } from '../../services/user-management.service';
import { Intervention } from '../../models/intervention.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-client-quotes',
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
      <div class="container mx-auto space-y-6 animate-fadeIn">
        <!-- Titre principal -->

        <div class="md:flex md:items-center md:justify-between space-y-6 ">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Suivi des Interventions
            </h2>
          </div>
        </div>

        <!-- Navigation par véhicule (onglets horizontaux) -->
        <div class="mb-6 border-b border-gray-200">
          <nav class="flex space-x-2 overflow-x-auto pb-2">
            <button
              *ngFor="let vehicle of vehicles; let i = index"
              (click)="activeVehicleTab = i"
              [class]="
                activeVehicleTab === i
                  ? 'border-blue-500 text-blue-600 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm'
              "
            >
              {{ vehicle.brand }} {{ vehicle.model }}
            </button>
          </nav>
        </div>

        <!-- Contenu pour le véhicule actif -->
        <div
          *ngIf="vehicles[activeVehicleTab]"
          class="bg-white rounded-xl shadow-lg overflow-hidden"
        >
          <!-- En-tête du véhicule -->
          <div
            class="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200"
          >
            <div class="flex items-center">
              <div class="p-3 bg-blue-100 rounded-lg mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-8 w-8 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-800">
                  {{ vehicles[activeVehicleTab].brand }}
                  {{ vehicles[activeVehicleTab].model }}
                </h3>
                <p class="text-sm text-gray-600">
                  Immatriculation: {{ vehicles[activeVehicleTab].licensePlate }}
                </p>
              </div>
            </div>
          </div>

          <!-- Liste des interventions (accordéon) -->
          <div class="divide-y divide-gray-200">
            <div
              *ngFor="
                let intervention of getInterventionsByVehicle(
                  vehicles[activeVehicleTab].id
                )
              "
              class="transition-all duration-300"
            >
              <!-- En-tête de l'intervention (cliquable) -->
              <button
                (click)="toggleIntervention(intervention.id)"
                class="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 focus:outline-none"
              >
                <div class="flex items-center">
                  <span
                    class="inline-block px-2 py-1 text-xs font-semibold rounded-full mr-3"
                    [ngClass]="{
                      'bg-green-100 text-green-800':
                        intervention.status === 'Completed',
                      'bg-blue-100 text-blue-800':
                        intervention.status === 'InProgress',
                      'bg-yellow-100 text-yellow-800':
                        intervention.status === 'Pending',
                      'bg-red-100 text-red-800':
                        intervention.status === 'Suspended'
                    }"
                  >
                    {{ intervention.status }}
                  </span>
                  <div>
                    <h4 class="font-medium text-gray-900">
                      Intervention #{{ intervention.id }}
                    </h4>
                    <p class="text-sm text-gray-500">
                      {{
                        intervention.startDate
                          | firestoreDate
                          | date : 'mediumDate'
                      }}
                    </p>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 text-gray-400 transform transition-transform duration-200"
                  [class.rotate-180]="isInterventionOpen(intervention.id)"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <!-- Contenu dépliable de l'intervention -->
              <div
                *ngIf="isInterventionOpen(intervention.id)"
                class="px-6 py-4 bg-gray-50 border-t border-gray-200 animate-slideDown"
              >
                <!-- Liste des tâches avec barres de progression -->
                <div class="space-y-4">
                  <div *ngFor="let task of intervention.tasks" class="group">
                    <div class="flex items-start">
                      <!-- Icône d'état -->
                      <div class="mr-3 mt-1 flex-shrink-0">
                        <div
                          *ngIf="task.completed"
                          class="p-1.5 bg-green-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-green-600"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </div>
                        <div
                          *ngIf="!task.completed && task.status !== 'Suspended'"
                          class="p-1.5 bg-blue-100 rounded-full animate-pulse"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div
                          *ngIf="task.status === 'Suspended'"
                          class="p-1.5 bg-red-100 rounded-full"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                          </svg>
                        </div>
                      </div>

                      <!-- Détails de la tâche -->
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-700 truncate">
                          {{ task.description }}
                        </p>
                        <div
                          *ngIf="task.status === 'Suspended'"
                          class="mt-1 px-3 py-1 bg-red-50 rounded text-xs text-red-600 inline-block"
                        >
                          ⚠️ Suspendue:
                          {{ task.suspendReason || 'Raison non spécifiée' }}
                        </div>
                        <div class="mt-2 flex items-center">
                          <div
                            class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden"
                          >
                            <div
                              class="h-full bg-blue-500 rounded-full"
                              [style.width]="
                                (task.progress || (task.completed ? 100 : 0)) +
                                '%'
                              "
                            ></div>
                          </div>
                          <span class="ml-2 text-xs font-medium text-gray-500">
                            {{ task.progress || (task.completed ? 100 : 0) }}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Pied de section avec actions -->
                <div class="mt-4 flex justify-between items-center">
                  <span class="text-xs text-gray-500">
                    Dernière mise à jour:
                    {{
                      intervention.updatedAt | firestoreDate | date : 'short'
                    }}
                  </span>
                  <button
                    class="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Voir les détails complets →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pied de page avec statistiques -->
          <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div class="grid grid-cols-3 gap-4 text-center">
              <div>
                <p class="text-sm font-medium text-gray-500">
                  Total Interventions
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  {{
                    getInterventionsByVehicle(vehicles[activeVehicleTab].id)
                      .length
                  }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">En cours</p>
                <p class="text-2xl font-bold text-blue-600">
                  {{
                    countInterventionsByStatus(
                      vehicles[activeVehicleTab].id,
                      'InProgress'
                    )
                  }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Terminées</p>
                <p class="text-2xl font-bold text-green-600">
                  {{
                    countInterventionsByStatus(
                      vehicles[activeVehicleTab].id,
                      'Completed'
                    )
                  }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    /* Dans votre fichier styles.css ou dans les styles du composant */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fadeIn {
      animation: fadeIn 0.5s ease-out forwards;
    }

    /* Effet de vague au survol des cartes d'intervention */
    .hover-wave:hover {
      position: relative;
      overflow: hidden;
    }

    .hover-wave:hover::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      opacity: 0;
      animation: wave 1s ease-out;
    }

    @keyframes wave {
      0% { transform: scale(0.5); opacity: 0.5; }
      100% { transform: scale(2); opacity: 0; }
    }

    /* animations.css ajouter apres */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 500px;
      }
    }

    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }

    .animate-slideDown {
      animation: slideDown 0.3s ease-out forwards;
      overflow: hidden;
    }

    .rotate-180 {
      transform: rotate(180deg);
    }
    `,
})
export class SuiviVehicule implements OnInit {
  // Dans votre composant.ts
  activeVehicleTab: number = 0;
  openInterventions: Set<string> = new Set();
  currentPages: { [vehicleId: string]: number } = {};
  vehicles: Vehicle[] = [];
  interventions: Intervention[] = [];
  currentUser: User | null = null;
  client: Client | null = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly userManagementService: UserManagementService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.loadClientData();
    }
  }

  private async loadClientData(): Promise<void> {
    this.isLoading = true;
    if (!this.currentUser) return;

    try {
      // Utiliser le service de gestion des utilisateurs
      this.client = await this.userManagementService.getClientByUserId(
        this.currentUser.uid
      );

      if (this.client) {
        await this.loadRelatedData();
      }
    } catch (error) {
      this.notificationService.showError(
        'Échec de chargement des données client',
        500
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async loadRelatedData(): Promise<void> {
    if (!this.client) return;

    try {
      // Étape 1 : récupérer les véhicules du client
      this.vehicles = await this.garageDataService.getWithFilter<Vehicle>(
        'vehicles',
        [{ field: 'clientId', operator: '==', value: this.client.id }]
      );

      // Étape 2 : charger les interventions pour chaque véhicule
      const interventionFetches = this.vehicles.map((vehicle) =>
        this.garageDataService.getWithFilter<Intervention>('interventions', [
          { field: 'vehicleId', operator: '==', value: vehicle.id },
        ])
      );

      const interventionsPerVehicle = await Promise.all(interventionFetches);

      // Aplatir tous les résultats dans un seul tableau
      this.interventions = interventionsPerVehicle.flat();

      // Initialiser les pages à 0 pour chaque véhicule
      this.vehicles.forEach((vehicle) => {
        this.currentPages[vehicle.id] = 0;
      });
    } catch (error) {
      this.notificationService.showError(
        'Échec du chargement des données liées.'
      );
    }
  }

  // Obtenir les interventions pour un véhicule
  getInterventionsByVehicle(vehicleId: string): any[] {
    return this.interventions.filter((i) => i.vehicleId === vehicleId) || [];
  }

  // Basculer l'état d'une intervention
  toggleIntervention(interventionId: string): void {
    if (this.openInterventions.has(interventionId)) {
      this.openInterventions.delete(interventionId);
    } else {
      this.openInterventions.add(interventionId);
    }
  }

  // Vérifier si une intervention est ouverte
  isInterventionOpen(interventionId: string): boolean {
    return this.openInterventions.has(interventionId);
  }

  // Compter les interventions par statut
  countInterventionsByStatus(vehicleId: string, status: string): number {
    return this.getInterventionsByVehicle(vehicleId).filter(
      (i) => i.status === status
    ).length;
  }
}
