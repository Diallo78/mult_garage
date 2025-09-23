import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Quote } from '../../models/quote.model';
import { Diagnostic } from '../../models/diagnostic.model';
import { Visit, Client, Vehicle } from '../../models/client.model';
import { UserManagementService } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6" *ngIf="diagnostic && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Créer un devis
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }}
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
              <label class="form-label">Date de validité *</label>
              <input
                type="date"
                formControlName="validUntil"
                class="form-input"
                [class.border-red-500]="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched"
              />
              <div *ngIf="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched" class="mt-1 text-sm text-red-600">
                Date de validité est requise
              </div>
            </div>
            <div>
              <label class="form-label">Kilométrage du véhicule</label>
              <input
                type="number"
                formControlName="kilometrage"
                class="form-input"
              />
            </div>
          </div>

          <!-- Quote Items -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Détails du devis *</label>
              <button
                type="button"
                (click)="addItem()"
                class="btn-secondary text-sm"
              >
                Ajouter un détail
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
                    Retirer le détail
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

              <!-- Options d'envoi -->
              <div class="border rounded-lg p-4 bg-blue-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">
              Options d'envoi
            </h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="sendWhatsApp"
                  [(ngModel)]="sendWhatsApp"
                  [ngModelOptions]="{ standalone: true }"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="sendWhatsApp" class="ml-2 text-sm text-gray-700">
                  📱 Envoyer instantanément par WhatsApp
                </label>
              </div>
              <div class="flex items-center">
                <input
                  disabled="true"
                  type="checkbox"
                  id="sendEmail"
                  [(ngModel)]="sendEmail"
                  [ngModelOptions]="{ standalone: true }"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="sendEmail" class="ml-2 text-sm text-gray-700">
                  📧 Envoyer par email au client
                </label>
              </div>
              <div class="flex items-center">
                <input
                  disabled="true"
                  type="checkbox"
                  id="sendSMS"
                  [(ngModel)]="sendSMS"
                  [ngModelOptions]="{ standalone: true }"
                  class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label for="sendSMS" class="ml-2 text-sm text-gray-700">
                  💬 Envoyer par SMS
                </label>
              </div>
            </div>

            <!-- Statut d'envoi en temps réel -->
            <div
              *ngIf="isLoading"
              class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <div class="flex items-center">
                <div
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"
                ></div>
                <span class="text-sm text-yellow-800">Envoi en cours...</span>
              </div>
              <div class="mt-2 text-xs text-yellow-700">
                <div *ngIf="sendWhatsApp">• Ouverture de WhatsApp...</div>
                <div *ngIf="sendEmail">• Envoi de l'email...</div>
                <div *ngIf="sendSMS">• Envoi du SMS...</div>
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
              <span *ngIf="isLoading" class="mr-2">Création en cours...</span>
              Créer le devis
            </button>
            <div *ngIf="!canEdit" class="text-sm text-red-600">
              Vous n'avez pas les permissions pour créer/modifier des devis
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class QuoteFormComponent implements OnInit {
  quoteForm: FormGroup;
  diagnostic: Diagnostic | null = null;
  visit: Visit | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  diagnosticId: string | null = null;
  isLoading = false;
  canEdit = false;

  subtotal = 0;
  vatAmount = 0;
  total = 0;

  // Options d'envoi
  sendWhatsApp = true;
  sendEmail = false;
  sendSMS = false;

  stockParts: { designation: string, prixUnitaire: number }[] = [];

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly emailService: EmailService
  ) {
    this.quoteForm = this.fb.group({
      quoteNumber: [''],
      validUntil: ['', Validators.required],
      kilometrage: [''],
      vatRate: [18],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  ngOnInit() {
    (async () => {
      this.diagnosticId = this.route.snapshot.paramMap.get('diagnosticId');
      if (this.diagnosticId) {
        await this.loadDiagnosticData();
        await this.loadStockParts(); //
        this.generateQuoteNumber();
        this.setDefaultValidUntil();
        await this.checkEditPermissions();
      }
    })()
  }

  private async checkEditPermissions(): Promise<void> {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (currentUser) {
      this.canEdit = this.userManagementService.hasPermission(currentUser.role, 'quotes:write') ||
        this.userManagementService.hasPermission(currentUser.role, 'quotes:approve');
    }
  }

  private async loadDiagnosticData(): Promise<void> {
    try {
      this.diagnostic = await this.garageDataService.getById<Diagnostic>('diagnostics', this.diagnosticId!);

      if (this.diagnostic) {
        [this.visit, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Visit>('visits', this.diagnostic.visitId),
          this.garageDataService.getById<Vehicle>('vehicles', this.diagnostic.vehicleId)
        ]);

        if (this.visit) {
          this.client = await this.garageDataService.getById<Client>('clients', this.visit.clientId);
        }
      }
    } catch (error) {
      this.notificationService.showError('Impossible de charger les données du diagnostic ' + error);
    }
  }

  private async loadStockParts(): Promise<void> {
    const stockItems = await this.garageDataService.getAll<any>('stock');
    this.stockParts = stockItems
      .filter(item => item.status === 'entre')
      .map(item => ({
        designation: item.designation,
        prixUnitaire: item.prixUnitaire
      }));
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

  async onSubmit(): Promise<void> {
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
      if (this.client) {
        // Envoyer les notifications selon les options sélectionnées
        await this.sendQuoteNotifications(
          this.client,
          formValue.quoteNumber,
          quoteId
        );
      }

      this.notificationService.showSuccess('Devis créé avec succès');

      this.router.navigate(['/quotes']);
    } catch (error) {
      this.notificationService.showError('Impossible de créer le devis ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/diagnostics']);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  // SEND NOTIFICATION
  private async sendQuoteNotifications(
    client: Client,
    quoteNumber: string,
    quoteId: string
  ): Promise<void> {
    try {
      // Envoi par WhatsApp
      if (this.sendWhatsApp && client.phone) {
        await this.sendWhatsAppNotification(client, quoteNumber, quoteId);
      }

      // Envoi par Email
      if (this.sendEmail && client.email) {
        await this.sendEmailNotification(client, quoteNumber, quoteId);
      }

      // Envoi par SMS
      if (this.sendSMS && client.phone) {
        await this.sendSMSNotification(client, quoteNumber, quoteId);
      }

      // Notification interne
      await this.createInternalNotification(client, quoteNumber, quoteId);
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      this.notificationService.showError(
        "Erreur lors de l'envoi des notifications"
      );
    }
  }

  private async sendWhatsAppNotification(
    client: Client,
    quoteNumber: string,
    quoteId: string
  ): Promise<void> {
    try {
      const message = `Bonjour ${client.firstName},\n\nVotre devis N° ${quoteNumber} est prêt !\n\nVous pouvez le consulter en cliquant sur le lien suivant :\n${window.location.origin}/quotes/${quoteId}\n\nMerci de votre confiance !`;

      await this.emailService.sendWhatsAppMessage(client.phone, message);
      this.notificationService.showSuccess(
        'WhatsApp ouvert avec le message pré-rempli'
      );
    } catch (error) {
      console.error('Erreur WhatsApp:', error);
    }
  }

  private async sendEmailNotification(
    client: Client,
    quoteNumber: string,
    quoteId: string
  ): Promise<void> {
    try {
      const formValue = this.quoteForm.value;
      const emailData = {
        clientName: `${client.firstName} ${client.lastName}`,
        quoteNumber: quoteNumber,
        quoteId: quoteId,
        total: this.total,
        validUntil: new Date(formValue.validUntil),
        items: formValue.items,
      };

      await this.emailService.sendQuoteEmail(emailData);
      this.notificationService.showSuccess('Email de notification envoyé');
    } catch (error) {
      console.error('Erreur email:', error);
    }
  }

  private async sendSMSNotification(
    client: Client,
    quoteNumber: string,
    quoteId: string
  ): Promise<void> {
    try {
      // Ici vous pouvez intégrer avec un service SMS comme Twilio, etc.
      // Pour l'instant, on simule l'envoi
      console.log(
        `SMS envoyé à ${client.phone}: Devis ${quoteNumber} disponible`
      );
      this.notificationService.showSuccess('SMS envoyé au client');
    } catch (error) {
      console.error('Erreur SMS:', error);
    }
  }

  private async createInternalNotification(
    client: Client,
    quoteNumber: string,
    quoteId: string
  ): Promise<void> {
    try {
      const notification = {
        title: 'Nouveau devis disponible',
        message: `Devis N° ${quoteNumber} créé pour ${client.firstName} ${client.lastName}`,
        read: false,
        quoteId: quoteId,
        type: 'Devis',
        clientId: client.id,
        createdAt: new Date(),
        emailDesitnateur: client.email,
      };

      await this.garageDataService.create('notifications', notification);
    } catch (error) {
      console.error('Erreur notification interne:', error);
    }
  }

}