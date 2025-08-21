import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Quote } from '../../models/quote.model';
import { Diagnostic } from '../../models/diagnostic.model';
import { Visit, Client, Vehicle } from '../../models/client.model';
import { UserManagementService } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quote-new-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="space-y-6" *ngIf="clients">
    <div class="md:flex md:items-center md:justify-between">
      <div class="flex-1 min-w-0">
        <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Créer un devis
        </h2>
        <p class="text-lg text-gray-600">
          <!-- {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }} -->
        </p>
      </div>
    </div>

    <div class="card">
      <form [formGroup]="quoteForm" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- Quote Details -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="form-label">Numéro de devis</label>
            <input
              type="text"
              formControlName="quoteNumber"
              class="form-input bg-gray-100"
              readonly
            />
          </div>
          <div>
            <label class="form-label">Valide jusqu'à *</label>
            <input
              type="date"
              formControlName="validUntil"
              class="form-input"
              [class.border-red-500]="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched"
            />
            <div *ngIf="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched" class="mt-1 text-sm text-red-600">
              La date de validité est requise
            </div>
          </div>
          <div>
            <label class="form-label">Kilométrage véhicule</label>
            <input
              type="number"
              formControlName="kilometrage"
              class="form-input"
            />
          </div>
        </div>

        <!-- Client selection -->
        <div>
          <div>
            <label class="form-label">Client *</label>
            <select formControlName="clientId" (change)="onClientSelected($event)" class="form-input">
              <option value="">-- Sélectionner un client --</option>
              <option *ngFor="let c of clients" [value]="c.id">
                {{ c.firstName }} {{ c.lastName }} ({{ c.email }})
              </option>
            </select>
          </div>

          <!-- Vehicle selection -->
          <div *ngIf="vehiclesForClient.length > 0">
            <label class="form-label">Véhicule *</label>
            <select formControlName="vehicleId" class="form-input">
              <option value="">-- Sélectionner un véhicule --</option>
              <option *ngFor="let v of vehiclesForClient" [value]="v.id">
                {{ v.brand }} {{ v.model }} - {{ v.licensePlate }}
              </option>
            </select>
          </div>
        </div>

        <!-- Quote Items -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <label class="form-label">Article devis *</label>
            <button
              type="button"
              (click)="addItem()"
              class="btn-secondary text-sm"
            >
              Ajouter un article
            </button>
          </div>

          <div formArrayName="items" class="space-y-4">
            <div *ngFor="let item of itemsArray.controls; let i = index"
                 [formGroupName]="i"
                 class="border rounded-lg p-4 bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-5 gap-4">

                <div>
                  <label class="form-label">Type</label>
                  <select formControlName="type" class="form-input">
                    <option value="Part">Part(Piéce)</option>
                    <option value="Labor">Labor(M.O)</option>
                    <option value="Service">Service</option>
                  </select>
                </div>


                <div class="md:col-span-2">
                  <label class="form-label">Description *</label>

                  <ng-container [ngSwitch]="itemsArray.at(i).get('type')?.value">
                    <!-- Si Part => liste déroulante -->
                    <select
                      *ngSwitchCase="'Part'"
                      formControlName="designation"
                      class="form-input"
                      (change)="onSelectPart(i)"
                    >
                      <option value="">-- Sélectionnez une pièce --</option>
                      <option *ngFor="let part of stockParts" [value]="part.designation">
                        {{ part.designation }}
                      </option>
                    </select>

                    <!-- Sinon champ libre -->
                    <input
                      *ngSwitchDefault
                      type="text"
                      formControlName="designation"
                      class="form-input"
                      placeholder="Description manuelle"
                    />
                  </ng-container>
                </div>


                <div>
                  <label class="form-label">Quantité *</label>
                  <input
                    type="number"
                    formControlName="quantity"
                    (input)="calculateItemSubtotal(i)"
                    class="form-input"
                    min="1"
                    step="1"
                  />
                </div>

                <div>
                  <label class="form-label">Prix unitaire *</label>
                  <input
                    type="number"
                    formControlName="unitPrice"
                    (input)="calculateItemSubtotal(i)"
                    class="form-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <div class="text-sm font-medium text-gray-900">
                  Subtotal: GNF {{ getItemSubtotal(i).toFixed(2) }}
                </div>
                <button
                  type="button"
                  (click)="removeItem(i)"
                  class="text-red-600 hover:text-red-900 text-sm"
                  [disabled]="itemsArray.length === 1"
                >
                  Supprimer l'article
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- VAT Rate -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="form-label">Taux TVA (%)</label>
            <input
              type="number"
              formControlName="vatRate"
              (input)="calculateTotals()"
              class="form-input"
              min="0"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <!-- Totals -->
        <div class="border-t pt-6">
          <div class="space-y-2 text-right">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Sous-total:</span>
              <span class="text-sm font-medium">GNF {{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">TVA ({{ quoteForm.get('vatRate')?.value }}%):</span>
              <span class="text-sm font-medium">GNF {{ vatAmount.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>GNF {{ total.toFixed(2) }}</span>
            </div>
          </div>
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
            [disabled]="quoteForm.invalid || isLoading || !canEdit"
            class="btn-primary"
          >
            <span *ngIf="isLoading" class="mr-2">Creating...</span>
            Créer le devis
          </button>
          <div *ngIf="!canEdit" class="text-sm text-red-600">
            Vous n'avez pas la permission de créer/modifier des devis
          </div>
        </div>
      </form>
    </div>
  </div>
`

})
export class QuoteFormNewComponent implements OnInit {
  quoteForm: FormGroup;
  diagnostic: Diagnostic | null = null;
  visit: Visit | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  diagnosticId: string | null = null;
  isLoading = false;
  canEdit = false;
  clients: Client[] = [];
  vehiclesForClient: Vehicle[] = [];

  subtotal = 0;
  vatAmount = 0;
  total = 0;

  stockParts: { designation: string, prixUnitaire: number }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.quoteForm = this.fb.group({
      quoteNumber: [''],
      validUntil: ['', Validators.required],
      kilometrage: [''],
      vatRate: [18],
      clientId: ['', Validators.required],   // 👈 nouveau
      vehicleId: ['', Validators.required],  // 👈 nouveau
      items: this.fb.array([this.createItemGroup()])
    });

  }

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  ngOnInit() {
    console.log(this.route.snapshot.queryParams);

    (async () => {
      await this.loadClients();   // mode libre
      this.generateQuoteNumber();
      this.setDefaultValidUntil();
      await this.checkEditPermissions();
    })()
  }

  private async loadClients(): Promise<void> {
    this.isLoading = true;
    try {
      this.clients = await this.garageDataService.getAll<Client>('clients');
    } catch (error) {
      this.notificationService.showError('Impossible de charger la liste des clients ' + error);
    } finally { this.isLoading = false }
  }

  private async checkEditPermissions(): Promise<void> {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (currentUser) {
      this.canEdit = this.userManagementService.hasPermission(currentUser.role, 'quotes:write') ||
        this.userManagementService.hasPermission(currentUser.role, 'quotes:approve');
    }
  }


  private generateQuoteNumber(): void {
    const quoteNumber = this.garageDataService.generateUniqueNumber('QT');
    this.quoteForm.patchValue({ quoteNumber });
  }

  private setDefaultValidUntil(): void {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // 30 days from now
    this.quoteForm.patchValue({
      validUntil: validUntil.toISOString().split('T')[0]
    });
  }

  async onClientSelected(event: any): Promise<void> {
    const clientId = event.target.value;
    if (!clientId) {
      this.vehiclesForClient = [];
      this.quoteForm.patchValue({ vehicleId: '' });
      return;
    }

    try {
      this.vehiclesForClient = await this.garageDataService.getAll<Vehicle>('vehicles');
      this.vehiclesForClient = this.vehiclesForClient.filter(v => v.clientId === clientId);
    } catch (error) {
      this.notificationService.showError('Impossible de charger les véhicules du client ' + error);

    }
  }


  private createItemGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      designation: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0],
      type: ['Part']
    });
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    if (this.itemsArray.length > 1) {
      this.itemsArray.removeAt(index);
      this.calculateTotals();
    }
  }

  calculateItemSubtotal(index: number): void {
    const item = this.itemsArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;

    item.patchValue({ subtotal });
    this.calculateTotals();
  }

  getItemSubtotal(index: number): number {
    const item = this.itemsArray.at(index);
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    return quantity * unitPrice;
  }

  calculateTotals(): void {
    this.subtotal = this.itemsArray.controls.reduce((sum, item) => {
      const quantity = item.get('quantity')?.value || 0;
      const unitPrice = item.get('unitPrice')?.value || 0;
      return sum + (quantity * unitPrice);
    }, 0);

    const vatRate = this.quoteForm.get('vatRate')?.value || 0;
    this.vatAmount = this.subtotal * (vatRate / 100);
    this.total = this.subtotal + this.vatAmount;
  }

  onSelectPart(index: number): void {
    const item = this.itemsArray.at(index);
    const selectedDesignation = item.get('designation')?.value;
    const part = this.stockParts.find(p => p.designation === selectedDesignation);

    if (part) {
      item.patchValue({
        unitPrice: part.prixUnitaire
      });
      this.calculateItemSubtotal(index);
    }
  }

  async onSubmitv1(): Promise<void> {
    if (this.quoteForm.invalid || !this.diagnostic || !this.client) return;

    this.isLoading = true;

    try {
      const formValue = this.quoteForm.value;

      this.calculateTotals();

      const quoteData: Omit<Quote, 'id'> = {
        garageId: this.diagnostic.garageId,
        diagnosticId: this.diagnosticId!,
        vehicleId: this.diagnostic.vehicleId,
        clientId: this.client.id,
        quoteNumber: formValue.quoteNumber,
        items: formValue.items.map((item: any) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice
        })),
        subtotal: this.subtotal,
        vatRate: formValue.vatRate,
        vatAmount: this.vatAmount,
        total: this.total,
        status: 'Pending',
        validUntil: new Date(formValue.validUntil),
        kilometrage: formValue.kilometrage,
        revisionHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // await this.garageDataService.create('quotes', quoteData);
      // this.notificationService.showSuccess('Quote created successfully');

      // 1. Créer le devis et récupérer l'ID généré
      const quoteRef = await this.garageDataService.create('quotes', quoteData);
      const quoteId = quoteRef;

      // 2. Créer une notification associée au devis
      const notification = {
        title: 'Nouveau devis disponible',
        message: `Un nouveau devis N° ${formValue.quoteNumber} est disponible.`,
        read: false,
        quoteId: quoteId,
        emailDesitnateur: this.client.email,
        type: 'Devis'
      };

      await this.garageDataService.create('notifications', notification);

      this.notificationService.showSuccess('Devis créé avec succès');

      this.router.navigate(['/quotes']);
    } catch (error) {
      this.notificationService.showError('Failed to create quote ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.quoteForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.quoteForm.value;
      this.calculateTotals();

      const clientId = this.diagnostic ? this.client!.id : formValue.clientId;
      const vehicleId = this.diagnostic ? this.diagnostic.vehicleId : formValue.vehicleId;

      const quoteData: Omit<Quote, 'id'> = {
        garageId: this.diagnostic ? this.diagnostic.garageId : 'defaultGarage',
        diagnosticId: "0011",
        vehicleId,
        clientId,
        quoteNumber: formValue.quoteNumber,
        items: formValue.items.map((item: any) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice
        })),
        subtotal: this.subtotal,
        vatRate: formValue.vatRate,
        vatAmount: this.vatAmount,
        total: this.total,
        status: 'Pending',
        validUntil: new Date(formValue.validUntil),
        kilometrage: formValue.kilometrage,
        revisionHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const quoteRef = await this.garageDataService.create('quotes', quoteData);
      const quoteId = quoteRef;

      // Notification
      const client = this.clients.find(c => c.id === clientId) || this.client;
      if (client?.email) {
        const notification = {
          title: 'Nouveau devis disponible',
          message: `Un nouveau devis N° ${formValue.quoteNumber} est disponible.`,
          read: false,
          quoteId: quoteId,
          emailDesitnateur: client.email,
          type: 'Devis'
        };
        await this.garageDataService.create('notifications', notification);
      }

      this.notificationService.showSuccess('Devis créé avec succès');
      this.router.navigate(['/quotes']);
    } catch (error) {
      this.notificationService.showError('Failed to create quote ' + error);
    } finally {
      this.isLoading = false;
    }
  }


  goBack(): void {
    this.router.navigate(['/diagnostics']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}