import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client } from '../../models/client.model';
import { UserManagementService } from '../../services/user-management.service';


@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
//   template: `
//   <div class="space-y-6">
//     <div class="md:flex md:items-center md:justify-between">
//       <div class="flex-1 min-w-0">
//         <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
//           {{ isEditMode ? 'Edit Client' : 'Add New Client' }}
//         </h2>
//       </div>
//     </div>

//     <div class="card">
//       <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-6">
//         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label class="form-label">First Name *</label>
//             <input
//               type="text"
//               formControlName="firstName"
//               class="form-input"
//               [class.border-red-500]="clientForm.get('firstName')?.invalid && clientForm.get('firstName')?.touched"
//               placeholder="Enter first name"
//             />
//             <div *ngIf="clientForm.get('firstName')?.invalid && clientForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600">
//               First name is required
//             </div>
//           </div>

//           <div>
//             <label class="form-label">Last Name *</label>
//             <input
//               type="text"
//               formControlName="lastName"
//               class="form-input"
//               [class.border-red-500]="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched"
//               placeholder="Enter last name"
//             />
//             <div *ngIf="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600">
//               Last name is required
//             </div>
//           </div>

//           <div>
//             <label class="form-label">Phone *</label>
//             <input
//               type="tel"
//               formControlName="phone"
//               class="form-input"
//               [class.border-red-500]="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched"
//               placeholder="Enter phone number"
//             />
//             <div *ngIf="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched" class="mt-1 text-sm text-red-600">
//               Phone number is required
//             </div>
//           </div>

//           <div>
//             <label class="form-label">Email *</label>
//             <input
//               type="email"
//               formControlName="email"
//               class="form-input"
//               [class.border-red-500]="clientForm.get('email')?.invalid && clientForm.get('email')?.touched"
//               placeholder="Enter email address"
//             />
//             <div *ngIf="clientForm.get('email')?.invalid && clientForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
//               Please enter a valid email address
//             </div>
//           </div>
//         </div>

//         <!-- Account Creation Option -->
//         <div class="border rounded-lg p-4 bg-blue-50" *ngIf="!isEditMode">
//           <div class="flex items-center">
//             <input
//               type="checkbox"
//               [(ngModel)]="createAccount"
//               [ngModelOptions]="{standalone: true}"
//               id="createAccount"
//               class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
//             />
//             <label for="createAccount" class="ml-2 text-sm text-gray-700">
//               Create user account for client (recommended)
//             </label>
//           </div>
//           <p class="mt-2 text-xs text-gray-600">
//             This will create a user account allowing the client to view their quotes, invoices, and vehicle history online.
//             A password reset email will be sent to the client.
//           </p>
//         </div>

//         <div>
//           <label class="form-label">Address</label>
//           <textarea
//             formControlName="address"
//             rows="3"
//             class="form-input"
//             placeholder="Enter full address"
//           ></textarea>
//         </div>

//         <div class="flex justify-end space-x-4">
//           <button
//             type="button"
//             (click)="goBack()"
//             class="btn-outline"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             [disabled]="clientForm.invalid || isLoading"
//             class="btn-primary"
//           >
//             <span *ngIf="isLoading" class="mr-2">Saving...</span>
//             {{ isEditMode ? 'Update Client' : 'Create Client' }}
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// `
// })
// export class ClientFormComponent implements OnInit {
// clientForm: FormGroup;
// isEditMode = false;
// isLoading = false;
// clientId: string | null = null;
// createAccount = true;

// constructor(
//   private readonly fb: FormBuilder,
//   private readonly garageDataService: GarageDataService,
//   private readonly userManagementService: UserManagementService,
//   private readonly notificationService: NotificationService,
//   private readonly router: Router,
//   private readonly route: ActivatedRoute
// ) {
//   this.clientForm = this.fb.group({
//     firstName: ['', Validators.required],
//     lastName: ['', Validators.required],
//     phone: ['', Validators.required],
//     email: ['', [Validators.required, Validators.email]],
//     address: ['']
//   });
// }

// ngOnInit() {
//   (async() => {
//     this.clientId = this.route.snapshot.paramMap.get('id');
//     this.isEditMode = !!this.clientId;

//     if (this.isEditMode && this.clientId) {
//       await this.loadClient();
//     }
//   })()
// }

// private async loadClient(): Promise<void> {
//   try {
//     const client = await this.garageDataService.getById<Client>('clients', this.clientId!);
//     if (client) {
//       this.clientForm.patchValue(client);
//     }
//   }catch (error: any) {
//     console.error('Failed to load client data:', error);
//     const message = error?.message || 'Failed to load client data';
//     this.notificationService.showError(message);
//   }
// }

// async onSubmit(): Promise<void> {
//   if (this.clientForm.invalid) return;

