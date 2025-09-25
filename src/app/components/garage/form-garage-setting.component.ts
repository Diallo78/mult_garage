import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { Garage, GarageSettings } from '../../models/user.model';
import { UserManagementService } from '../../services/user-management.service';
import { GarageDataService } from '../../services/garage-data.service';

@Component({
  selector: 'app-garage-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
      <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
        ></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Setup Your Garage</h1>
          <p class="mt-2 text-lg text-gray-600">Configure your garage information and settings</p>
        </div>

        <div class="card">
          <form [formGroup]="garageForm" (ngSubmit)="onSubmit()" class="space-y-8">
            <!-- Basic Information -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Nom du garage *</label>
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

                                <!-- Logo Upload -->
                <div>
                  <label class="form-label">Logo du garage</label>
                  <input
                    type="file"
                    (change)="onLogoSelected($event)"
                    accept="image/*"
                    class="form-input"
                  />
                </div>

                <!-- Prévisualisation du logo -->
                <div *ngIf="previewLogo" class="mt-4">
                  <p class="text-sm text-gray-600 mb-2">Aperçu :</p>
                  <img [src]="previewLogo" alt="Logo preview" class="h-24 rounded shadow" />
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

                <!-- un edit footer -->
                <div class="md:col-span-2">
                  <label class="form-label">Footer</label>
                  <textarea
                    formControlName="footer"
                    rows="3"
                    class="form-input"
                    placeholder="Footer(Pied de page)"
                  ></textarea>
                </div>
              </div>
            </div>

            <!-- Business Information -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Business Information</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Numéro SIRET</label>
                  <input
                    type="text"
                    formControlName="siret"
                    class="form-input"
                    placeholder="SIRET number"
                  />
                </div>
                <div>
                  <label class="form-label">Numéro de TVA</label>
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
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Paramètres par défaut</h2>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label class="form-label">Currency</label>
                  <select formControlName="currency" class="form-input">
                    <option value="GNF">Fran Guinée (GNF)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="XOF">CFA Franc (CFA)</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Taux de TVA par défaut (%)</label>
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
                  <label class="form-label">Préfixe de facture</label>
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
              <h2 class="text-xl font-semibold text-gray-900 mb-4">Horaires de travail</h2>
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
                {{ isEditMode ? 'Update' : 'Create' }} Garage
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class FormGarageSetupComponent implements OnInit {
  garageForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  garageId: string | null = null;;

  weekDays = [
    { key: 'lundi', label: 'Lundi' },
    { key: 'mardi', label: 'Mardi' },
    { key: 'mercredi', label: 'Mercredi' },
    { key: 'jeudi', label: 'Jeudi' },
    { key: 'vendredi', label: 'Vendredi' },
    { key: 'samedi', label: 'Samedi' },
    { key: 'dimanche', label: 'Dimanche' }
  ]

  constructor(
    private readonly fb: FormBuilder,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly userManagementService: UserManagementService,
    private readonly route: ActivatedRoute,
    private readonly garageDataService: GarageDataService,
  ) {
    this.garageForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      website: [''],
      footer: [''],
      siret: [''],
      vatNumber: [''],
      currency: ['GNF'],
      defaultVatRate: [20],
      invoicePrefix: ['INV'],
      // Nouveaux champs utilisateur
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Working hours
      lundiIsOpen: [true],
      lundiOpenTime: ['08:00'],
      lundiCloseTime: ['18:00'],

      mardiIsOpen: [true],
      mardiOpenTime: ['08:00'],
      mardiCloseTime: ['18:00'],

      mercrediIsOpen: [true],
      mercrediOpenTime: ['08:00'],
      mercrediCloseTime: ['18:00'],

      jeudiIsOpen: [true],
      jeudiOpenTime: ['08:00'],
      jeudiCloseTime: ['18:00'],

      vendrediIsOpen: [true],
      vendrediOpenTime: ['08:00'],
      vendrediCloseTime: ['18:00'],

      samediIsOpen: [false],
      samediOpenTime: ['08:00'],
      samediCloseTime: ['12:00'],

      dimancheIsOpen: [false],
      dimancheOpenTime: [''],
      dimancheCloseTime: ['']

    });
  }

  ngOnInit(): void {
    this.garageId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.garageId;

    if (this.isEditMode && this.garageId) {
      this.loadGarage();
    }
   }

   private async loadGarage(): Promise<void> {
    this.isLoading = true;
    if (!this.garageId) return;
    try {
      const garage = await this.garageDataService.getById<Garage>('garages', this.garageId);
      if (garage) {
        this.garageForm.patchValue(garage);
        this.logoBase64 = garage.logo || null;
        this.previewLogo = this.logoBase64 ? this.logoBase64 : null;
      }
    } catch (error) {
      this.notificationService.showError('Échec du chargement des données garage. Veuillez réessayer ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.garageForm.invalid) return;

    this.isLoading = true;

    try {
      // Récupérer les valeurs du formulaire
      const garageFormValue = this.garageForm.value;


      if (this.isEditMode && this.garageId) {
        console.log(garageFormValue);

        await this.garageDataService.update<Garage>('garages', this.garageId, {
          ...garageFormValue,
          logo: this.logoBase64 || '' // <= mettre à jour le logo
        });

        this.notificationService.showSuccess('Garage updated successfully');
        this.router.navigate(['/garage/liste']);
      }
      else {

        // Demander à l'utilisateur de saisir un mot de passe, prénom, nom, ou les récupérer d'un autre formulaire
        const password = garageFormValue.password; // à ajouter dans le formulaire !
        const firstName = garageFormValue.firstName; // à ajouter dans le formulaire !
        const lastName = garageFormValue.lastName; // à ajouter dans le formulaire !
        const role = 'AdminGarage';

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
        await this.userManagementService.createGarageAccount({
          name: garageFormValue.name,
          address: garageFormValue.address,
          phone: garageFormValue.phone,
          email: garageFormValue.email,
          website: garageFormValue.website,
          siret: garageFormValue.siret,
          vatNumber: garageFormValue.vatNumber,
          settings,
          footer: garageFormValue.footer,
          ownerId: '', // sera mis à jour dans le service
          createdAt: new Date(),
          updatedAt: new Date(),
          password,
          firstName,
          lastName,
          role,
          logo: this.logoBase64 || '' // <= ajout du logo
        });

        this.notificationService.showSuccess('Garage créé avec succès !');
        this.router.navigate(['/login']);
      }

    } catch (error: any) {
      this.notificationService.showError(error?.message || 'Erreur lors de la création du garage');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/login']);
  }

  previewLogo: string | null = null; // pour l’aperçu
  logoBase64: string | null = null;  // pour l’envoi à Firestore

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.logoBase64 = reader.result as string;
      this.previewLogo = this.logoBase64; // pour afficher l’aperçu
    };

    reader.readAsDataURL(file); // Convertit en Base64
  }


}
