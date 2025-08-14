import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Invoice, InvoiceItem } from '../../models/invoice.model';
import { Intervention } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6" *ngIf="intervention && quote && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create Invoice
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }}
          </p>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Invoice Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Invoice Number</label>
              <input
                type="text"
                formControlName="invoiceNumber"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            <div>
              <label class="form-label">Due Date *</label>
              <input
                type="date"
                formControlName="dueDate"
                class="form-input"
                [class.border-red-500]="invoiceForm.get('dueDate')?.invalid && invoiceForm.get('dueDate')?.touched"
              />
              <div *ngIf="invoiceForm.get('dueDate')?.invalid && invoiceForm.get('dueDate')?.touched" class="mt-1 text-sm text-red-600">
                Due date is required
              </div>
            </div>
          </div>

          <!-- Invoice Items -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Invoice Items</label>
              <button
                type="button"
                (click)="addItem()"
                class="btn-secondary text-sm"
              >
                Add Item
              </button>
            </div>

            <div formArrayName="items" class="space-y-4">
              <div *ngFor="let item of itemsArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
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
                    <label class="form-label">Quantity *</label>
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
                    <label class="form-label">Unit Price *</label>
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
                    Subtotal: \${{ getItemSubtotal(i).toFixed(2) }}
                  </div>
                  <button
                    type="button"
                    (click)="removeItem(i)"
                    class="text-red-600 hover:text-red-900 text-sm"
                    [disabled]="itemsArray.length === 1"
                  >
                    Remove Item
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Discount and VAT -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Discount Amount</label>
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
              <label class="form-label">VAT Rate (%)</label>
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
                <span class="text-sm text-gray-600">Subtotal:</span>
                <span class="text-sm font-medium">\${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between" *ngIf="discountAmount > 0">
                <span class="text-sm text-gray-600">Discount:</span>
                <span class="text-sm font-medium">-\${{ discountAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">VAT ({{ invoiceForm.get('vatRate')?.value }}%):</span>
                <span class="text-sm font-medium">\${{ vatAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>\${{ totalAmount.toFixed(2) }}</span>
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
              [disabled]="invoiceForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Creating...</span>
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm: FormGroup;
  intervention: Intervention | null = null;
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  interventionId: string | null = null;
  isLoading = false;

  subtotal = 0;
  discountAmount = 0;
  vatAmount = 0;
  totalAmount = 0;

  constructor(
    private fb: FormBuilder,
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: [''],
      dueDate: ['', Validators.required],
      discountAmount: [0],
      vatRate: [18],
      items: this.fb.array([])
    });
  }

  get itemsArray(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    this.interventionId = this.route.snapshot.paramMap.get('interventionId');
    if (this.interventionId) {
      await this.loadInterventionData();
      this.generateInvoiceNumber();
      this.setDefaultDueDate();
      this.populateItemsFromIntervention();
    }
  }

  private async loadInterventionData(): Promise<void> {
    try {
      this.intervention = await this.garageDataService.getById<Intervention>('interventions', this.interventionId!);

      if (this.intervention) {
        [this.quote, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Quote>('quotes', this.intervention.quoteId),
          this.garageDataService.getById<Vehicle>('vehicles', this.intervention.vehicleId)
        ]);

        if (this.quote) {
          this.client = await this.garageDataService.getById<Client>('clients', this.quote.clientId);
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load intervention data');
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
      dueDate: dueDate.toISOString().split('T')[0]
    });
  }

  private populateItemsFromIntervention(): void {
    if (!this.intervention || !this.quote) return;

    // Add items from original quote
    this.quote.items.forEach(quoteItem => {
      this.itemsArray.push(this.createItemGroup(
        quoteItem.designation,
        quoteItem.quantity,
        quoteItem.unitPrice,
        quoteItem.type
      ));
    });

    // Add used parts from intervention
    this.intervention.usedParts.forEach(part => {
      this.itemsArray.push(this.createItemGroup(
        part.partName,
        part.quantity,
        part.unitCost,
        'Part'
      ));
    });

    // Add extra costs if any
    this.intervention.extraCosts.forEach(cost => {
      this.itemsArray.push(this.createItemGroup(
        cost.description,
        1,
        cost.amount,
        'Service'
      ));
    });

    this.calculateTotals();
  }

  private createItemGroup(description: string = '', quantity: number = 1, unitPrice: number = 0, type: string = 'Service'): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      description: [description, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
      subtotal: [quantity * unitPrice],
      type: [type]
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

    this.discountAmount = this.invoiceForm.get('discountAmount')?.value || 0;
    const discountedSubtotal = this.subtotal - this.discountAmount;

    const vatRate = this.invoiceForm.get('vatRate')?.value || 0;
    this.vatAmount = discountedSubtotal * (vatRate / 100);
    this.totalAmount = discountedSubtotal + this.vatAmount;
  }

  async onSubmit(): Promise<void> {
    if (this.invoiceForm.invalid || !this.intervention || !this.quote || !this.client) return;

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
          subtotal: item.quantity * item.unitPrice
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
        updatedAt: new Date()
      };

      const invocieRef = await this.garageDataService.create('invoices', invoiceData);

      // 2. Créer une notification associée au devis
      const notification = {
        title: 'Nouveau facture',
        message: `Un nouveau facture (N° ${formValue.invoiceNumber}) est disponible.`,
        read: false,
        quoteId: invocieRef,
        emailDesitnateur: this.client.email,
        type: 'Facture'
      };

      await this.garageDataService.create('notifications', notification);

      this.notificationService.showSuccess('Invoice created successfully');
      this.router.navigate(['/invoices']);
    } catch (error) {
      this.notificationService.showError('Failed to create invoice ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/interventions']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}