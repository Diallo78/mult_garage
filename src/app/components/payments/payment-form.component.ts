import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { Invoice, Payment, PaymentMethod } from '../../models/invoice.model';
import { Client, Vehicle } from '../../models/client.model';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6" *ngIf="invoice && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            Ajouter un paiement
          </h2>
          <p class="text-lg text-gray-600">
            Facture {{ invoice.invoiceNumber }} - {{ client.firstName }}
            {{ client.lastName }}
          </p>
        </div>
      </div>

      <!-- Résumé de la facture -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Résumé de la facture
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500"
              >Montant total</label
            >
            <p class="mt-1 text-lg font-bold text-gray-900">
              \GNF {{ invoice.totalAmount.toFixed(2) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >Montant payé</label
            >
            <p class="mt-1 text-lg font-bold text-green-600">
              \GNF {{ invoice.amountPaid.toFixed(2) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Montant dû</label>
            <p class="mt-1 text-lg font-bold text-red-600">
              \GNF {{ invoice.amountDue.toFixed(2) }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Statut</label>
            <p class="mt-1">
              <span
                class="status-badge"
                [ngClass]="getStatusClass(invoice.status)"
              >
                {{ invoice.status }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Formulaire de paiement -->
      <div class="card">
        <form
          [formGroup]="paymentForm"
          (ngSubmit)="onSubmit()"
          class="space-y-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Montant du paiement *</label>
              <input
                type="number"
                formControlName="amount"
                class="form-input"
                [class.border-red-500]="
                  paymentForm.get('amount')?.invalid &&
                  paymentForm.get('amount')?.touched
                "
                placeholder="Saisir le montant du paiement"
                min="0.01"
                [max]="invoice.amountDue"
                step="0.01"
              />
              <div
                *ngIf="
                  paymentForm.get('amount')?.invalid &&
                  paymentForm.get('amount')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                <span *ngIf="paymentForm.get('amount')?.errors?.['required']"
                  >Le montant est requis</span
                >
                <span *ngIf="paymentForm.get('amount')?.errors?.['min']"
                  >Le montant doit être supérieur à 0</span
                >
                <span *ngIf="paymentForm.get('amount')?.errors?.['max']"
                  >Le montant ne peut pas dépasser le montant dû</span
                >
              </div>
              <div class="mt-1 text-sm text-gray-500">
                Maximum : \GNF {{ invoice.amountDue.toFixed(2) }}
              </div>
            </div>

            <div>
              <label class="form-label">Méthode de paiement *</label>
              <select
                formControlName="method"
                class="form-input"
                [class.border-red-500]="
                  paymentForm.get('method')?.invalid &&
                  paymentForm.get('method')?.touched
                "
              >
                <option value="">Sélectionner une méthode de paiement</option>
                <option value="Cash">Espèces</option>
                <option value="MobileMoney">Mobile Money</option>
                <option value="Cheque">Chèque</option>
                <option value="BankTransfer">Virement bancaire</option>
                <option value="Card">Carte</option>
              </select>
              <div
                *ngIf="
                  paymentForm.get('method')?.invalid &&
                  paymentForm.get('method')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                Veuillez sélectionner une méthode de paiement
              </div>
            </div>

            <div>
              <label class="form-label">Date du paiement *</label>
              <input
                type="datetime-local"
                formControlName="date"
                class="form-input"
                [class.border-red-500]="
                  paymentForm.get('date')?.invalid &&
                  paymentForm.get('date')?.touched
                "
              />
              <div
                *ngIf="
                  paymentForm.get('date')?.invalid &&
                  paymentForm.get('date')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
                La date du paiement est requise
              </div>
            </div>

            <div>
              <label class="form-label">Référence</label>
              <input
                type="text"
                formControlName="reference"
                class="form-input"
                placeholder="Référence de transaction (facultatif)"
              />
            </div>
          </div>

          <div>
            <label class="form-label">Notes</label>
            <textarea
              formControlName="notes"
              rows="3"
              class="form-input"
              placeholder="Ajouter une note pour ce paiement"
            ></textarea>
          </div>

          <!-- Résumé du paiement -->
          <div class="border-t pt-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-lg font-medium text-gray-900 mb-3">
                Résumé du paiement
              </h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Montant dû actuel :</span>
                  <span class="text-sm font-medium"
                    >\GNF {{ invoice.amountDue.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600"
                    >Montant du paiement :</span
                  >
                  <span class="text-sm font-medium"
                    >\GNF {{
                      (paymentForm.get('amount')?.value || 0).toFixed(2)
                    }}</span
                  >
                </div>
                <div class="border-t pt-2">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Solde restant :</span>
                    <span
                      [ngClass]="
                        getRemainingBalance() === 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      "
                    >
                      \GNF {{ getRemainingBalance().toFixed(2) }}
                    </span>
                  </div>
                </div>
                <div
                  *ngIf="getRemainingBalance() === 0"
                  class="text-center text-green-600 font-medium"
                >
                  ✓ La facture sera totalement réglée
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end space-x-4">
            <button type="button" (click)="goBack()" class="btn-outline">
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="paymentForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Traitement...</span>
              Enregistrer le paiement
            </button>
          </div>
        </form>
      </div>

      <!-- Paiements précédents -->
      <div class="card" *ngIf="invoice.payments.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Paiements précédents
        </h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Montant
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Méthode
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Référence
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let payment of invoice.payments">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ payment.date | date : 'short' }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                >
                  \GNF {{ payment.amount.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ payment.method }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ payment.reference || 'N/A' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  invoice: Invoice | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  invoiceId: string | null = null;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly pdfService: PDFService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      method: ['', Validators.required],
      date: ['', Validators.required],
      reference: [''],
      notes: [''],
    });
  }

  ngOnInit() {
    (async () => {
      this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');
      if (this.invoiceId) {
        await this.loadInvoiceData();
        this.setDefaultDate();
        this.setupAmountValidation();
      }
    })();
  }

  private async loadInvoiceData(): Promise<void> {
    try {
      this.invoice = await this.garageDataService.getById<Invoice>(
        'invoices',
        this.invoiceId!
      );

      if (this.invoice) {
        [this.client, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Client>(
            'clients',
            this.invoice.clientId
          ),
          this.garageDataService.getById<Vehicle>(
            'vehicles',
            this.invoice.vehicleId
          ),
        ]);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load invoice data');
    }
  }

  private setDefaultDate(): void {
    const now = new Date();
    this.paymentForm.patchValue({
      date: now.toISOString().slice(0, 16),
    });
  }

  private setupAmountValidation(): void {
    if (this.invoice) {
      this.paymentForm
        .get('amount')
        ?.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.invoice.amountDue),
        ]);
    }
  }

  getRemainingBalance(): number {
    if (!this.invoice) return 0;
    const paymentAmount = this.paymentForm.get('amount')?.value || 0;
    return Math.max(0, this.invoice.amountDue - paymentAmount);
  }

  async onSubmit(): Promise<void> {
    if (this.paymentForm.invalid || !this.invoice) return;

    this.isLoading = true;

    try {
      const formValue = this.paymentForm.value;
      const paymentAmount = parseFloat(formValue.amount);

      // Create payment object
      const payment: Payment = {
        id: this.generateId(),
        amount: paymentAmount,
        method: formValue.method as PaymentMethod,
        date: new Date(formValue.date),
      };

      if (formValue.reference) {
        payment.reference = formValue.reference;
      }
      if (formValue.notes) {
        payment.notes = formValue.notes;
      }

      // Update invoice
      const updatedPayments = [...this.invoice.payments, payment];
      const newAmountPaid = this.invoice.amountPaid + paymentAmount;
      const newAmountDue = this.invoice.totalAmount - newAmountPaid;

      let newStatus: 'Unpaid' | 'Partial' | 'Paid' = 'Unpaid';
      if (newAmountDue === 0) {
        newStatus = 'Paid';
      } else if (newAmountPaid > 0) {
        newStatus = 'Partial';
      }

      const updateData = {
        payments: updatedPayments,
        amountPaid: newAmountPaid,
        amountDue: newAmountDue,
        status: newStatus,
      };

      await this.garageDataService.update(
        'invoices',
        this.invoiceId!,
        updateData
      );

      // Generate receipt
      if (this.client) {
        const clientName = `${this.client.firstName} ${this.client.lastName}`;
        await this.pdfService.generatePaymentReceiptPDF(
          payment,
          this.invoice.invoiceNumber,
          clientName
        );
      }

      this.notificationService.showSuccess('Payment recorded successfully');
      this.router.navigate(['/invoices', this.invoiceId]);
    } catch (error) {
      this.notificationService.showError('Failed to record payment');
      console.log("Échec de l'enregistrement du paiement" + error);
    } finally {
      this.isLoading = false;
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'status-paid';
      case 'unpaid':
        return 'status-unpaid';
      case 'partial':
        return 'status-partial';
      case 'overdue':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices', this.invoiceId]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}