import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Client, Vehicle, Visit } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Diagnostic } from '../../models/diagnostic.model';
import { User } from '../../models/user.model';
import { firstValueFrom } from 'rxjs';
import { Personnel } from '../../models/garage.model';


@Component({
  selector: 'app-diagnostic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6" *ngIf="visit && vehicle && client">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create Diagnostic Report
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }}
          </p>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="diagnosticForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Technician Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-lg font-medium text-blue-900 mb-3">Technician Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="currentTechnician">
              <div>
                <label class="text-sm font-medium text-blue-700">Technician Name</label>
                <p class="mt-1 text-sm text-blue-900 font-medium">
                  {{ currentTechnician.firstName }} {{ currentTechnician.lastName }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-blue-700">Specializations</label>
                <p class="mt-1 text-sm text-blue-900">
                  {{ currentTechnician.specializations?.join(', ') || 'General' }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-blue-700">Phone</label>
                <p class="mt-1 text-sm text-blue-900">{{ currentTechnician.phone }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-blue-700">Email</label>
                <p class="mt-1 text-sm text-blue-900">{{ currentTechnician.email }}</p>
              </div>
            </div>
          </div>

          <!-- Category Selection -->
          <div>
            <label class="form-label">Diagnostic Category *</label>
            <select
              formControlName="category"
              class="form-input"
              [class.border-red-500]="diagnosticForm.get('category')?.invalid && diagnosticForm.get('category')?.touched"
            >
              <option value="">Select a category</option>
              <option value="Brakes">Brakes</option>
              <option value="Engine">Engine</option>
              <option value="Electrical">Electrical</option>
              <option value="Transmission">Transmission</option>
              <option value="Suspension">Suspension</option>
              <option value="Cooling">Cooling</option>
              <option value="Exhaust">Exhaust</option>
              <option value="Fuel">Fuel</option>
              <option value="Steering">Steering</option>
              <option value="Other">Other</option>
            </select>
            <div *ngIf="diagnosticForm.get('category')?.invalid && diagnosticForm.get('category')?.touched" class="mt-1 text-sm text-red-600">
              Please select a category
            </div>
          </div>

          <!-- Diagnostic Checks -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Diagnostic Checks *</label>
              <button
                type="button"
                (click)="addCheck()"
                class="btn-secondary text-sm"
              >
                Add Check
              </button>
            </div>

            <div formArrayName="checks" class="space-y-4">
              <div *ngFor="let check of checksArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="md:col-span-2">
                    <label class="form-label">Description *</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="form-input"
                      placeholder="Describe what was checked"
                    />
                  </div>

                  <div>
                    <label class="form-label">Compliant</label>
                    <select formControlName="compliant" class="form-input">
                      <option [value]="true">Yes - Compliant</option>
                      <option [value]="false">No - Non-Compliant</option>
                    </select>
                  </div>

                  <div>
                    <label class="form-label">Severity Level</label>
                    <select formControlName="severityLevel" class="form-input">
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
                    <select formControlName="postRepairVerification" class="form-input">
                      <option [value]="false">No</option>
                      <option [value]="true">Yes</option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="form-label">Comments</label>
                    <textarea
                      formControlName="comments"
                      rows="2"
                      class="form-input"
                      placeholder="Additional comments or observations"
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
                    Remove Check
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary -->
          <div>
            <label class="form-label">Summary *</label>
            <textarea
              formControlName="summary"
              rows="4"
              class="form-input"
              [class.border-red-500]="diagnosticForm.get('summary')?.invalid && diagnosticForm.get('summary')?.touched"
              placeholder="Provide a comprehensive summary of the diagnostic findings"
            ></textarea>
            <div *ngIf="diagnosticForm.get('summary')?.invalid && diagnosticForm.get('summary')?.touched" class="mt-1 text-sm text-red-600">
              Summary is required
            </div>
          </div>

          <!-- Final Decision -->
          <div>
            <label class="form-label">Final Decision *</label>
            <select
              formControlName="finalDecision"
              class="form-input"
              [class.border-red-500]="diagnosticForm.get('finalDecision')?.invalid && diagnosticForm.get('finalDecision')?.touched"
            >
              <option value="">Select final decision</option>
              <option value="Repair">Repair Required</option>
              <option value="Monitor">Monitor Condition</option>
              <option value="NonRepairable">Non-Repairable</option>
            </select>
            <div *ngIf="diagnosticForm.get('finalDecision')?.invalid && diagnosticForm.get('finalDecision')?.touched" class="mt-1 text-sm text-red-600">
              Final decision is required
            </div>
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
              [disabled]="diagnosticForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Saving...</span>
              Create Diagnostic Report
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class DiagnosticFormComponent implements OnInit {
  diagnosticForm: FormGroup;
  visit: Visit | null = null;
  vehicle: Vehicle | null = null;
  client: Client | null = null;
  personnel: Personnel[] = [];
  currentTechnician: Personnel | null = null;
  visitId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.diagnosticForm = this.fb.group({
      category: ['', Validators.required],
      checks: this.fb.array([this.createCheckGroup()]),
      summary: ['', Validators.required],
      finalDecision: ['', Validators.required]
    });
  }

  get checksArray(): FormArray {
    return this.diagnosticForm.get('checks') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    this.visitId = this.route.snapshot.paramMap.get('visitId');
    if (this.visitId) {
      await this.loadVisitData();
      await this.loadPersonnel();
      await this.loadCurrentTechnician();
    }
  }

  private async loadVisitData(): Promise<void> {
    try {
      this.visit = await this.garageDataService.getById<Visit>('visits', this.visitId!);

      if (this.visit) {
        [this.vehicle, this.client] = await Promise.all([
          this.garageDataService.getById<Vehicle>('vehicles', this.visit.vehicleId),
          this.garageDataService.getById<Client>('clients', this.visit.clientId)
        ]);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load visit data');
    }
  }

  private async loadPersonnel(): Promise<void> {
    try {
      this.personnel = await this.garageDataService.getWithFilter<Personnel>('personnel', [
        { field: 'role', operator: '==', value: 'Technician' },
        { field: 'isActive', operator: '==', value: true }
      ]);

      console.log(this.personnel);

    } catch (error) {
      this.notificationService.showError('Failed to load personnel');
    }
  }

  private async loadCurrentTechnician(): Promise<void> {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (currentUser) {
        this.currentTechnician = await this.garageDataService.getById<Personnel>('personnel', currentUser.uid);
      }
    } catch (error) {
      console.error('Error loading current technician:', error);
    }
  }

  private createCheckGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      description: ['', Validators.required],
      compliant: [true],
      quantity: [1],
      severityLevel: ['Low'],
      postRepairVerification: [false],
      comments: ['']
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

      const formValue = this.diagnosticForm.value;
      const diagnosticData: Omit<Diagnostic, 'id'> = {
        garageId: currentUser.garageId,
        visitId: this.visitId!,
        vehicleId: this.visit.vehicleId,
        technicianId: currentUser.uid,
        category: formValue.category,
        checks: formValue.checks,
        summary: formValue.summary,
        finalDecision: formValue.finalDecision,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.garageDataService.create('diagnostics', diagnosticData);

      // Update visit status
      await this.garageDataService.update('visits', this.visitId!, {
        status: 'Completed'
      });

      this.notificationService.showSuccess('Diagnostic report created successfully');
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