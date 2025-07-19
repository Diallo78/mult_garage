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
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Add Payment
          </h2>
          <p class="text-lg text-gray-600">
            Invoice {{ invoice.invoiceNumber }} - {{ client.firstName }} {{ client.lastName }}
          </p>
        </div>
      </div>

      <!-- Invoice Summary -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Total Amount</label>
            <p class="mt-1 text-lg font-bold text-gray-900">\${{ invoice.totalAmount.toFixed(2) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Amount Paid</label>
            <p class="mt-1 text-lg font-bold text-green-600">\${{ invoice.amountPaid.toFixed(2) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Amount Due</label>
            <p class="mt-1 text-lg font-bold text-red-600">\${{ invoice.amountDue.toFixed(2) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Status</label>
            <p class="mt-1">
              <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
                {{ invoice.status }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Form -->
      <div class="card">
        <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Payment Amount *</label>
              <input
                type="number"
                formControlName="amount"
                class="form-input"
                [class.border-red-500]="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched"
                placeholder="Enter payment amount"
                min="0.01"
                [max]="invoice.amountDue"
                step="0.01"
              />
              <div *ngIf="paymentForm.get('amount')?.invalid && paymentForm.get('amount')?.touched" class="mt-1 text-sm text-red-600">
                <span *ngIf="paymentForm.get('amount')?.errors?.['required']">Payment amount is required</span>
                <span *ngIf="paymentForm.get('amount')?.errors?.['min']">Amount must be greater than 0</span>
                <span *ngIf="paymentForm.get('amount')?.errors?.['max']">Amount cannot exceed amount due</span>
              </div>
              <div class="mt-1 text-sm text-gray-500">
                Maximum: \${{ invoice.amountDue.toFixed(2) }}
              </div>
            </div>

            <div>
              <label class="form-label">Payment Method *</label>
              <select
                formControlName="method"
                class="form-input"
                [class.border-red-500]="paymentForm.get('method')?.invalid && paymentForm.get('method')?.touched"
              >
                <option value="">Select payment method</option>
                <option value="Cash">Cash</option>
                <option value="MobileMoney">Mobile Money</option>
                <option value="Cheque">Cheque</option>
                <option value="BankTransfer">Bank Transfer</option>
                <option value="Card">Card</option>
              </select>
              <div *ngIf="paymentForm.get('method')?.invalid && paymentForm.get('method')?.touched" class="mt-1 text-sm text-red-600">
                Please select a payment method
              </div>
            </div>

            <div>
              <label class="form-label">Payment Date *</label>
              <input
                type="datetime-local"
                formControlName="date"
                class="form-input"
                [class.border-red-500]="paymentForm.get('date')?.invalid && paymentForm.get('date')?.touched"
              />
              <div *ngIf="paymentForm.get('date')?.invalid && paymentForm.get('date')?.touched" class="mt-1 text-sm text-red-600">
                Payment date is required
              </div>
            </div>

            <div>
              <label class="form-label">Reference Number</label>
              <input
                type="text"
                formControlName="reference"
                class="form-input"
                placeholder="Transaction reference (optional)"
              />
            </div>
          </div>

          <div>
            <label class="form-label">Notes</label>
            <textarea
              formControlName="notes"
              rows="3"
              class="form-input"
              placeholder="Additional notes about this payment"
            ></textarea>
          </div>

          <!-- Payment Summary -->
          <div class="border-t pt-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="text-lg font-medium text-gray-900 mb-3">Payment Summary</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Current Amount Due:</span>
                  <span class="text-sm font-medium">\${{ invoice.amountDue.toFixed(2) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Payment Amount:</span>
                  <span class="text-sm font-medium">\${{ (paymentForm.get('amount')?.value || 0).toFixed(2) }}</span>
                </div>
                <div class="border-t pt-2">
                  <div class="flex justify-between text-lg font-bold">
                    <span>Remaining Balance:</span>
                    <span [ngClass]="getRemainingBalance() === 0 ? 'text-green-600' : 'text-red-600'">
                      \${{ getRemainingBalance().toFixed(2) }}
                    </span>
                  </div>
                </div>
                <div *ngIf="getRemainingBalance() === 0" class="text-center text-green-600 font-medium">
                  ✓ Invoice will be fully paid
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
              [disabled]="paymentForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Processing...</span>
              Record Payment
            </button>
          </div>
        </form>
      </div>

      <!-- Existing Payments -->
      <div class="card" *ngIf="invoice.payments.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Previous Payments</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let payment of invoice.payments">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ payment.date | date:'short' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  \${{ payment.amount.toFixed(2) }}
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
  `
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup;
  invoice: Invoice | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  invoiceId: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private pdfService: PDFService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.paymentForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(0.01)]],
      method: ['', Validators.required],
      date: ['', Validators.required],
      reference: [''],
      notes: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.invoiceId = this.route.snapshot.paramMap.get('invoiceId');
    if (this.invoiceId) {
      await this.loadInvoiceData();
      this.setDefaultDate();
      this.setupAmountValidation();
    }
  }

  private async loadInvoiceData(): Promise<void> {
    try {
      this.invoice = await this.garageDataService.getById<Invoice>('invoices', this.invoiceId!);

      if (this.invoice) {
        [this.client, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Client>('clients', this.invoice.clientId),
          this.garageDataService.getById<Vehicle>('vehicles', this.invoice.vehicleId)
        ]);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load invoice data');
    }
  }

  private setDefaultDate(): void {
    const now = new Date();
    this.paymentForm.patchValue({
      date: now.toISOString().slice(0, 16)
    });
  }

  private setupAmountValidation(): void {
    if (this.invoice) {
      this.paymentForm.get('amount')?.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(this.invoice.amountDue)
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
        date: new Date(formValue.date)
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
        status: newStatus
      };

      await this.garageDataService.update('invoices', this.invoiceId!, updateData);

      // Generate receipt
      if (this.client) {
        const clientName = `${this.client.firstName} ${this.client.lastName}`;
        await this.pdfService.generatePaymentReceiptPDF(payment, this.invoice.invoiceNumber, clientName);
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
      case 'paid': return 'status-paid';
      case 'unpaid': return 'status-unpaid';
      case 'partial': return 'status-partial';
      case 'overdue': return 'status-rejected';
      default: return 'status-pending';
    }
  }

  goBack(): void {
    this.router.navigate(['/invoices', this.invoiceId]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}