import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Invoice } from '../../models/invoice.model';
import { Intervention } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { EmailService } from '../../services/email.service';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6" *ngIf="intervention && quote && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            Créer une facture
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }}
            {{ client.lastName }}
          </p>
        </div>
      </div>

      <div class="card">
        <form
          [formGroup]="invoiceForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6"
        >
          <!-- Invoice Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Numéro de facture</label>
              <input
                type="text"
                formControlName="invoiceNumber"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            <div>
              <label class="form-label">Date d'échéance *</label>
              <input
                type="date"
                formControlName="dueDate"
                class="form-input"
                [class.border-red-500]="
                  invoiceForm.get('dueDate')?.invalid &&
                  invoiceForm.get('dueDate')?.touched
                "
              />
              <div
                *ngIf="
                  invoiceForm.get('dueDate')?.invalid &&
                  invoiceForm.get('dueDate')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                Date d'échéance est requise
              </div>
            </div>
          </div>

          <!-- Invoice Items -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Items de la facture</label>
              <button
                type="button"
                (click)="addItem()"
                class="btn-secondary text-sm"
              >
                Ajouter un item
              </button>
            </div>

            <div formArrayName="items" class="space-y-4">
              <div
                *ngFor="let item of itemsArray.controls; let i = index"
                [formGroupName]="i"
                class="border rounded-lg p-4 bg-gray-50"
              >
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div class="md:col-span-2">
                    <label class="form-label">Description *</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="form-input"
                      placeholder="Item description"
                    />
                  </div>

                  <div>
                    <label class="form-label">Type</label>
                    <select formControlName="type" class="form-input">
                      <option value="Part">Part(Piéce)</option>
                      <option value="Labor">Labor(M.O)</option>
                      <option value="Service">Service</option>
                    </select>
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
                    Supprimer l'item
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Discount and VAT -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Montant de remise</label>
              <input
                type="number"
                formControlName="discountAmount"
                (input)="calculateTotals()"
                class="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label class="form-label">Taux de TVA (%)</label>
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
                <span class="text-sm font-medium"
                  >GNF {{ subtotal.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between" *ngIf="discountAmount > 0">
                <span class="text-sm text-gray-600">Remise:</span>
                <span class="text-sm font-medium"
                  >-GNF {{ discountAmount.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600"
                  >TVA ({{ invoiceForm.get('vatRate')?.value }}%):</span
                >
                <span class="text-sm font-medium"
                  >GNF {{ vatAmount.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>GNF {{ totalAmount.toFixed(2) }}</span>
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
            <button type="button" (click)="goBack()" class="btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="invoiceForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Création en cours...</span>
              Créer la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  intervention: Intervention | null = null;
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  interventionId: string | null = null;
  isLoading = false;

  // Options d'envoi
  sendWhatsApp = true;
  sendEmail = false;
  sendSMS = false;

  subtotal = 0;
  discountAmount = 0;
  vatAmount = 0;
  totalAmount = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly emailService: EmailService
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      dueDate: ['', Validators.required],
      discountAmount: [0],
      vatRate: [18],
      items: this.fb.array([]),
    });
  }

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  ngOnInit() {
    (async () => {
      this.interventionId = this.route.snapshot.paramMap.get('interventionId');
      if (this.interventionId) {
        await this.loadInterventionData();
        this.generateInvoiceNumber();
        this.setDefaultDueDate();
        this.populateItemsFromIntervention();
      }
    })();
  }

  private async loadInterventionData(): Promise<void> {
    try {
      this.intervention = await this.garageDataService.getById<Intervention>(
        'interventions',
        this.interventionId!
      );

      if (this.intervention) {
        [this.quote, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Quote>(
            'quotes',
            this.intervention.quoteId
          ),
          this.garageDataService.getById<Vehicle>(
            'vehicles',
            this.intervention.vehicleId
          ),
        ]);

        if (this.quote) {
          this.client = await this.garageDataService.getById<Client>(
            'clients',
            this.quote.clientId
          );
        }
      }
    } catch (error) {
      this.notificationService.showError(
        'Failed to load intervention data ' + error
      );
    }
  }

  private generateInvoiceNumber(): void {
    const invoiceNumber = this.garageDataService.generateUniqueNumber('INV');
    this.invoiceForm.patchValue({ invoiceNumber });
  }

  private setDefaultDueDate(): void {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days from now
    this.invoiceForm.patchValue({
      dueDate: dueDate.toISOString().split('T')[0],
    });
  }

  private populateItemsFromIntervention(): void {
    if (!this.intervention || !this.quote) return;

    // Add items from original quote
    this.quote.items.forEach((quoteItem) => {
      this.itemsArray.push(
        this.createItemGroup(
          quoteItem.designation,
          quoteItem.quantity,
          quoteItem.unitPrice,
          quoteItem.type
        )
      );
    });

    // Add used parts from intervention
    this.intervention.usedParts.forEach((part) => {
      this.itemsArray.push(
        this.createItemGroup(
          part.partName,
          part.quantity,
          part.unitCost,
          'Part'
        )
      );
    });

    // Add extra costs if any
    this.intervention.extraCosts.forEach((cost) => {
      this.itemsArray.push(
        this.createItemGroup(cost.description, 1, cost.amount, 'Service')
      );
    });

    this.calculateTotals();
  }

  private createItemGroup(
    description: string = '',
    quantity: number = 1,
    unitPrice: number = 0,
    type: string = 'Service'
  ): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      description: [description, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      subtotal: [quantity * unitPrice],
      type: [type],
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
      return sum + quantity * unitPrice;
    }, 0);

    this.discountAmount = this.invoiceForm.get('discountAmount')?.value || 0;
    const discountedSubtotal = this.subtotal - this.discountAmount;

    const vatRate = this.invoiceForm.get('vatRate')?.value || 0;
    this.vatAmount = discountedSubtotal * (vatRate / 100);
    this.totalAmount = discountedSubtotal + this.vatAmount;
  }

  async onSubmit(): Promise<void> {
    if (
      this.invoiceForm.invalid ||
      !this.intervention ||
      !this.quote ||
      !this.client
    )
      return;

    this.isLoading = true;

    try {
      const formValue = this.invoiceForm.value;
      this.calculateTotals();

      const invoiceData: Omit<Invoice, 'id'> = {
        garageId: this.intervention.garageId,
        interventionId: this.interventionId!,
        quoteId: this.intervention.quoteId,
        clientId: this.client.id,
        vehicleId: this.intervention.vehicleId,
        invoiceNumber: formValue.invoiceNumber,
        items: formValue.items.map((item: any) => ({
          ...item,
          subtotal: item.quantity * item.unitPrice,
        })),
        subtotal: this.subtotal,
        discountAmount: this.discountAmount,
        vatAmount: this.vatAmount,
        totalAmount: this.totalAmount,
        amountPaid: 0,
        amountDue: this.totalAmount,
        status: 'Unpaid',
        dueDate: new Date(formValue.dueDate),
        payments: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const invocieRef = await this.garageDataService.create(
        'invoices',
        invoiceData
      );

      const invocieId = invocieRef;

      if (this.client) {
        // Envoyer les notifications selon les options sélectionnées
        await this.sendInvoiceNotifications(
          this.client,
          formValue.invoiceNumber,
          invocieId
        );
      }

      // 2. Créer une notification associée au devis
      // const notification = {
      //   title: 'Nouveau facture',
      //   message: `Un nouveau facture (N° ${formValue.invoiceNumber}) est disponible.`,
      //   read: false,
      //   quoteId: invocieRef,
      //   emailDesitnateur: this.client.email,
      //   type: 'Facture',
      // };

      // await this.garageDataService.create('notifications', notification);

      this.notificationService.showSuccess('Facture créée avec succès');
      this.router.navigate(['/invoices']);
    } catch (error) {
      this.notificationService.showError(
        'Échec de la création de la facture ' + error
      );
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/interventions']);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private async sendInvoiceNotifications(
    client: Client,
    invoiceNumber: string,
    invoiceId: string
  ): Promise<void> {
    try {
      // Envoi par WhatsApp
      if (this.sendWhatsApp && client.phone) {
        await this.sendWhatsAppNotification(client, invoiceNumber, invoiceId);
      }

      // Envoi par Email
      if (this.sendEmail && client.email) {
        await this.sendEmailNotification(client, invoiceNumber, invoiceId);
      }

      // Envoi par SMS
      if (this.sendSMS && client.phone) {
        await this.sendSMSNotification(client, invoiceNumber, invoiceId);
      }

      // Notification interne
      await this.createInternalNotification(client, invoiceNumber, invoiceId);
    } catch (error) {
      console.error("Erreur lors de l'envoi des notifications:", error);
      this.notificationService.showError(
        "Erreur lors de l'envoi des notifications"
      );
    }
  }

  private async sendWhatsAppNotification(
    client: Client,
    invoiceNumber: string,
    invoiceId: string
  ): Promise<void> {
    try {
      const message = `Bonjour ${client.firstName},\n\nVotre facture N° ${invoiceNumber} est prêt !\n\nVous pouvez le consulter en cliquant sur le lien suivant :\n${window.location.origin}/invoices/${invoiceId}\n\nMerci de votre confiance !`;

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
    invoiceNumber: string,
    invoiceId: string
  ): Promise<void> {
    try {
      const formValue = this.invoiceForm.value;
      const emailData = {
        clientName: `${client.firstName} ${client.lastName}`,
        quoteNumber: invoiceNumber,
        quoteId: invoiceId,
        total: 0,
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
    invoiceNumber: string,
    invoiceId: string
  ): Promise<void> {
    try {
      // Ici vous pouvez intégrer avec un service SMS comme Twilio, etc.
      // Pour l'instant, on simule l'envoi
      console.log(
        `SMS envoyé à ${client.phone}: Facture ${invoiceNumber} disponible`
      );
      this.notificationService.showSuccess('SMS envoyé au client');
    } catch (error) {
      console.error('Erreur SMS:', error);
    }
  }

  private async createInternalNotification(
    client: Client,
    invoiceNumber: string,
    invoiceId: string
  ): Promise<void> {
    try {
      const notification = {
        title: 'Nouveau facture',
        message: `Facture N° ${invoiceNumber} disponible pour ${client.firstName} ${client.lastName}`,
        read: false,
        quoteId: invoiceId,
        type: 'Facture',
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