import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client, ClientType } from '../../models/client.model';
import { UserManagementService } from '../../services/user-management.service';
import { EmailService } from '../../services/email.service';


@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
    </div>

    <div *ngIf="!isLoading">
      <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              {{ isEditMode ? 'Modifier le client' : 'Ajouter un nouveau client' }}
            </h2>
          </div>
        </div>

        <div class="card">
          <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <!-- Sélecteur de type de client -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">Type de client</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  (click)="onClientTypeChange('individual')"
                  class="text-left rounded-lg border-2 p-4 transition-colors focus:outline-none"
                  [ngClass]="
                    clientType === 'individual'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                  "
                >
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">👤</span>
                    <div>
                      <div class="font-medium text-gray-900">Personne physique</div>
                      <p class="mt-1 text-xs text-gray-600">
                        Client individuel (particulier).
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  (click)="onClientTypeChange('company')"
                  class="text-left rounded-lg border-2 p-4 transition-colors focus:outline-none"
                  [ngClass]="
                    clientType === 'company'
                      ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500'
                      : 'border-gray-200 hover:border-gray-300'
                  "
                >
                  <div class="flex items-start">
                    <span class="text-2xl mr-3">🏢</span>
                    <div>
                      <div class="font-medium text-gray-900">Entreprise</div>
                      <p class="mt-1 text-xs text-gray-600">
                        Société ou entité juridique.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- ===== Personne physique ===== -->
            <div *ngIf="clientType === 'individual'" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">
                Informations personnelles
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Prénom *</label>
                  <input
                    type="text"
                    formControlName="firstName"
                    class="form-input"
                    [class.border-red-500]="isInvalid('firstName')"
                    placeholder="Entrez le prénom"
                  />
                  <div *ngIf="isInvalid('firstName')" class="mt-1 text-sm text-red-600">
                    Le prénom est obligatoire
                  </div>
                </div>

                <div>
                  <label class="form-label">Nom de famille *</label>
                  <input
                    type="text"
                    formControlName="lastName"
                    class="form-input"
                    [class.border-red-500]="isInvalid('lastName')"
                    placeholder="Entrez le nom de famille"
                  />
                  <div *ngIf="isInvalid('lastName')" class="mt-1 text-sm text-red-600">
                    Le nom de famille est obligatoire
                  </div>
                </div>

                <div>
                  <label class="form-label">Téléphone *</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="form-input"
                    [class.border-red-500]="isInvalid('phone')"
                    placeholder="Numéro de téléphone"
                  />
                  <div *ngIf="isInvalid('phone')" class="mt-1 text-sm text-red-600">
                    Le téléphone est obligatoire
                  </div>
                </div>

                <div>
                  <label class="form-label">E-mail *</label>
                  <input
                    type="email"
                    formControlName="email"
                    class="form-input"
                    [class.border-red-500]="isInvalid('email')"
                    placeholder="client@exemple.com"
                  />
                  <div *ngIf="isInvalid('email')" class="mt-1 text-sm text-red-600">
                    <span *ngIf="clientForm.get('email')?.hasError('required')">
                      L'e-mail est obligatoire
                    </span>
                    <span *ngIf="clientForm.get('email')?.hasError('email')">
                      Veuillez saisir une adresse e-mail valide
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label class="form-label">Adresse</label>
                <textarea
                  formControlName="address"
                  rows="3"
                  class="form-input"
                  placeholder="Entrez l'adresse complète"
                ></textarea>
              </div>

              <!-- Option de création de compte utilisateur -->
              <div class="border rounded-lg p-4 bg-blue-50" *ngIf="!isEditMode">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="createAccount"
                    id="createAccount"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="createAccount" class="ml-2 text-sm text-gray-700">
                    Créer un compte utilisateur pour le client (recommandé)
                  </label>
                </div>
                <p class="mt-2 text-xs text-gray-600">
                  Cela créera un compte utilisateur permettant au client de consulter ses devis, factures et
                  l'historique de son véhicule en ligne. Un e-mail de réinitialisation du mot de passe lui sera envoyé.
                </p>
              </div>
            </div>

            <!-- ===== Entreprise ===== -->
            <div *ngIf="clientType === 'company'" class="space-y-6">
              <h3 class="text-lg font-medium text-gray-900">
                Informations de l'entreprise
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="md:col-span-2">
                  <label class="form-label">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    formControlName="companyName"
                    class="form-input"
                    [class.border-red-500]="isInvalid('companyName')"
                    placeholder="Entrez la raison sociale"
                  />
                  <div *ngIf="isInvalid('companyName')" class="mt-1 text-sm text-red-600">
                    Le nom de l'entreprise est obligatoire
                  </div>
                </div>

                <div>
                  <label class="form-label">NIF (Numéro d'identification fiscale)</label>
                  <input
                    type="text"
                    formControlName="nif"
                    class="form-input"
                    placeholder="Numéro d'identification fiscale"
                  />
                </div>

                <div>
                  <label class="form-label">Clé TVA</label>
                  <input
                    type="text"
                    formControlName="vatKey"
                    class="form-input"
                    placeholder="Clé TVA"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="form-label">Adresse complète de l'entreprise *</label>
                  <textarea
                    formControlName="companyAddress"
                    rows="3"
                    class="form-input"
                    [class.border-red-500]="isInvalid('companyAddress')"
                    placeholder="Entrez l'adresse complète de l'entreprise"
                  ></textarea>
                  <div *ngIf="isInvalid('companyAddress')" class="mt-1 text-sm text-red-600">
                    L'adresse de l'entreprise est obligatoire
                  </div>
                </div>
              </div>

              <h3 class="text-lg font-medium text-gray-900">
                Contact / Logisticien
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="form-label">Nom complet du contact *</label>
                  <input
                    type="text"
                    formControlName="contactName"
                    class="form-input"
                    [class.border-red-500]="isInvalid('contactName')"
                    placeholder="Nom du logisticien ou du personnel à contacter"
                  />
                  <div *ngIf="isInvalid('contactName')" class="mt-1 text-sm text-red-600">
                    Le nom du contact est obligatoire
                  </div>
                </div>

                <div>
                  <label class="form-label">Téléphone du contact *</label>
                  <input
                    type="tel"
                    formControlName="contactPhone"
                    class="form-input"
                    [class.border-red-500]="isInvalid('contactPhone')"
                    placeholder="Numéro de téléphone du contact"
                  />
                  <div *ngIf="isInvalid('contactPhone')" class="mt-1 text-sm text-red-600">
                    Le téléphone du contact est obligatoire
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="form-label">
                    E-mail du contact {{ isContactEmailRequired ? '*' : '' }}
                  </label>
                  <input
                    type="email"
                    formControlName="contactEmail"
                    class="form-input"
                    [class.border-red-500]="isInvalid('contactEmail')"
                    placeholder="contact@entreprise.com"
                  />
                  <div *ngIf="isInvalid('contactEmail')" class="mt-1 text-sm text-red-600">
                    <span *ngIf="clientForm.get('contactEmail')?.hasError('required')">
                      L'e-mail du contact est obligatoire pour créer son compte
                    </span>
                    <span *ngIf="clientForm.get('contactEmail')?.hasError('email')">
                      Veuillez saisir une adresse e-mail valide
                    </span>
                  </div>
                </div>
              </div>

              <!-- Option de création de compte pour l'interlocuteur de l'entreprise -->
              <div class="border rounded-lg p-4 bg-blue-50" *ngIf="!isEditMode">
                <div class="flex items-center">
                  <input
                    type="checkbox"
                    formControlName="createAccount"
                    id="createAccountCompany"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label for="createAccountCompany" class="ml-2 text-sm text-gray-700">
                    Créer un compte utilisateur pour l'interlocuteur de l'entreprise (recommandé)
                  </label>
                </div>
                <p class="mt-2 text-xs text-gray-600">
                  Un compte sera créé pour
                  <strong>{{ clientForm.get('contactName')?.value || 'le contact' }}</strong>
                  afin qu'il puisse consulter les devis, factures et l'historique en ligne.
                  Un e-mail de réinitialisation du mot de passe lui sera envoyé.
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  L'entreprise reste le client du garage ; le compte est celui de son interlocuteur.
                </p>
              </div>
            </div>

            <div class="flex justify-end space-x-4">
              <button type="button" (click)="goBack()" class="btn-secondary">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="clientForm.invalid || isLoading"
                class="btn-primary"
              >
                <span *ngIf="isLoading" class="mr-2">Enregistrement...</span>
                {{ isEditMode ? 'Modifier le client' : 'Créer le client' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  clientId: string | null = null;
  _garageId!: string;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly userManagementService: UserManagementService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly emailService: EmailService
  ) {
    this.clientForm = this.fb.group({
      clientType: ['individual'],
      // Personne physique
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: [''],
      // Entreprise
      companyName: [''],
      companyAddress: [''],
      nif: [''],
      vatKey: [''],
      contactName: [''],
      contactPhone: [''],
      contactEmail: [''],
      // Compte utilisateur (personne physique ou interlocuteur d'entreprise)
      createAccount: [true],
    });

    // Le fait de cocher/décocher la création de compte change l'obligation de l'e-mail du contact
    this.clientForm.get('createAccount')?.valueChanges.subscribe(() => {
      this.applyClientTypeValidators(this.clientType);
    });
  }

  /** Type de client sélectionné (absent => personne physique). */
  get clientType(): ClientType {
    return this.clientForm.get('clientType')?.value === 'company'
      ? 'company'
      : 'individual';
  }

  /**
   * L'e-mail du contact est obligatoire uniquement si un compte lui est créé
   * (option disponible en création seulement).
   */
  get isContactEmailRequired(): boolean {
    return (
      !this.isEditMode &&
      this.clientType === 'company' &&
      !!this.clientForm.get('createAccount')?.value
    );
  }

  ngOnInit() {
    (async () => {
      this.clientId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.clientId;

      if (this.isEditMode && this.clientId) {
        await this.loadClient();
      } else {
        this.applyClientTypeValidators('individual');
      }
    })();
  }

  private async loadClient(): Promise<void> {
    try {
      const client = await this.garageDataService.getById<Client>(
        'clients',
        this.clientId!
      );
      if (client) {
        // Les anciens enregistrements sans clientType sont des personnes physiques
        const type: ClientType =
          client.clientType === 'company' ? 'company' : 'individual';

        this.clientForm.patchValue({
          clientType: type,
          firstName: client.firstName ?? '',
          lastName: client.lastName ?? '',
          phone: client.phone ?? '',
          email: client.email ?? '',
          address: client.address ?? '',
          companyName: client.companyName ?? '',
          companyAddress: client.companyAddress ?? '',
          nif: client.nif ?? '',
          vatKey: client.vatKey ?? '',
          contactName: client.contactName ?? '',
          contactPhone: client.contactPhone ?? '',
          contactEmail: client.contactEmail ?? '',
        });

        this.applyClientTypeValidators(type);
      }
    } catch (error) {
      this.notificationService.showError(
        'Échec du chargement des données client. Veuillez réessayer. ' + error
      );
    }
  }

  onClientTypeChange(type: ClientType): void {
    this.clientForm.patchValue({ clientType: type });
    this.applyClientTypeValidators(type);
  }

  /**
   * Active/désactive dynamiquement les validateurs selon le type de client.
   * Les champs masqués ne doivent jamais être obligatoires.
   */
  private applyClientTypeValidators(type: ClientType): void {
    const isCompany = type === 'company';

    const individualValidators: Record<string, any[]> = {
      firstName: [Validators.required],
      lastName: [Validators.required],
      phone: [Validators.required],
      email: [Validators.required, Validators.email],
    };

    const companyValidators: Record<string, any[]> = {
      companyName: [Validators.required],
      companyAddress: [Validators.required],
      contactName: [Validators.required],
      contactPhone: [Validators.required],
    };

    Object.entries(individualValidators).forEach(([name, validators]) => {
      const control = this.clientForm.get(name);
      if (!control) return;
      if (isCompany) {
        control.clearValidators();
      } else {
        control.setValidators(validators);
      }
      control.updateValueAndValidity();
    });

    Object.entries(companyValidators).forEach(([name, validators]) => {
      const control = this.clientForm.get(name);
      if (!control) return;
      if (isCompany) {
        control.setValidators(validators);
      } else {
        control.clearValidators();
      }
      control.updateValueAndValidity();
    });

    // E-mail du contact : facultatif, mais obligatoire au format valide
    // lorsqu'un compte est créé pour l'interlocuteur de l'entreprise
    // (uniquement en création, l'option n'existant pas en modification).
    const contactEmail = this.clientForm.get('contactEmail');
    if (contactEmail) {
      const createAccount =
        !this.isEditMode && !!this.clientForm.get('createAccount')?.value;
      contactEmail.setValidators(
        isCompany
          ? createAccount
            ? [Validators.required, Validators.email]
            : [Validators.email]
          : []
      );
      contactEmail.updateValueAndValidity();
    }
  }

  /** Utilitaire d'affichage des erreurs de validation dans le template. */
  isInvalid(controlName: string): boolean {
    const control = this.clientForm.get(controlName);
    return !!control && control.invalid && control.touched;
  }

  async onSubmit(): Promise<void> {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.clientForm.value;
      const type: ClientType = this.clientType;

      const clientData: Partial<Client> =
        type === 'company'
          ? {
              clientType: 'company',
              companyName: formValue.companyName,
              companyAddress: formValue.companyAddress,
              nif: formValue.nif || '',
              vatKey: formValue.vatKey || '',
              contactName: formValue.contactName,
              contactPhone: formValue.contactPhone,
              contactEmail: formValue.contactEmail || '',
            }
          : {
              clientType: 'individual',
              firstName: formValue.firstName,
              lastName: formValue.lastName,
              phone: formValue.phone,
              email: formValue.email,
              address: formValue.address || '',
            };

      if (this.isEditMode && this.clientId) {
        // Modification : on ne touche pas aux identifiants ni aux relations
        await this.garageDataService.update(
          'clients',
          this.clientId,
          clientData
        );
        this.notificationService.showSuccess('Client mis à jour avec succès');
      } else if (type === 'company') {
        // L'entreprise est le client du garage ; un compte peut être créé pour son interlocuteur.
        const companyData: Partial<Client> = { ...clientData };

        if (formValue.createAccount) {
          const userId =
            await this.userManagementService.createCompanyContactAccount({
              fullName: formValue.contactName,
              email: formValue.contactEmail,
            });
          companyData.userId = userId;
        }

        await this.garageDataService.create('clients', companyData);

        if (formValue.createAccount) {
          const contactName: string = formValue.contactName || '';
          await this.sendWhatsAppNotification({
            firstName: contactName.trim().split(' ')[0] || contactName,
            email: formValue.contactEmail,
            phone: formValue.contactPhone,
          });
        } else {
          this.notificationService.showSuccess('Entreprise créée avec succès');
        }
      } else if (formValue.createAccount) {
        // Personne physique avec création de compte
        const individualData = {
          firstName: clientData.firstName!,
          lastName: clientData.lastName!,
          phone: clientData.phone!,
          email: clientData.email!,
          address: clientData.address,
          clientType: 'individual' as const,
        };
        await this.userManagementService.createClientAccount(individualData);
        await this.sendWhatsAppNotification(individualData);
      } else {
        // Personne physique sans compte utilisateur
        await this.garageDataService.create('clients', clientData);
        this.notificationService.showSuccess('Client créé avec succès');
      }

      this.router.navigate(['/clients']);
    } catch (error) {
      this.notificationService.showError('Échec de sauvegarde du client ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  private async sendWhatsAppNotification(client: {
    firstName: string;
    email: string;
    phone: string;
  }): Promise<void> {
    try {
      const message = `Bonjour ${client.firstName},

      Votre compte a été créé avec succès sur la plateforme CarGest 🚘📑.

      Voici vos identifiants de connexion :
      📧 Email : ${client.email}
      🔑 Mot de passe temporaire : password

      Une fois connecté, merci de bien vouloir changer votre mot de passe dans l’onglet "Profil" (menu en haut à droite).

      Vous pouvez accéder à la plateforme via le lien suivant :
      ${window.location.origin}/login

      Merci de votre confiance et bienvenue sur CarGest !`;

      await this.emailService.sendWhatsAppMessage(client.phone, message);
      this.notificationService.showSuccess(
        'WhatsApp ouvert avec le message pré-rempli'
      );
    } catch (error) {
      console.error('Erreur WhatsApp:', error);
    }
  }
}
