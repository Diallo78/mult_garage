import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { UserManagementService } from '../../services/user-management.service';


@Component({
  selector: 'app-visit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditMode ? 'Edit Visit' : 'New Visit' }}
          </h2>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="visitForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Visit Date -->
          <div>
            <label class="form-label">Visit Date *</label>
            <input
              type="datetime-local"
              formControlName="visitDate"
              class="form-input"
              [class.border-red-500]="visitForm.get('visitDate')?.invalid && visitForm.get('visitDate')?.touched"
            />
            <div *ngIf="visitForm.get('visitDate')?.invalid && visitForm.get('visitDate')?.touched" class="mt-1 text-sm text-red-600">
              Visit date is required
            </div>
          </div>

          <!-- Client Selection -->
          <div>
            <label class="form-label">Client *</label>
            <select
              formControlName="clientId"
              (change)="onClientChange()"
              class="form-input"
              [class.border-red-500]="visitForm.get('clientId')?.invalid && visitForm.get('clientId')?.touched"
            >
              <option value="">Select a client</option>
              <option *ngFor="let client of clients" [value]="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
            <div *ngIf="visitForm.get('clientId')?.invalid && visitForm.get('clientId')?.touched" class="mt-1 text-sm text-red-600">
              Please select a client
            </div>
          </div>

          <!-- Vehicle Selection -->
          <div>
            <label class="form-label">Vehicle *</label>
            <select
              formControlName="vehicleId"
              class="form-input"
              [class.border-red-500]="visitForm.get('vehicleId')?.invalid && visitForm.get('vehicleId')?.touched"
              [disabled]="!selectedClientVehicles.length"
            >
              <option value="">Select a vehicle</option>
              <option *ngFor="let vehicle of selectedClientVehicles" [value]="vehicle.id">
                {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.licensePlate }})
              </option>
            </select>
            <div *ngIf="visitForm.get('vehicleId')?.invalid && visitForm.get('vehicleId')?.touched" class="mt-1 text-sm text-red-600">
              Please select a vehicle
            </div>
          </div>

          <!-- Driver Information -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Driver Information (Optional)</h3>
            <div formGroupName="driver" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Driver Name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="form-input"
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <label class="form-label">Driver Phone</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-input"
                  placeholder="Enter driver phone"
                />
              </div>
              <div>
                <label class="form-label">License Number</label>
                <input
                  type="text"
                  formControlName="licenseNumber"
                  class="form-input"
                  placeholder="Enter license number"
                />
              </div>
            </div>
          </div>

          <!-- Reported Issues -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Reported Issues *</label>
              <button
                type="button"
                (click)="addIssue()"
                class="btn-secondary text-sm"
              >
                Add Issue
              </button>
            </div>
            <div formArrayName="reportedIssues" class="space-y-3">
              <div *ngFor="let issue of reportedIssuesArray.controls; let i = index" class="flex items-center space-x-3">
                <input
                  type="text"
                  [formControlName]="i"
                  class="form-input flex-1"
                  placeholder="Describe the issue"
                />
                <button
                  type="button"
                  (click)="removeIssue(i)"
                  class="text-red-600 hover:text-red-900"
                  [disabled]="reportedIssuesArray.length === 1"
                >
                  Remove
                </button>
              </div>
            </div>
            <div *ngIf="reportedIssuesArray.invalid && reportedIssuesArray.touched" class="mt-1 text-sm text-red-600">
              At least one issue must be reported
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="form-label">Status</label>
            <select formControlName="status" class="form-input">
              <option value="Pending">Pending</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              (click)="goBack()"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="visitForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Saving...</span>
              {{ isEditMode ? 'Update Visit' : 'Create Visit' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VisitFormComponent implements OnInit {
  visitForm: FormGroup;
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  selectedClientVehicles: Vehicle[] = [];
  isEditMode = false;
  isLoading = false;
  visitId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService,
  ) {
    this.visitForm = this.fb.group({
      visitDate: ['', Validators.required],
      clientId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      driver: this.fb.group({
        name: [''],
        phone: [''],
        licenseNumber: ['']
      }),
      reportedIssues: this.fb.array([this.fb.control('', Validators.required)]),
      status: ['Pending']
    });
  }

  get reportedIssuesArray(): FormArray {
    return this.visitForm.get('reportedIssues') as FormArray;
  }

  ngOnInit() {
    (async () => {

      this.visitId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.visitId;

      if (this.authService.isClient)
        await this.loadDataClient();
      else
        await this.loadDataGarage();

      // Présélectionnez le client et le véhicule si fournis dans les paramètres de requête
      const clientId = this.route.snapshot.queryParamMap.get('clientId');
      const vehicleId = this.route.snapshot.queryParamMap.get('vehicleId');

      if (clientId) {
        this.visitForm.patchValue({ clientId });
        this.onClientChange();
      }

      if (vehicleId) {
        this.visitForm.patchValue({ vehicleId });
      }

      if (this.isEditMode && this.visitId) {
        await this.loadVisit();
      }
    })();
  }

  private async loadDataClient(): Promise<void> {
    this.isLoading = true;
    try {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Utiliser le service de gestion des utilisateurs
        const client = (await this.userManagementService.getClientByUserId(
          currentUser.uid
        )) as Client;
        console.log(client);


        if (client) {
          // Étape 1 : récupérer les véhicules du client
          this.vehicles = await this.garageDataService.getWithFilter<Vehicle>(
            'vehicles',
            [{ field: 'clientId', operator: '==', value: client.id }]
          );
          this.clients.push(client);
        }
      }

      [this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
    } catch (error) {
      this.notificationService.showError('Échec du chargement des données. ' + error);
      console.log('Échec du chargement des données ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadDataGarage(): Promise<void> {
    this.isLoading = true;
    try {
      [this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles'),
      ]);
    } catch (error) {
      this.notificationService.showError('Échec du chargement des données. ' + error);
      console.log('Échec du chargement des données ' + error);
    } finally {
      this.isLoading = false;
    }
  }
  private async loadVisit(): Promise<void> {
    try {
      const visit = await this.garageDataService.getById<Visit>('visits', this.visitId!);
      if (visit) {
        // Clear existing issues
        while (this.reportedIssuesArray.length > 0) {
          this.reportedIssuesArray.removeAt(0);
        }

        // Add issues from visit
        visit.reportedIssues.forEach(issue => {
          this.reportedIssuesArray.push(this.fb.control(issue, Validators.required));
        });

        this.visitForm.patchValue({
          visitDate: new Date(visit.visitDate).toISOString().slice(0, 16),
          clientId: visit.clientId,
          vehicleId: visit.vehicleId,
          status: visit.status
        });

        this.onClientChange();
      }
    } catch (error) {
      this.notificationService.showError('Failed to load visit data');
    }
  }

  onClientChange(): void {
    const clientId = this.visitForm.get('clientId')?.value;
    if (clientId) {
      this.selectedClientVehicles = this.vehicles.filter(v => v.clientId === clientId);
      // Reset vehicle selection if current vehicle doesn't belong to selected client
      const currentVehicleId = this.visitForm.get('vehicleId')?.value;
      if (currentVehicleId && !this.selectedClientVehicles.find(v => v.id === currentVehicleId)) {
        this.visitForm.patchValue({ vehicleId: '' });
      }
    } else {
      this.selectedClientVehicles = [];
      this.visitForm.patchValue({ vehicleId: '' });
    }
  }

  addIssue(): void {
    this.reportedIssuesArray.push(this.fb.control('', Validators.required));
  }

  removeIssue(index: number): void {
    if (this.reportedIssuesArray.length > 1) {
      this.reportedIssuesArray.removeAt(index);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.visitForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.visitForm.value;
      const visitData = {
        visitDate: new Date(formValue.visitDate),
        clientId: formValue.clientId,
        vehicleId: formValue.vehicleId,
        reportedIssues: formValue.reportedIssues.filter((issue: string) => issue.trim()),
        status: formValue.status,
        ...(formValue.driver.name && { driverId: formValue.driver })
      };

      if (this.isEditMode && this.visitId) {
        await this.garageDataService.update('visits', this.visitId, visitData);
        this.notificationService.showSuccess('Visit updated successfully');
      } else {
        await this.garageDataService.create('visits', visitData);
        this.notificationService.showSuccess('Visit created successfully');
      }

      this.router.navigate(['/visits']);
    } catch (error) {
      this.notificationService.showError('Failed to save visit');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/visits']);
  }
}