import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client, Vehicle } from '../../models/client.model';
import { AuthService } from '../../services/auth.service';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditMode ? 'Modifier le véhicule' : 'Ajouter un nouveau véhicule' }}
          </h2>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="vehicleForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div>
            <label class="form-label">Propriétaire *</label>
            <select
              formControlName="clientId"
              class="form-input"
              [class.border-red-500]="vehicleForm.get('clientId')?.invalid && vehicleForm.get('clientId')?.touched"
            >
              <option value="">Sélectionner un client</option>
              <option *ngFor="let client of clients" [value]="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
            <div *ngIf="vehicleForm.get('clientId')?.invalid && vehicleForm.get('clientId')?.touched" class="mt-1 text-sm text-red-600">
              Veuillez sélectionner un client
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Marque *</label>
              <input
                type="text"
                formControlName="brand"
                class="form-input"
                [class.border-red-500]="vehicleForm.get('brand')?.invalid && vehicleForm.get('brand')?.touched"
                placeholder="ex : Toyota, BMW, Mercedes"
              />
              <div *ngIf="vehicleForm.get('brand')?.invalid && vehicleForm.get('brand')?.touched" class="mt-1 text-sm text-red-600">
                La marque est obligatoire
              </div>
            </div>

            <div>
              <label class="form-label">Modèle *</label>
              <input
                type="text"
                formControlName="model"
                class="form-input"
                [class.border-red-500]="vehicleForm.get('model')?.invalid && vehicleForm.get('model')?.touched"
                placeholder="ex : Camry, X5, Classe C"
              />
              <div *ngIf="vehicleForm.get('model')?.invalid && vehicleForm.get('model')?.touched" class="mt-1 text-sm text-red-600">
                Le modèle est obligatoire
              </div>
            </div>

            <div>
              <label class="form-label">Plaque d'immatriculation *</label>
              <input
                type="text"
                formControlName="licensePlate"
                class="form-input"
                [class.border-red-500]="vehicleForm.get('licensePlate')?.invalid && vehicleForm.get('licensePlate')?.touched"
                placeholder="Entrer le numéro de la plaque"
              />
              <div *ngIf="vehicleForm.get('licensePlate')?.invalid && vehicleForm.get('licensePlate')?.touched" class="mt-1 text-sm text-red-600">
                La plaque est obligatoire
              </div>
            </div>

            <div>
              <label class="form-label">Année *</label>
              <input
                type="number"
                formControlName="year"
                class="form-input"
                [class.border-red-500]="vehicleForm.get('year')?.invalid && vehicleForm.get('year')?.touched"
                placeholder="ex : 2020"
                min="1900"
                [max]="currentYear + 1"
              />
              <div *ngIf="vehicleForm.get('year')?.invalid && vehicleForm.get('year')?.touched" class="mt-1 text-sm text-red-600">
                Veuillez entrer une année valide
              </div>
            </div>

            <div>
              <label class="form-label">Couleur</label>
              <input
                type="text"
                formControlName="color"
                class="form-input"
                placeholder="ex : Rouge, Bleu, Argent"
              />
            </div>

            <div>
              <label class="form-label">Kilométrage (km)</label>
              <input
                type="number"
                formControlName="mileage"
                class="form-input"
                placeholder="Kilométrage actuel"
                min="0"
              />
            </div>
          </div>

          <div>
            <label class="form-label">Numéro VIN (Numéro d'identification du véhicule)</label>
            <input
              type="text"
              formControlName="vin"
              class="form-input"
              placeholder="VIN de 17 caractères"
              maxlength="17"
            />
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              (click)="goBack()"
              class="btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="vehicleForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Enregistrement...</span>
              {{ isEditMode ? 'Mettre à jour le véhicule' : 'Créer le véhicule' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  `
})
export class VehicleFormComponent implements OnInit {
  vehicleForm: FormGroup;
  clients: Client[] = [];
  isEditMode = false;
  _isLoading = true;
  isLoading = false;
  vehicleId: string | null = null;
  currentYear = new Date().getFullYear();

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService
  ) {
    this.vehicleForm = this.fb.group({
      clientId: ['', Validators.required],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      licensePlate: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(this.currentYear + 1)]],
      color: [''],
      vin: [''],
      mileage: ['']
    });
  }

 ngOnInit() {

    (async() =>{
      this.vehicleId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.vehicleId;
      await this.loadClients();

      // Pre-select client if provided in query params
      const clientId = this.route.snapshot.queryParamMap.get('clientId');
      if (clientId) {
        this.vehicleForm.patchValue({ clientId });
      }

      if (this.isEditMode && this.vehicleId) {
        await this.loadVehicle();
      }
    })()

  }

  private async loadClients(): Promise<void> {
    try {
      if (this.authService.isClient) {
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          // Utiliser le service de gestion des utilisateurs
          const client = (await this.userManagementService.getClientByUserId(
            currentUser.uid
          )) as Client;
          this.clients.push(client);
        }
      }
      else {
        this.clients = await this.garageDataService.getAll<Client>('clients');
      }
    } catch (error) {
      this.notificationService.showError('Failed to load clients ' + error);
    } finally { this._isLoading = false }
  }

  private async loadVehicle(): Promise<void> {
    try {
      const vehicle = await this.garageDataService.getById<Vehicle>('vehicles', this.vehicleId!);
      if (vehicle) {
        this.vehicleForm.patchValue(vehicle);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load vehicle data ' + error);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.vehicleForm.invalid) return;

    this.isLoading = true;

    try {
      const vehicleData = this.vehicleForm.value;

      if (this.isEditMode && this.vehicleId) {
        await this.garageDataService.update('vehicles', this.vehicleId, vehicleData);
        this.notificationService.showSuccess('Vehicle updated successfully');
      } else {
        await this.garageDataService.create('vehicles', vehicleData);
        this.notificationService.showSuccess('Vehicle created successfully');
      }

      this.router.navigate(['/vehicles']);
    } catch (error) {
      this.notificationService.showError('Failed to save vehicle ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }
}