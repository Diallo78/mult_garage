import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { UserManagementService } from '../../services/user-management.service';
import { Permission, UserRole } from '../../models/user.model';
import { Personnel } from '../../models/garage.model';

@Component({
  selector: 'app-personnel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditMode ? 'Edit Employee' : 'Add New Employee' }}
          </h2>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="personnelForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Personal Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="form-label">First Name *</label>
                <input
                  type="text"
                  formControlName="firstName"
                  class="form-input"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label class="form-label">Last Name *</label>
                <input
                  type="text"
                  formControlName="lastName"
                  class="form-input"
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label class="form-label">Email *</label>
                <input
                  type="email"
                  formControlName="email"
                  class="form-input"
                  placeholder="employee@garage.com"
                />
              </div>
              <div>
                <label class="form-label">Phone *</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-input"
                  placeholder="Phone number"
                />
              </div>
            </div>
          </div>

          <!-- Job Information -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Job Information</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="form-label">Role *</label>
                <select
                  formControlName="role"
                  class="form-input"
                >
                  <option value="">Select role</option>
                  <option value="AdminGarage">Admin Garage</option>
                  <option value="Manager">Manager</option>
                  <option value="Technician">Technician</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>
              <div>
                <label class="form-label">Hire Date *</label>
                <input
                  type="date"
                  formControlName="hireDate"
                  class="form-input"
                />
              </div>
              <div>
                <label class="form-label">Monthly Salary</label>
                <input
                  type="number"
                  formControlName="salary"
                  class="form-input"
                  placeholder="Optional"
                  min="0"
                />
              </div>
            </div>
          </div>

          <!-- Account Creation Option -->
          <div class="border rounded-lg p-4 bg-blue-50" *ngIf="!isEditMode">
            <div class="flex items-center">
              <input
                type="checkbox"
                [(ngModel)]="createAccount"
                [ngModelOptions]="{standalone: true}"
                id="createAccount"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="createAccount" class="ml-2 text-sm text-gray-700">
                Create user account for employee (recommended)
              </label>
            </div>
            <p class="mt-2 text-xs text-gray-600">
              This will create a user account allowing the employee to access the system based on their role and permissions.
              A password reset email will be sent to the employee.
            </p>
          </div>

          <!-- Specializations -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Specializations</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div *ngFor="let spec of availableSpecializations" class="flex items-center">
                <input
                  type="checkbox"
                  [id]="spec.key"
                  [value]="spec.value"
                  (change)="onSpecializationChange($event)"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label [for]="spec.key" class="ml-2 text-sm text-gray-700">{{ spec.label }}</label>
              </div>
            </div>
          </div>

          <!-- Permissions -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
            <div class="space-y-4">
              <div *ngFor="let module of modules" class="border rounded-lg p-4">
                <h4 class="font-medium text-gray-900 mb-3">{{ module.name }}</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div *ngFor="let action of module.actions" class="flex items-center">
                    <input
                      type="checkbox"
                      [id]="module.key + '_' + action.key"
                      [checked]="hasPermission(module.key, action.key)"
                      (change)="onPermissionChange(module.key, action.key, $event)"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label [for]="module.key + '_' + action.key" class="ml-2 text-sm text-gray-700">
                      {{ action.label }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <div class="flex items-center">
              <input
                type="checkbox"
                formControlName="isActive"
                id="isActive"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label for="isActive" class="ml-2 text-sm text-gray-700">
                Active Employee
              </label>
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
              [disabled]="personnelForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Saving...</span>
              {{ isEditMode ? 'Update Employee' : 'Add Employee' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PersonnelFormComponent implements OnInit {
  personnelForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  personnelId: string | null = null;
  selectedSpecializations: string[] = [];
  permissions: Permission[] = [];
  createAccount = true;

  availableSpecializations = [
    { key: 'engine', value: 'Engine', label: 'Engine' },
    { key: 'brakes', value: 'Brakes', label: 'Brakes' },
    { key: 'electrical', value: 'Electrical', label: 'Electrical' },
    { key: 'transmission', value: 'Transmission', label: 'Transmission' },
    { key: 'suspension', value: 'Suspension', label: 'Suspension' },
    { key: 'aircon', value: 'Air Conditioning', label: 'Air Conditioning' },
    { key: 'bodywork', value: 'Bodywork', label: 'Bodywork' },
    { key: 'painting', value: 'Painting', label: 'Painting' }
  ];

  modules = [
    {
      key: 'clients',
      name: 'Clients',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'write', label: 'Create/Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'export', label: 'Export' }
      ]
    },
    {
      key: 'vehicles',
      name: 'Vehicles',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'write', label: 'Create/Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'export', label: 'Export' }
      ]
    },
    {
      key: 'diagnostics',
      name: 'Diagnostics',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'write', label: 'Create/Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'export', label: 'Export' }
      ]
    },
    {
      key: 'quotes',
      name: 'Quotes',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'write', label: 'Create/Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'export', label: 'Export' }
      ]
    },
    {
      key: 'invoices',
      name: 'Invoices',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'write', label: 'Create/Edit' },
        { key: 'delete', label: 'Delete' },
        { key: 'export', label: 'Export' }
      ]
    },
    {
      key: 'reports',
      name: 'Reports',
      actions: [
        { key: 'read', label: 'View' },
        { key: 'export', label: 'Export' }
      ]
    }
  ];

  constructor(
    private fb: FormBuilder,
    private garageDataService: GarageDataService,
    private userManagementService: UserManagementService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.personnelForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      role: ['', Validators.required],
      hireDate: ['', Validators.required],
      salary: [''],
      isActive: [true]
    });
  }

  async ngOnInit(): Promise<void> {
    this.personnelId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.personnelId;

    if (this.isEditMode && this.personnelId) {
      await this.loadPersonnel();
    } else {
      this.setDefaultHireDate();
    }
  }

  private async loadPersonnel(): Promise<void> {
    try {
      const personnel = await this.garageDataService.getById<Personnel>('personnel', this.personnelId!);
      if (personnel) {
        this.personnelForm.patchValue({
          firstName: personnel.firstName,
          lastName: personnel.lastName,
          email: personnel.email,
          phone: personnel.phone,
          role: personnel.role,
          hireDate: new Date(personnel.hireDate).toISOString().split('T')[0],
          salary: personnel.salary,
          isActive: personnel.isActive
        });
        this.selectedSpecializations = personnel.specializations || [];
        this.permissions = personnel.permissions || [];
      }
    } catch (error) {
      this.notificationService.showError('Failed to load personnel data');
    }
  }

  private setDefaultHireDate(): void {
    const today = new Date().toISOString().split('T')[0];
    this.personnelForm.patchValue({ hireDate: today });
  }

  onSpecializationChange(event: any): void {
    const value = event.target.value;
    if (event.target.checked) {
      this.selectedSpecializations.push(value);
    } else {
      this.selectedSpecializations = this.selectedSpecializations.filter(s => s !== value);
    }
  }

  hasPermission(module: string, action: string): boolean {
    const permission = this.permissions.find(p => p.module === module);
    return permission ? permission.actions.includes(action) : false;
  }

  onPermissionChange(module: string, action: string, event: any): void {
    let permission = this.permissions.find(p => p.module === module);

    if (!permission) {
      permission = { module, actions: [] };
      this.permissions.push(permission);
    }

    if (event.target.checked) {
      if (!permission.actions.includes(action)) {
        permission.actions.push(action);
      }
    } else {
      permission.actions = permission.actions.filter((a: string) => a !== action);
      if (permission.actions.length === 0) {
        this.permissions = this.permissions.filter(p => p.module !== module);
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.personnelForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.personnelForm.value;
      const personnelData: Omit<Personnel, 'id'> = {
        garageId: '', // Will be set by the service
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        role: formValue.role as UserRole,
        specializations: this.selectedSpecializations,
        hireDate: new Date(formValue.hireDate),
        salary: formValue.salary || undefined,
        isActive: formValue.isActive,
        permissions: this.permissions,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (this.isEditMode && this.personnelId) {
        await this.garageDataService.update('personnel', this.personnelId, personnelData);
        this.notificationService.showSuccess('Employé mis à jour avec succès');
      } else {
        if (this.createAccount) {
          // Création avec compte utilisateur
          await this.userManagementService.createPersonnelAccount(personnelData);
        } else {
          // Création sans compte utilisateur
           await this.garageDataService.create('personnel', personnelData);
           this.notificationService.showSuccess('Employé ajouté avec succès');
        }
      }

      this.router.navigate(['/personnel']);
    } catch (error) {
      this.notificationService.showError('Échec de sauvegarde de l\'employé');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/personnel']);
  }
}