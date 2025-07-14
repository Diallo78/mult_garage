import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Client } from '../../models/client.model';


@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
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
                placeholder="Entrez le prénom"
              />
              <div *ngIf="clientForm.get('firstName')?.invalid && clientForm.get('firstName')?.touched" class="mt-1 text-sm text-red-600">
                Le prénom est obligatoire
              </div>
            </div>

            <div>
              <label class="form-label">Nom de famille *</label>
              <input
                type="text"
                formControlName="lastName"
                class="form-input"
                [class.border-red-500]="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched"
                placeholder="Entrez le nom de famille"
              />
              <div *ngIf="clientForm.get('lastName')?.invalid && clientForm.get('lastName')?.touched" class="mt-1 text-sm text-red-600">
              Le nom de famille est obligatoire
              </div>
            </div>

            <div>
              <label class="form-label">Téléphone *</label>
              <input
                type="tel"
                formControlName="phone"
                class="form-input"
                [class.border-red-500]="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched"
                placeholder="Entrez le numéro de téléphone"
              />
              <div *ngIf="clientForm.get('phone')?.invalid && clientForm.get('phone')?.touched" class="mt-1 text-sm text-red-600">
                Le numéro de téléphone est requis
              </div>
            </div>

            <div>
              <label class="form-label">Email *</label>
              <input
                type="email"
                formControlName="email"
                class="form-input"
                [class.border-red-500]="clientForm.get('email')?.invalid && clientForm.get('email')?.touched"
                placeholder="Entrez l'adresse e-mail"
              />
              <div *ngIf="clientForm.get('email')?.invalid && clientForm.get('email')?.touched" class="mt-1 text-sm text-red-600">
                S'il vous plaît, mettez une adresse email valide
              </div>
            </div>
          </div>

          <div>
            <label class="form-label">Address</label>
            <textarea
              formControlName="address"
              rows="3"
              class="form-input"
              placeholder="Entrez l'adresse complète"
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
              {{ isEditMode ? 'Modifier le client' : 'Ajouter le clientt' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  clientForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  clientId: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.clientId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.clientId;

    if (this.isEditMode && this.clientId) {
      await this.loadClient();
    }
  }

  private async loadClient(): Promise<void> {
    try {
      const client = await this.garageDataService.getById<Client>('clients', this.clientId!);
      if (client) {
        this.clientForm.patchValue(client);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load client data');
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
        await this.garageDataService.create('clients', clientData);
        this.notificationService.showSuccess('Client created successfully');
      }

      this.router.navigate(['/clients']);
    } catch (error) {
      this.notificationService.showError('Failed to save client');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }
}