//   this.isLoading = true;

//   try {
//     const clientData = this.clientForm.value;

//     if (this.isEditMode && this.clientId) {
//       await this.garageDataService.update('clients', this.clientId, clientData);
//       this.notificationService.showSuccess('Client updated successfully');
//       this.router.navigate(['/clients']);
//       return;
//     }

//     if (this.createAccount) {
//       await this.userManagementService.createClientAccount(clientData);
//     } else {
//       await this.garageDataService.create('clients', clientData);
//     }
//     this.notificationService.showSuccess('Client créé avec succès')
//     this.router.navigate(['/clients']);
//   } catch (error) {
//     this.notificationService.showError('Échec de sauvegarde du client');
//     console.log('Échec de sauvegarde du client' + error);

//   } finally {
//     this.isLoading = false;
//   }
// }

// goBack(): void {
//   this.router.navigate(['/clients']);
// }
// }

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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="form-label">Prénom *</label>
            <input
              type="text"
              formControlName="firstName"
              class="form-input"
              [class.border-red-500]="clientForm.get('firstName')?.invalid && clientForm.get('firstName')?.touched"
              placeholder="Enter first name"
            />
            <div *ngIf="clientForm.get('firstName')?.invalid && clientForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600">
              First name is required
            </div>
          </div>

          <div>
            <label class="form-label">Nom de famille *</label>
            <input
              type="text"
              formControlName="lastName"
              class="form-input"
              [class.border-red-500]="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched"
              placeholder="Enter last name"
            />
            <div *ngIf="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600">
              Last name is required
            </div>
          </div>

          <div>
            <label class="form-label">Téléphone *</label>
            <input
              type="tel"
              formControlName="phone"
              class="form-input"
              [class.border-red-500]="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched"
              placeholder="Enter phone number"
            />
            <div *ngIf="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched" class="mt-1 text-sm text-red-600">
              Phone number is required
            </div>
          </div>

          <div>
            <label class="form-label">E-mail *</label>
            <input
              type="email"
              formControlName="email"
              class="form-input"
              [class.border-red-500]="clientForm.get('email')?.invalid && clientForm.get('email')?.touched"
              placeholder="Enter email address"
            />
            <div *ngIf="clientForm.get('email')?.invalid && clientForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
              Please enter a valid email address
            </div>
          </div>
        </div>

        <!-- Account Creation Option -->
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
            Cela créera un compte utilisateur permettant au client de consulter ses devis, factures et l'historique de
            son véhicule en ligne. Un e-mail de réinitialisation du mot de passe lui sera envoyé..
          </p>
        </div>

        <div>
          <label class="form-label">Address</label>
          <textarea
            formControlName="address"
            rows="3"
            class="form-input"
            placeholder="Enter full address"
          ></textarea>
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
            [disabled]="clientForm.invalid || isLoading"
            class="btn-primary"
          >
            <span *ngIf="isLoading" class="mr-2">Saving...</span>
            {{ isEditMode ? 'Modifier un Client' : 'Créer un Client' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  </div>

  `
})
export class ClientFormComponent implements OnInit {
clientForm: FormGroup;
isEditMode = false;
isLoading = false;
clientId: string | null = null;
createAccount = true;
_garageId!: string
constructor(
private readonly fb: FormBuilder,
private readonly garageDataService: GarageDataService,
private readonly userManagementService: UserManagementService,
private readonly notificationService: NotificationService,
private readonly router: Router,
private readonly route: ActivatedRoute
) {
this.clientForm = this.fb.group({
  firstName: ['', Validators.required],
  lastName: ['', Validators.required],
  phone: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  address: [''],
  createAccount: [true] // <-- add this
});
}

ngOnInit() {
  (async()=>{
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.clientId;

    if (this.isEditMode && this.clientId) {
      await this.loadClient();
    }
  })()
}

private async loadClient(): Promise<void> {
  try {
    const client = await this.garageDataService.getById<Client>('clients', this.clientId!);
    if (client) {
      this.clientForm.patchValue(client);
    }
  } catch (error) {
    this.notificationService.showError('Échec du chargement des données client. Veuillez réessayer. ' + error);
  }
}

async onSubmit(): Promise<void> {
if (this.clientForm.invalid) return;

this.isLoading = true;

try {
  const clientData = this.clientForm.value;

  if (this.isEditMode && this.clientId) {
    await this.garageDataService.update('clients', this.clientId, clientData);
    this.notificationService.showSuccess('Client updated successfully');
  } else {
    if (this.createAccount) {
      // Création avec compte utilisateur
      await this.userManagementService.createClientAccount(clientData);
    } else {
      await this.garageDataService.create('clients', clientData);
      this.notificationService.showSuccess('Client créé avec succès');
    }
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
}