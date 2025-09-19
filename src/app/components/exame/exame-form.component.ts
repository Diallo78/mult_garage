import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import {
  VehicleExam,
  TechnicalCheck,
  EXAM_CATEGORIES,
} from '../../models/exam.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            <!-- {{
              isEditMode
                ? 'Modifier l&apos;examen'
                : 'FICHE DE DIAGNOSTIQUE ET VERIFICATION'
            }} -->
            FICHE DE DIAGNOSTIQUE ET VERIFICATION
          </h2>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="examForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- En-tête du formulaire -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 border-b pb-6">
            <div>
              <label class="form-label">N°:</label>
              <input
                type="text"
                formControlName="examNumber"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            <div>
              <label class="form-label">Date:</label>
              <input
                type="date"
                formControlName="date"
                class="form-input"
                [class.border-red-500]="
                  examForm.get('date')?.invalid && examForm.get('date')?.touched
                "
              />
            </div>

            <!-- <div>
              <label class="form-label">CLIENT:</label>
              <input
                type="text"
                formControlName="clientName"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            <div>
              <label class="form-label">Tel:</label>
              <input
                type="tel"
                formControlName="clientPhone"
                class="form-input bg-gray-100"
                readonly
              />
            </div> -->
          </div>

          <!-- Sélection Client et Véhicule -->
          <div class="border rounded-lg p-4 bg-blue-50 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Sélection du Client et du Véhicule
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Client *</label>
                <select
                  formControlName="clientId"
                  (change)="onClientSelected($event)"
                  class="form-input"
                  [class.border-red-500]="
                    examForm.get('clientId')?.invalid &&
                    examForm.get('clientId')?.touched
                  "
                >
                  <option value="">-- Sélectionner un client --</option>
                  <option *ngFor="let client of clients" [value]="client.id">
                    {{ client.firstName }} {{ client.lastName }} ({{
                      client.email
                    }})
                  </option>
                </select>
              </div>
              <div>
                <label class="form-label">Véhicule *</label>
                <select
                  formControlName="vehicleId"
                  (change)="onVehicleSelected($event)"
                  class="form-input"
                  [class.border-red-500]="
                    examForm.get('vehicleId')?.invalid &&
                    examForm.get('vehicleId')?.touched
                  "
                  [disabled]="selectedClientVehicles.length === 0"
                >
                  <option value="">-- Sélectionner un véhicule --</option>
                  <option
                    *ngFor="let vehicle of selectedClientVehicles"
                    [value]="vehicle.id"
                  >
                    {{ vehicle.brand }} {{ vehicle.model }} -
                    {{ vehicle.licensePlate }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Informations du véhicule -->
          <div class="bg-red-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              RENSEIGNEMENTS DU VÉHICULE
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Marque du véhicule:</label>
                <input
                  type="text"
                  formControlName="vehicleMake"
                  class="form-input bg-gray-100"
                  readonly
                />
              </div>
              <div>
                <label class="form-label">Immatriculation:</label>
                <input
                  type="text"
                  formControlName="vehicleRegistration"
                  class="form-input bg-gray-100"
                  readonly
                />
              </div>
            </div>
          </div>

          <!-- Informations du chauffeur (optionnel) -->
          <div class="border rounded-lg p-4 bg-green-50 mb-6">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Informations du chauffeur (optionnel)
            </h3>
            <div
              formGroupName="driver"
              class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div>
                <label class="form-label">Nom du chauffeur:</label>
                <input
                  type="text"
                  formControlName="name"
                  class="form-input"
                  placeholder="Nom du chauffeur"
                />
              </div>
              <div>
                <label class="form-label">Téléphone:</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-input"
                  placeholder="Téléphone du chauffeur"
                />
              </div>
              <div>
                <label class="form-label">Compte:</label>
                <input
                  type="text"
                  formControlName="account"
                  class="form-input"
                  placeholder="Numéro de compte"
                />
              </div>
            </div>
          </div>

          <!-- Vérifications techniques -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              VÉRIFICATIONS DES PARAMÈTRES TECHNIQUES
            </h3>

            <div class="space-y-3">
              <div
                *ngFor="let category of examCategories"
                class="border border-gray-200 rounded-lg"
              >
                <!-- En-tête de l'accordéon -->
                <button
                  type="button"
                  (click)="toggleCategory(category.key)"
                  class="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset rounded-lg flex items-center justify-between"
                >
                  <div class="flex items-center space-x-3">
                    <svg
                      class="w-5 h-5 text-gray-500 transition-transform duration-200"
                      [class.rotate-90]="expandedCategories[category.key]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span class="font-medium text-gray-900">
                      {{ category.key }}. {{ category.name }}
                    </span>
                    <span class="text-sm text-gray-500">
                      ({{ category.items.length }} élément{{
                        category.items.length > 1 ? 's' : ''
                      }})
                    </span>
                  </div>
                  <div class="text-sm text-gray-500">
                    {{
                      expandedCategories[category.key] ? 'Masquer' : 'Afficher'
                    }}
                  </div>
                </button>

                <!-- Contenu de l'accordéon -->
                <div
                  *ngIf="expandedCategories[category.key]"
                  class="px-4 py-3 bg-white border-t border-gray-200"
                >
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
                        <tr *ngFor="let item of category.items; let i = index">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-gray-900">
                              {{ item.name | titlecase }}
                            </div>
                            <div class="text-sm text-gray-500">
                              {{ item.verificationRequired }}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              [formControlName]="'compliance_' + item.id"
                              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="number"
                              [formControlName]="'quantity_' + item.id"
                              class="w-16 text-center form-input"
                              min="0"
                              placeholder="0"
                            />
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-center">
                            <input
                              type="checkbox"
                              [formControlName]="'postRepair_' + item.id"
                              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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
                <label class="form-label">Résumé de l'examen:</label>
                <textarea
                  formControlName="summary"
                  class="form-input"
                  rows="4"
                  placeholder="Résumé des constatations..."
                ></textarea>
              </div>
              <div>
                <label class="form-label">Décision finale:</label>
                <select formControlName="finalDecision" class="form-input">
                  <option value="Conforme">Conforme</option>
                  <option value="NonConforme">Non Conforme</option>
                  <option value="PartiellementConforme">
                    Partiellement Conforme
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Signature -->
          <div class="border-t pt-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">Signature du technicien:</label>
                <input
                  type="text"
                  formControlName="technicianSignature"
                  class="form-input"
                  placeholder="Nom du technicien"
                />
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button type="button" (click)="goBack()" class="btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="examForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Saving...</span>
              {{ getButtonText() }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ExameFormComponent implements OnInit {
  examForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  examId: string | null = null;
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  examCategories = EXAM_CATEGORIES;
  selectedClientVehicles: Vehicle[] = [];
  expandedCategories: { [key: string]: boolean } = {};

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.examForm = this.fb.group({
      examNumber: [''],
      date: ['', Validators.required],
      clientId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      clientName: [''],
      clientPhone: [''],
      vehicleMake: ['', Validators.required],
      vehicleRegistration: ['', Validators.required],
      driver: this.fb.group({
        name: [''],
        phone: [''],
        account: [''],
      }),
      summary: [''],
      finalDecision: ['Conforme', Validators.required],
      technicianSignature: [''],
    });

    // Ajouter les contrôles dynamiques pour chaque élément
    this.addDynamicControls();
  }

  ngOnInit() {
    (async () => {
      this.examId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.examId;

      await this.loadData();

      this.generateExamNumber();
      this.setDefaultDate();
      this.initializeExpandedCategories();

      if (this.isEditMode && this.examId) {
        await this.loadExam();
      }
    })();
  }

  private addDynamicControls(): void {
    // Ajouter des contrôles pour chaque élément de vérification
    this.examCategories.forEach((category) => {
      category.items.forEach((item) => {
        this.examForm.addControl(
          `compliance_${item.id}`,
          this.fb.control(false)
        );
        this.examForm.addControl(`quantity_${item.id}`, this.fb.control(0));
        this.examForm.addControl(
          `postRepair_${item.id}`,
          this.fb.control(false)
        );
      });
    });
  }

  private async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      [this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      this.notificationService.showError('Échec du chargement des données.');
    } finally {
      this.isLoading = false;
    }
  }

  private generateExamNumber(): void {
    const examNumber = this.garageDataService.generateUniqueNumber('EX');
    this.examForm.patchValue({ examNumber });
  }

  private setDefaultDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.examForm.patchValue({ date: today });
  }

  private initializeExpandedCategories(): void {
    this.examCategories.forEach((category) => {
      this.expandedCategories[category.key] = false;
    });
  }

  toggleCategory(categoryKey: string): void {
    this.expandedCategories[categoryKey] =
      !this.expandedCategories[categoryKey];
  }

  async onClientSelected(event: any): Promise<void> {
    const clientId = event.target.value;
    if (!clientId) {
      this.selectedClientVehicles = [];
      this.examForm.patchValue({
        vehicleId: '',
        clientName: '',
        clientPhone: '',
        vehicleMake: '',
        vehicleRegistration: '',
      });
      return;
    }

    try {
      // Récupérer les véhicules du client sélectionné
      this.selectedClientVehicles = this.vehicles.filter(
        (v) => v.clientId === clientId
      );

      // Récupérer les informations du client
      const selectedClient = this.clients.find((c) => c.id === clientId);
      if (selectedClient) {
        this.examForm.patchValue({
          clientName: `${selectedClient.firstName} ${selectedClient.lastName}`,
          clientPhone: selectedClient.phone || '',
        });
      }
    } catch (error) {
      console.error(
        'Erreur lors du chargement des véhicules du client:',
        error
      );
      this.notificationService.showError(
        'Erreur lors du chargement des véhicules du client'
      );
    }
  }

  onVehicleSelected(event: any): void {
    const vehicleId = event.target.value;
    if (!vehicleId) {
      this.examForm.patchValue({
        vehicleMake: '',
        vehicleRegistration: '',
      });
      return;
    }

    const selectedVehicle = this.selectedClientVehicles.find(
      (v) => v.id === vehicleId
    );
    if (selectedVehicle) {
      this.examForm.patchValue({
        vehicleMake: selectedVehicle.brand,
        vehicleRegistration: selectedVehicle.licensePlate,
      });
    }
  }

  private async loadExam(): Promise<void> {
    try {
      const exam = await this.garageDataService.getById<VehicleExam>(
        'exams',
        this.examId!
      );
      if (exam) {
        this.examForm.patchValue({
          examNumber: exam.examNumber,
          date: new FirestoreDatePipeTS().transform(exam.date),
          clientId: exam.clientId,
          vehicleId: exam.vehicleId,
          clientName: exam.clientName,
          clientPhone: exam.clientPhone,
          vehicleMake: exam.vehicleMake,
          vehicleRegistration: exam.vehicleRegistration,
          driver: exam.driver || { name: '', phone: '', account: '' },
          summary: exam.summary,
          finalDecision: exam.finalDecision,
          technicianSignature: exam.technicianSignature,
        });

        // Charger les véhicules du client sélectionné
        if (exam.clientId) {
          this.selectedClientVehicles = this.vehicles.filter(
            (v) => v.clientId === exam.clientId
          );
        }

        // Charger les vérifications techniques
        if (exam.technicalChecks) {
          exam.technicalChecks.forEach((check) => {
            this.examForm.patchValue({
              [`compliance_${check.id}`]: check.compliance,
              [`quantity_${check.id}`]: check.quantity || 0,
              [`postRepair_${check.id}`]: check.postRepairVerification || false,
            });
          });
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'examen:", error);
      this.notificationService.showError("Échec du chargement de l'examen.");
    }
  }

  async onSubmit(): Promise<void> {
    if (this.examForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.examForm.value;

      // Construire les vérifications techniques
      const technicalChecks: TechnicalCheck[] = [];
      this.examCategories.forEach((category) => {
        category.items.forEach((item) => {
          technicalChecks.push({
            id: item.id,
            category: item.category,
            categoryName: category.name,
            itemName: item.name,
            verificationRequired: item.verificationRequired,
            compliance: formValue[`compliance_${item.id}`] || false,
            quantity: formValue[`quantity_${item.id}`] || 0,
            postRepairVerification: formValue[`postRepair_${item.id}`] || false,
          });
        });
      });

      const examData: Omit<VehicleExam, 'id'> = {
        examNumber: formValue.examNumber,
        date: new Date(formValue.date),
        clientId: formValue.clientId,
        vehicleId: formValue.vehicleId,
        garageId: '', // À récupérer depuis le garage actuel
        clientName: formValue.clientName,
        clientPhone: formValue.clientPhone,
        vehicleMake: formValue.vehicleMake,
        vehicleRegistration: formValue.vehicleRegistration,
        driver: formValue.driver,
        technicalChecks: technicalChecks,
        summary: formValue.summary,
        finalDecision: formValue.finalDecision,
        technicianSignature: formValue.technicianSignature,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (this.isEditMode && this.examId) {
        await this.garageDataService.update('exams', this.examId, examData);
        this.notificationService.showSuccess('Examen mis à jour avec succès');
      } else {
        await this.garageDataService.create('exams', examData);
        this.notificationService.showSuccess('Examen créé avec succès');
      }

      this.router.navigate(['/exams']);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'examen:", error);
      this.notificationService.showError("Échec de sauvegarde de l'examen");
    } finally {
      this.isLoading = false;
    }
  }

  getButtonText(): string {
    return this.isEditMode ? "Modifier l'examen" : "Créer l'examen";
  }

  goBack(): void {
    this.router.navigate(['/exams']);
  }
}
