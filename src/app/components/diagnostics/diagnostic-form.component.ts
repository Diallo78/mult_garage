import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Diagnostic, DiagnosticCategory } from '../../models/diagnostic.model';
import { firstValueFrom } from 'rxjs';
import { Personnel } from '../../models/garage.model';


@Component({
  selector: 'app-diagnostic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  styles: `
  .form-select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  appearance: none;
}

.form-select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}
  `,
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
      <div class="space-y-6" *ngIf="visit && vehicle && client">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2
              class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
            >
              Créer un rapport de diagnostic
            </h2>
            <p class="text-lg text-gray-600">
              {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }}
              {{ client.lastName }}
            </p>
          </div>
        </div>

        <div class="card">
          <form
            [formGroup]="diagnosticForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6"
          >
            <!-- Diagnostic Title -->
            <div class="mb-4">
              <label
                for="diagnostic-title"
                class="form-label block mb-2 font-medium text-gray-700"
              >
                Titre <span class="text-red-500">*</span>
              </label>

              <select
                id="diagnostic-title"
                formControlName="title"
                class="form-select w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                [class.border-red-300]="
                  diagnosticForm.get('title')?.invalid &&
                  diagnosticForm.get('title')?.touched
                "
                [class.bg-red-50]="
                  diagnosticForm.get('title')?.invalid &&
                  diagnosticForm.get('title')?.touched
                "
                aria-describedby="title-error"
                aria-invalid="diagnosticForm.get('title')?.invalid"
              >
                <option value="" disabled selected hidden>
                  Sélectionnez un titre...
                </option>
                <option
                  *ngFor="let titre of titresDiagnostics"
                  [value]="titre"
                  [attr.selected]="
                    diagnosticForm.get('title')?.value === titre ? '' : null
                  "
                >
                  {{ titre }}
                </option>
              </select>

              <div
                *ngIf="
                  diagnosticForm.get('title')?.invalid &&
                  diagnosticForm.get('title')?.touched
                "
                id="title-error"
                class="mt-1 text-sm text-red-600 flex items-start"
                aria-live="assertive"
              >
                <svg
                  class="h-4 w-4 mr-1 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span>Veuillez sélectionner un titre dans la liste</span>
              </div>
            </div>
            <!-- <div>
              <label class="form-label">Titre *</label>
              <select
                formControlName="title"
                class="form-select w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              >
                <option *ngFor="let titre of titresDiagnostics" [value]="titre">
                  {{ titre }}
                </option>
              </select>
              <input
                  type="text"
                  formControlName="title"
                  class="form-input"
                  [class.border-red-500]="
                    diagnosticForm.get('title')?.invalid &&
                    diagnosticForm.get('title')?.touched
                  "
                  placeholder="Entrer le titre du diagnostic"
                />
              <div
                *ngIf="
                  diagnosticForm.get('title')?.invalid &&
                  diagnosticForm.get('title')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                Le titre est requis
              </div>
            </div> -->

            <!-- Technician Information -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-lg font-medium text-blue-900 mb-3">
                Informations technicien
              </h3>
              <div class="mb-4">
                <label class="text-sm font-medium text-blue-700"
                  >Sélectionner un technicien</label
                >
                <select
                  class="form-input"
                  [ngModel]="currentTechnician?.id"
                  (ngModelChange)="onTechnicianSelect($event)"
                  [ngModelOptions]="{ standalone: true }"
                >
                  <option *ngFor="let tech of personnel" [value]="tech.id">
                    {{ tech.firstName }} {{ tech.lastName }}
                  </option>
                </select>
              </div>
              <div
                class="grid grid-cols-1 md:grid-cols-2 gap-4"
                *ngIf="currentTechnician"
              >
                <div>
                  <label class="text-sm font-medium text-blue-700"
                    >Nom du technicien</label
                  >
                  <p class="mt-1 text-sm text-blue-900 font-medium">
                    {{ currentTechnician.firstName }}
                    {{ currentTechnician.lastName }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700"
                    >Spécialisations</label
                  >
                  <p class="mt-1 text-sm text-blue-900">
                    {{
                      currentTechnician.specializations?.join(', ') || 'General'
                    }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700"
                    >Téléphone</label
                  >
                  <p class="mt-1 text-sm text-blue-900">
                    {{ currentTechnician.phone }}
                  </p>
                </div>
                <div>
                  <label class="text-sm font-medium text-blue-700"
                    >E-mail</label
                  >
                  <p class="mt-1 text-sm text-blue-900">
                    {{ currentTechnician.email }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Diagnostic Checks -->
            <div>
              <div class="flex items-center justify-between mb-4">
                <label class="form-label">Vérifications *</label>
                <button
                  type="button"
                  (click)="addCheck()"
                  class="btn-secondary text-sm"
                >
                  Ajouter une vérification
                </button>
              </div>

              <div formArrayName="checks" class="space-y-4">
                <div
                  *ngFor="let check of checksArray.controls; let i = index"
                  [formGroupName]="i"
                  class="border rounded-lg p-4 bg-gray-50"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Category for each check -->
                    <div>
                      <label class="form-label">Catégorie *</label>
                      <select formControlName="category" class="form-input">
                        <option value="">Sélectionner une catégorie</option>
                        <option
                          *ngFor="let ctg of diagnosticCategory"
                          value="ctg.categorie"
                        >
                          {{ ctg.categorie }}
                        </option>
                      </select>
                    </div>
                    <div class="md:col-span-2">
                      <label class="form-label">Description *</label>
                      <input
                        type="text"
                        formControlName="description"
                        class="form-input"
                        placeholder="Décrire ce qui a été vérifié"
                      />
                    </div>

                    <div>
                      <label class="form-label">Compliant</label>
                      <select formControlName="compliant" class="form-input">
                        <option [value]="true">Oui - Conforme</option>
                        <option [value]="false">Non - Non conforme</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label">Severity Level</label>
                      <select
                        formControlName="severityLevel"
                        class="form-input"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label class="form-label">Quantity</label>
                      <input
                        type="number"
                        formControlName="quantity"
                        class="form-input"
                        min="1"
                      />
                    </div>

                    <div>
                      <label class="form-label">Post-Repair Verification</label>
                      <select
                        formControlName="postRepairVerification"
                        class="form-input"
                      >
                        <option [value]="false">Non</option>
                        <option [value]="true">Oui</option>
                      </select>
                    </div>

                    <div class="md:col-span-2">
                      <label class="form-label">Commentaires</label>
                      <textarea
                        formControlName="comments"
                        rows="2"
                        class="form-input"
                        placeholder="Commentaires ou observations supplémentaires"
                      ></textarea>
                    </div>
                  </div>

                  <div class="mt-3 flex justify-end">
                    <button
                      type="button"
                      (click)="removeCheck(i)"
                      class="text-red-600 hover:text-red-900 text-sm"
                      [disabled]="checksArray.length === 1"
                    >
                      Supprimer la vérification
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Summary -->
            <div>
              <label class="form-label">Résumé *</label>
              <textarea
                formControlName="summary"
                rows="4"
                class="form-input"
                [class.border-red-500]="
                  diagnosticForm.get('summary')?.invalid &&
                  diagnosticForm.get('summary')?.touched
                "
                placeholder="Fournir un résumé complet des résultats du diagnostic"
              ></textarea>
              <div
                *ngIf="
                  diagnosticForm.get('summary')?.invalid &&
                  diagnosticForm.get('summary')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                Le résumé est requis
              </div>
            </div>

            <!-- Final Decision -->
            <div>
              <label class="form-label">Décision finale *</label>
              <select
                formControlName="finalDecision"
                class="form-input"
                [class.border-red-500]="
                  diagnosticForm.get('finalDecision')?.invalid &&
                  diagnosticForm.get('finalDecision')?.touched
                "
              >
                <option value="">Sélectionner la décision finale</option>
                <option value="Repair">Réparation requise</option>
                <option value="Monitor">Surveiller l'état</option>
                <option value="NonRepairable">Non réparable</option>
              </select>
              <div
                *ngIf="
                  diagnosticForm.get('finalDecision')?.invalid &&
                  diagnosticForm.get('finalDecision')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La décision finale est requise
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" (click)="goBack()" class="btn-outline">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="diagnosticForm.invalid || isLoading"
                class="btn-primary"
              >
                <span *ngIf="isLoading" class="mr-2">Enregistrement...</span>
                Créer un rapport de diagnostic
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class DiagnosticFormComponent implements OnInit {
  diagnosticForm: FormGroup;
  visit: Visit | null = null;
  vehicle: Vehicle | null = null;
  client: Client | null = null;
  personnel: Personnel[] = [];
  diagnosticCategory: DiagnosticCategory[] = [];
  currentTechnician: Personnel | null = null;
  visitId: string | null = null;
  isLoading = false;

  titresDiagnostics: string[] = [
    'Diagnostic système de freinage ABS',
    'Panne démarrage moteur – Test batterie et alternateur',
    'Diagnostic voyant moteur allumé (Check Engine)',
    'Problème de surchauffe moteur',
    'Inspection et test du système d’injection',
    'Détection de fuite dans le circuit de refroidissement',
    'Bruits anormaux au niveau de la suspension',
    'Diagnostic embrayage / boîte de vitesses',
    'Contrôle des émissions de gaz d’échappement',
    'Analyse du système électrique (faisceau / fusibles / relais)',
    'Vibrations à haute vitesse – Diagnostic roues et équilibrage',
    'Inspection du système d’air conditionné (AC)',
    'Problème de direction assistée – Contrôle hydraulique',
    'Diagnostic démarrage difficile à froid',
    'Problème de direction assistée – Contrôle hydraulique',
    'Problème de consommation excessive de carburant',
    'Autres',
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.diagnosticForm = this.fb.group({
      title: ['', Validators.required], // <-- nouveau champ
      checks: this.fb.array([this.createCheckGroup()]),
      summary: ['', Validators.required],
      finalDecision: ['', Validators.required],
    });
  }

  get checksArray(): FormArray {
    return this.diagnosticForm.get('checks') as FormArray;
  }

  ngOnInit() {
    (async () => {
      this.visitId = this.route.snapshot.paramMap.get('visitId');
      if (this.visitId) {
        this.loadVisitAndPersonnelData();
      }
    })();
  }

  // private async loadVisitData(): Promise<void> {
  //   try {
  //     this.visit = await this.garageDataService.getById<Visit>('visits', this.visitId!);

  //     if (this.visit) {
  //       [this.vehicle, this.client] = await Promise.all([
  //         this.garageDataService.getById<Vehicle>('vehicles', this.visit.vehicleId),
  //         this.garageDataService.getById<Client>('clients', this.visit.clientId)
  //       ]);
  //     }
  //   } catch (error) {
  //     this.notificationService.showError('Failed to load visit data');
  //   }
  // }

  // private async loadPersonnel(): Promise<void> {
  //   try {
  //     this.personnel = await this.garageDataService.getWithFilter<Personnel>('personnel', [
  //       { field: 'role', operator: '==', value: 'Technician' },
  //       { field: 'isActive', operator: '==', value: true }
  //     ]);

  //     // console.log(this.personnel);

  //   } catch (error) {
  //     this.notificationService.showError('Failed to load personnel');
  //   }
  // }

  private async loadVisitAndPersonnelData(): Promise<void> {
    this.isLoading = true;

    try {
      // Charger la visite
      this.visit = await this.garageDataService.getById<Visit>(
        'visits',
        this.visitId!
      );

      if (this.visit) {
        // Charger le véhicule et le client en parallèle
        [this.vehicle, this.client, this.diagnosticCategory] =
          await Promise.all([
            this.garageDataService.getById<Vehicle>(
              'vehicles',
              this.visit.vehicleId
            ),
            this.garageDataService.getById<Client>(
              'clients',
              this.visit.clientId
            ),
            this.garageDataService.getAll<DiagnosticCategory>(
              'diagnosticCategory'
            ),
          ]);
      }

      // Charger le personnel (techniciens actifs)
      this.personnel = await this.garageDataService.getWithFilter<Personnel>(
        'personnel',
        [
          { field: 'role', operator: '==', value: 'Technician' },
          { field: 'isActive', operator: '==', value: true },
        ]
      );
    } catch (error) {
      this.notificationService.showError(
        'Erreur lors du chargement des données'
      );
      console.error('Chargement échoué :', error);
    } finally {
      this.isLoading = false;
    }
  }

  onTechnicianSelect(id: string) {
    this.loadCurrentTechnicianID(id);
  }

  private loadCurrentTechnicianID(id: string) {
    if (id) {
      const found = this.personnel.find((p) => p.id === id);
      if (found) {
        this.currentTechnician = found;
      }
    }
  }

  private createCheckGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      category: ['', Validators.required], // <-- nouveau champ obligatoire
      description: ['', Validators.required],
      compliant: [true],
      quantity: [1],
      severityLevel: ['Low'],
      postRepairVerification: [false],
      comments: [''],
    });
  }

  addCheck(): void {
    this.checksArray.push(this.createCheckGroup());
  }

  removeCheck(index: number): void {
    if (this.checksArray.length > 1) {
      this.checksArray.removeAt(index);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.diagnosticForm.invalid || !this.visit) return;

    this.isLoading = true;

    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);

      if (!currentUser) throw new Error('No user logged in');

      if (!this.currentTechnician) throw new Error('No user logged in');

      const formValue = this.diagnosticForm.value;
      const diagnosticData: Omit<Diagnostic, 'id'> = {
        title: formValue.title, // <-- nouveau champ
        garageId: currentUser.garageId,
        visitId: this.visitId!,
        vehicleId: this.visit.vehicleId,
        technicianId: this.currentTechnician.id,
        checks: formValue.checks,
        summary: formValue.summary,
        finalDecision: formValue.finalDecision,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.garageDataService.create('diagnostics', diagnosticData);

      // Update visit status
      await this.garageDataService.update('visits', this.visitId!, {
        status: 'Completed',
      });

      this.notificationService.showSuccess(
        'Diagnostic report created successfully'
      );
      this.router.navigate(['/diagnostics']);
    } catch (error) {
      this.notificationService.showError('Failed to create diagnostic report');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/visits']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}