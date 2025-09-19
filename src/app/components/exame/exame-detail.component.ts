import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { VehicleExam, EXAM_CATEGORIES } from '../../models/exam.model';
import { FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-exame-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6" *ngIf="!isLoading">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            FICHE DE DIAGNOSTIQUE ET VERIFICATION
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Examen N° {{ exam?.examNumber }} - {{ formatDate(exam?.date) }}
          </p>
        </div>
        <div class="mt-4 flex md:ml-4 md:mt-0 space-x-3">
          <button (click)="editExam()" class="btn-secondary">Modifier</button>
          <button (click)="printExam()" class="btn-primary">Imprimer</button>
        </div>
      </div>

      <div class="card">
        <!-- En-tête du formulaire -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6 mb-6">
          <div>
            <label class="form-label font-semibold">N°:</label>
            <p class="text-lg font-medium text-gray-900">
              {{ exam?.examNumber }}
            </p>
          </div>
          <div>
            <label class="form-label font-semibold">Date:</label>
            <p class="text-lg font-medium text-gray-900">
              {{ formatDate(exam?.date) }}
            </p>
          </div>
          <div>
            <label class="form-label font-semibold">CLIENT:</label>
            <p class="text-lg font-medium text-gray-900">
              {{ exam?.clientName }}
            </p>
          </div>
          <div>
            <label class="form-label font-semibold">Tel:</label>
            <p class="text-lg font-medium text-gray-900">
              {{ exam?.clientPhone }}
            </p>
          </div>
        </div>

        <!-- Informations du véhicule -->
        <div class="bg-red-50 p-4 rounded-lg mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            RENSEIGNEMENTS DU VÉHICULE
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label font-semibold"
                >Marque du véhicule:</label
              >
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.vehicleMake }}
              </p>
            </div>
            <div>
              <label class="form-label font-semibold">Immatriculation:</label>
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.vehicleRegistration }}
              </p>
            </div>
          </div>
        </div>

        <!-- Vérifications techniques -->
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            VÉRIFICATIONS DES PARAMÈTRES TECHNIQUES
          </h3>

          <div class="space-y-6">
            <div
              *ngFor="let category of examCategories"
              class="border rounded-lg p-4"
            >
              <h4 class="font-semibold text-gray-900 mb-4 text-lg">
                {{ category.key }}. {{ category.name }}
              </h4>

              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th
                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Vérifications requises
                      </th>
                      <th
                        class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Conformité
                      </th>
                      <th
                        class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        QTE
                      </th>
                      <th
                        class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Vérification après travaux
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr *ngFor="let item of category.items">
                      <td class="px-6 py-4 whitespace-nowrap">
                        <div class="text-sm font-medium text-gray-900">
                          {{ item.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ item.verificationRequired }}
                        </div>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          *ngIf="getCheckStatus(item.id)?.compliance"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                        >
                          ✓ Conforme
                        </span>
                        <span
                          *ngIf="!getCheckStatus(item.id)?.compliance"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                        >
                          ✗ Non conforme
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span class="text-sm font-medium text-gray-900">
                          {{ getCheckStatus(item.id)?.quantity || 0 }}
                        </span>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          *ngIf="
                            getCheckStatus(item.id)?.postRepairVerification
                          "
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          ✓ Vérifié
                        </span>
                        <span
                          *ngIf="
                            !getCheckStatus(item.id)?.postRepairVerification
                          "
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          - Non vérifié
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Résumé et décision -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            RÉSUMÉ ET DÉCISION
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label font-semibold"
                >Résumé de l'examen:</label
              >
              <div class="mt-1 p-3 bg-gray-50 rounded-md">
                <p class="text-sm text-gray-900">
                  {{ exam?.summary || 'Aucun résumé fourni' }}
                </p>
              </div>
            </div>
            <div>
              <label class="form-label font-semibold">Décision finale:</label>
              <div class="mt-1">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                  [class]="getStatusClass(exam?.finalDecision)"
                >
                  {{ getStatusLabel(exam?.finalDecision) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations du chauffeur -->
        <div *ngIf="exam?.driver" class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            Informations du chauffeur
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="form-label font-semibold">Nom du chauffeur:</label>
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.driver?.name }}
              </p>
            </div>
            <div>
              <label class="form-label font-semibold">Téléphone:</label>
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.driver?.phone }}
              </p>
            </div>
            <div>
              <label class="form-label font-semibold">Compte:</label>
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.driver?.account }}
              </p>
            </div>
          </div>
        </div>

        <!-- Signature -->
        <div class="border-t pt-6 mt-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label font-semibold"
                >Signature du technicien:</label
              >
              <p class="text-lg font-medium text-gray-900">
                {{ exam?.technicianSignature || 'Non signé' }}
              </p>
            </div>
            <div>
              <label class="form-label font-semibold">Date de création:</label>
              <p class="text-sm text-gray-500">
                {{ formatDate(exam?.createdAt) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div *ngIf="isLoading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"
      ></div>
    </div>

    <!-- Error state -->
    <div *ngIf="!isLoading && !exam" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Examen non trouvé</h3>
      <p class="mt-1 text-sm text-gray-500">
        L'examen demandé n'existe pas ou a été supprimé.
      </p>
      <div class="mt-6">
        <button (click)="goBack()" class="btn-primary">
          Retour à la liste
        </button>
      </div>
    </div>
  `,
})
export class ExameDetailComponent implements OnInit {
  exam: VehicleExam | null = null;
  isLoading = false;
  examId: string | null = null;
  examCategories = EXAM_CATEGORIES;

  private readonly datePipe = new FirestoreDatePipeTS();

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.examId = this.route.snapshot.paramMap.get('id');
    if (this.examId) {
      this.loadExam();
    }
  }

  private async loadExam(): Promise<void> {
    this.isLoading = true;
    try {
      this.exam = await this.garageDataService.getById<VehicleExam>(
        'exams',
        this.examId!
      );
      if (!this.exam) {
        this.notificationService.showError('Examen non trouvé');
      }
    } catch (error) {
      this.notificationService.showError(
        "Échec du chargement de l'examen. " + error
      );
    } finally {
      this.isLoading = false;
    }
  }

  getCheckStatus(itemId: string) {
    if (!this.exam?.technicalChecks) return null;
    return this.exam.technicalChecks.find((check) => check.id === itemId);
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status) {
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'NonConforme':
        return 'bg-red-100 text-red-800';
      case 'PartiellementConforme':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Non défini';

    switch (status) {
      case 'Conforme':
        return 'Conforme';
      case 'NonConforme':
        return 'Non Conforme';
      case 'PartiellementConforme':
        return 'Partiellement Conforme';
      default:
        return status;
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') return date;
    const result = this.datePipe.transform(date);
    return typeof result === 'string' ? result : '';
  }

  editExam(): void {
    this.router.navigate(['/exams', this.examId, 'edit']);
  }

  printExam(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }
}
