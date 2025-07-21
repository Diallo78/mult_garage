import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { Garage, GarageSettings } from '../../models/user.model';
import { UserManagementService } from '../../services/user-management.service';

@Component({
  selector: 'app-garage-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Setup Your Garage</h1>
          <p class="mt-2 text-lg text-gray-600">Configure your garage information and settings</p>
        </div>

        <div class="card">
          <form [formGroup]="garageForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <!-- Basic Information -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Garage Name *</label>
                  <input
                    type="text"
                    formControlName="name"
                    class="form-input"
                    placeholder="Enter garage name"
                  />
                </div>
                <div>
                  <label class="form-label">Email *</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="form-input"
                    placeholder="garage@example.com"
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
                <div>
                  <label class="form-label">Website</label>
                  <input
                    type="url"
                    formControlName="website"
                    class="form-input"
                    placeholder="https://yourgarage.com"
                  />
                </div>
                <div>
                  <label class="form-label">Prénom *</label>
                  <input
                    type="text"
                    formControlName="firstName"
                    class="form-input"
                    placeholder="Prénom de l'administrateur"
                  />
                </div>
                <div>
                  <label class="form-label">Nom *</label>
                  <input
                    type="text"
                    formControlName="lastName"
                    class="form-input"
                    placeholder="Nom de l'administrateur"
                  />
                </div>
                <div>
                  <label class="form-label">Mot de passe *</label>
                  <input
                    type="password"
                    formControlName="password"
                    class="form-input"
                    placeholder="Mot de passe (min. 6 caractères)"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Address *</label>
                  <textarea
                    formControlName="address"
                    rows="3"
                    class="form-input"
                    placeholder="Complete address"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Business Information -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">SIRET Number</label>
                  <input
                    type="text"
                    formControlName="siret"
                    class="form-input"
                    placeholder="SIRET number"
                  />
                </div>
                <div>
                  <label class="form-label">VAT Number</label>
                  <input
                    type="text"
                    formControlName="vatNumber"
                    class="form-input"
                    placeholder="VAT number"
                  />
                </div>
              </div>
            </div>

            <!-- Settings -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Default Settings</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="form-label">Currency</label>
                  <select formControlName="currency" class="form-input">
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="XOF">CFA Franc (CFA)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Default VAT Rate (%)</label>
                  <input
                    type="number"
                    formControlName="defaultVatRate"
                    class="form-input"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <label class="form-label">Invoice Prefix</label>
                  <input
                    type="text"
                    formControlName="invoicePrefix"
                    class="form-input"
                    placeholder="INV"
                  />
                </div>
              </div>
            </div>

            <!-- Working Hours -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Working Hours</h2>
              <div class="space-y-4">
                <div *ngFor="let day of weekDays" class="flex items-center space-x-4">
                  <div class="w-24">
                    <label class="text-sm font-medium text-gray-700">{{ day.label }}</label>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      [formControlName]="day.key + 'IsOpen'"
                      class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span class="text-sm text-gray-600">Open</span>
                  </div>
                  <div class="flex items-center space-x-2" *ngIf="garageForm.get(day.key + 'IsOpen')?.value">
                    <input
                      type="time"
                      [formControlName]="day.key + 'OpenTime'"
                      class="form-input w-32"
                    />
                    <span class="text-sm text-gray-600">to</span>
                    <input
                      type="time"
                      [formControlName]="day.key + 'CloseTime'"
                      class="form-input w-32"
                    />
                  </div>
                </div>
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
                [disabled]="garageForm.invalid || isLoading"
                class="btn-primary"
              >
                <span *ngIf="isLoading" class="mr-2">Creating...</span>
                Create Garage
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class GarageSetupComponent implements OnInit {
  garageForm: FormGroup;
  isLoading = false;

  weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly userManagementService: UserManagementService
  ) {
    this.garageForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      website: [''],
      siret: [''],
      vatNumber: [''],
      currency: ['EUR'],
      defaultVatRate: [20],
      invoicePrefix: ['INV'],
      // Nouveaux champs utilisateur
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Working hours
      mondayIsOpen: [true],
      mondayOpenTime: ['08:00'],
      mondayCloseTime: ['18:00'],
      tuesdayIsOpen: [true],
      tuesdayOpenTime: ['08:00'],
      tuesdayCloseTime: ['18:00'],
      wednesdayIsOpen: [true],
      wednesdayOpenTime: ['08:00'],
      wednesdayCloseTime: ['18:00'],
      thursdayIsOpen: [true],
      thursdayOpenTime: ['08:00'],
      thursdayCloseTime: ['18:00'],
      fridayIsOpen: [true],
      fridayOpenTime: ['08:00'],
      fridayCloseTime: ['18:00'],
      saturdayIsOpen: [false],
      saturdayOpenTime: ['08:00'],
      saturdayCloseTime: ['12:00'],
      sundayIsOpen: [false],
      sundayOpenTime: [''],
      sundayCloseTime: ['']
    });
  }

  ngOnInit(): void {}

  async onSubmit(): Promise<void> {
    if (this.garageForm.invalid) return;

    this.isLoading = true;

    try {
      // Récupérer les valeurs du formulaire
      const garageFormValue = this.garageForm.value;

      // Demander à l'utilisateur de saisir un mot de passe, prénom, nom, ou les récupérer d'un autre formulaire
      const password = garageFormValue.password; // à ajouter dans le formulaire !
      const firstName = garageFormValue.firstName; // à ajouter dans le formulaire !
      const lastName = garageFormValue.lastName; // à ajouter dans le formulaire !

      // Construire les horaires
      const workingHours: any = {};
      this.weekDays.forEach(day => {
        workingHours[day.key] = {
          isOpen: garageFormValue[day.key + 'IsOpen'],
          openTime: garageFormValue[day.key + 'OpenTime'] || '',
          closeTime: garageFormValue[day.key + 'CloseTime'] || ''
        };
      });

      // Construire les settings
      const settings: GarageSettings = {
        currency: garageFormValue.currency,
        defaultVatRate: garageFormValue.defaultVatRate,
        invoicePrefix: garageFormValue.invoicePrefix,
        quotePrefix: 'QT',
        workingHours,
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: true,
          paymentReminders: true
        }
      };

      // Appel à la méthode de création
      const { garageId, userId } = await this.userManagementService.createGarageAccount({
        name: garageFormValue.name,
        address: garageFormValue.address,
        phone: garageFormValue.phone,
        email: garageFormValue.email,
        website: garageFormValue.website,
        siret: garageFormValue.siret,
        vatNumber: garageFormValue.vatNumber,
        settings,
        ownerId: '', // sera mis à jour dans le service
        createdAt: new Date(),
        updatedAt: new Date(),
        password,
        firstName,
        lastName
      });

      // Optionnel : mettre à jour le profil utilisateur courant si besoin
      // await this.authService.updateUserProfile({ garageId });

      this.notificationService.showSuccess('Garage créé avec succès !');
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.notificationService.showError(error?.message || 'Erreur lors de la création du garage');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }
}
