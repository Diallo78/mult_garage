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
  selector: 'app-quote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6" *ngIf="diagnostic && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create Quote
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }}
          </p>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="quoteForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Quote Details -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Quote Number</label>
              <input
                type="text"
                formControlName="quoteNumber"
                class="form-input bg-gray-100"
                readonly
              />
            </div>
            <div>
              <label class="form-label">Valid Until *</label>
              <input
                type="date"
                formControlName="validUntil"
                class="form-input"
                [class.border-red-500]="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched"
              />
              <div *ngIf="quoteForm.get('validUntil')?.invalid && quoteForm.get('validUntil')?.touched" class="mt-1 text-sm text-red-600">
                Valid until date is required
              </div>
            </div>
          </div>

          <!-- Quote Items -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Quote Items *</label>
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
                      formControlName="designation"
                      class="form-input"
                      placeholder="Part or service description"
                    />
                  </div>

                  <div>
                    <label class="form-label">Type</label>
                    <select formControlName="type" class="form-input">
                      <option value="Part">Part</option>
                      <option value="Labor">Labor</option>
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

          <!-- VAT Rate -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div class="flex justify-between">
                <span class="text-sm text-gray-600">VAT ({{ quoteForm.get('vatRate')?.value }}%):</span>
                <span class="text-sm font-medium">\${{ vatAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>\${{ total.toFixed(2) }}</span>
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
              [disabled]="quoteForm.invalid || isLoading || !canEdit"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Creating...</span>
              Create Quote
            </button>
            <div *ngIf="!canEdit" class="text-sm text-red-600">
              You don't have permission to create/edit quotes
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
      vatRate: [18],
      items: this.fb.array([this.createItemGroup()])
    });
  }

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  ngOnInit(){
    (async() => {
      this.diagnosticId = this.route.snapshot.paramMap.get('diagnosticId');
    if (this.diagnosticId) {
      await this.loadDiagnosticData();
      this.generateQuoteNumber();
      this.setDefaultValidUntil();
      await this.checkEditPermissions();
    }
    })()
  }

  private async checkEditPermissions(): Promise<void> {
    const currentUser = await firstValueFrom(this.authService.currentUser$) ;
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
      this.notificationService.showError('Failed to load diagnostic data');
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
        revisionHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.garageDataService.create('quotes', quoteData);
      this.notificationService.showSuccess('Quote created successfully');
      this.router.navigate(['/quotes']);
    } catch (error) {
      this.notificationService.showError('Failed to create quote');
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