import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Quote } from '../../models/quote.model';
import { Diagnostic } from '../../models/diagnostic.model';
import { Visit, Client, Vehicle } from '../../models/client.model';
import { UserManagementService } from '../../services/user-management.service';
import { AuthService } from '../../services/auth.service';
import { EmailService } from '../../services/email.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-quote-new-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="space-y-6" *ngIf="clients">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            {{ isEditMode ? 'Modifier le devis' : 'Créer un devis' }}
          </h2>
          <p class="text-sm text-gray-600 mt-1" *ngIf="isEditMode && existingQuote">
            Modification du devis N° <span class="font-semibold text-primary-700">{{ existingQuote.quoteNumber }}</span>
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
                [class.border-red-500]="
                  quoteForm.get('validUntil')?.invalid &&
                  quoteForm.get('validUntil')?.touched
                "
              />
              <div
                *ngIf="
                  quoteForm.get('validUntil')?.invalid &&
                  quoteForm.get('validUntil')?.touched
                "
                class="mt-1 text-sm text-red-600"
              >
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
              <select
                formControlName="clientId"
                (change)="onClientSelected($event)"
                class="form-input"
              >
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
                Ajouter un détail
              </button>
            </div>

            <div formArrayName="items" class="space-y-4">
              <div
                *ngFor="let item of itemsArray.controls; let i = index"
                [formGroupName]="i"
                class="border rounded-lg p-4 bg-gray-50"
              >
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label class="form-label">Type</label>
                    <select formControlName="type" class="form-input">
                      <option value="Part">Part(Piéce)</option>
                      <option value="Labor">Labor(M.O)</option>
                      <option value="Service">Service</option>
                    </select>
                  </div>

                  <!-- <div class="md:col-span-2">
                    <label class="form-label">Description *</label>

                    <ng-container
                      [ngSwitch]="itemsArray.at(i).get('type')?.value"
                    >
                      Si Part => liste déroulante
                      <select
                        *ngSwitchCase="'Part'"
                        formControlName="designation"
                        class="form-input"
                        (change)="onSelectPart(i)"
                      >
                        <option value="">-- Sélectionnez une pièce --</option>
                        <option
                          *ngFor="let part of stockParts"
                          [value]="part.designation"
                        >
                          {{ part.designation }}
                        </option>
                      </select>

                      Sinon champ libre
                      <input
                        *ngSwitchDefault
                        type="text"
                        formControlName="designation"
                        class="form-input"
                        placeholder="Description manuelle"
                      />
                    </ng-container>
                  </div> -->

                  <div class="md:col-span-2">
                    <label class="form-label">Description *</label>
                    <input
                      type="text"
                      formControlName="designation"
                      class="form-input"
                      placeholder="Saisir ou rechercher une pièce"
                      [attr.list]="
                        (itemsArray.at(i).get('designation')?.value?.length ||
                          0) >= 1
                          ? 'stockPartsList-' + i
                          : null
                      "
                      autocomplete="off"
                      (input)="onAutoCompletePart(i)"
                    />
                    <!-- Liste d'options autocomplétées -->
                    <datalist [id]="'stockPartsList-' + i">
                      <option
                        *ngFor="
                          let part of filterStockParts(
                            itemsArray.at(i).get('designation')?.value
                          )
                        "
                        [value]="part.designation"
                      ></option>
                    </datalist>
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
                  <div class="flex items-center justify-between">
                    <button
                      type="button"
                      (click)="removeItem(i)"
                      class="text-red-600 hover:text-red-900 text-sm"
                      [disabled]="itemsArray.length === 1"
                    >
                      Retirer le détail
                    </button>
                    <button
                      type="button"
                      (click)="addItem()"
                      class="text-blue-600 hover:text-blue-900 text-sm ml-2"

                    >
                      Ajouter un détail
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== SECTION FINANCIÈRE : REMISE, TVA & PRÉCOMPTE ===== -->
          <div class="border rounded-xl p-5 bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200 space-y-6">
            <div class="flex items-center justify-between border-b pb-3">
              <h3 class="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg class="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Paramètres financiers & Taxes
              </h3>
              <span class="text-xs text-gray-500 hidden sm:inline">Calculs automatiques en temps réel</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Colonne Gauche : Configuration Remise, TVA & Précompte -->
              <div class="space-y-4">
                <!-- 1. GESTION DE LA REMISE -->
                <div class="border rounded-lg p-4 bg-white shadow-sm">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        formControlName="hasDiscount"
                        (change)="onDiscountToggle()"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 font-medium text-gray-800 text-xs sm:text-sm">
                        Appliquer une remise sur le sous-total HT
                      </span>
                    </label>
                    <span
                      class="text-xs px-2 py-0.5 rounded font-medium"
                      [ngClass]="quoteForm.get('hasDiscount')?.value ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ quoteForm.get('hasDiscount')?.value ? 'Active' : 'Désactivée' }}
                    </span>
                  </div>

                  <div *ngIf="quoteForm.get('hasDiscount')?.value" class="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label class="form-label text-xs">Type de remise</label>
                        <select
                          formControlName="discountType"
                          (change)="calculateTotals()"
                          class="form-input text-xs"
                        >
                          <option value="percentage">Pourcentage (%)</option>
                          <option value="fixed">Montant fixe (GNF)</option>
                        </select>
                      </div>

                      <div>
                        <label class="form-label text-xs">
                          {{ quoteForm.get('discountType')?.value === 'percentage' ? 'Taux de remise (%) *' : 'Montant de remise (GNF) *' }}
                        </label>
                        <input
                          type="number"
                          formControlName="discountValue"
                          (input)="calculateTotals()"
                          class="form-input text-xs"
                          [min]="0"
                          [max]="quoteForm.get('discountType')?.value === 'percentage' ? 100 : subtotal"
                          [step]="quoteForm.get('discountType')?.value === 'percentage' ? 0.5 : 1000"
                        />
                      </div>
                    </div>

                    <!-- Impact visuel immédiat -->
                    <div class="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex justify-between items-center">
                      <span>Montant déduit du HT :</span>
                      <span class="font-bold">- GNF {{ discountAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>
                  </div>
                </div>

                <!-- 2. GESTION DE LA TVA -->
                <div class="border rounded-lg p-4 bg-white shadow-sm">
                  <div class="flex items-center justify-between mb-2">
                    <label class="form-label text-xs mb-0 font-medium text-gray-800">Taux de TVA (%) *</label>
                    <span class="text-xs text-gray-500">Appliquée sur le montant HT net</span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 items-center">
                    <input
                      type="number"
                      formControlName="vatRate"
                      (input)="calculateTotals()"
                      class="form-input text-xs"
                      min="0"
                      max="100"
                      step="0.5"
                    />
                    <div class="text-xs text-gray-600 text-right">
                      Montant TVA : <strong class="text-gray-900">GNF {{ vatAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</strong>
                    </div>
                  </div>
                </div>

                <!-- 3. GESTION DU PRÉCOMPTE -->
                <div class="border rounded-lg p-4 bg-white shadow-sm">
                  <div class="flex items-center justify-between">
                    <label class="flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        formControlName="hasPrecompte"
                        (change)="onPrecompteToggle()"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span class="ml-2 font-medium text-gray-800 text-xs sm:text-sm">
                        Appliquer un précompte sur la TVA
                      </span>
                    </label>
                    <span
                      class="text-xs px-2 py-0.5 rounded font-medium"
                      [ngClass]="quoteForm.get('hasPrecompte')?.value ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'"
                    >
                      {{ quoteForm.get('hasPrecompte')?.value ? 'Actif' : 'Désactivé' }}
                    </span>
                  </div>

                  <div *ngIf="quoteForm.get('hasPrecompte')?.value" class="mt-4 pt-3 border-t border-gray-100 space-y-3">
                    <div>
                      <div class="flex justify-between items-center mb-1">
                        <label class="form-label text-xs mb-0">Taux de précompte sur la TVA (%) *</label>
                        <span class="text-[11px] text-gray-500">Ex: 50% ou 100% de la TVA</span>
                      </div>
                      <input
                        type="number"
                        formControlName="precompteRate"
                        (input)="calculateTotals()"
                        class="form-input text-xs"
                        min="0"
                        max="100"
                        step="0.5"
                        placeholder="Ex: 50"
                      />
                    </div>

                    <!-- Impact visuel immédiat -->
                    <div class="p-2.5 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-800 flex justify-between items-center">
                      <div>
                        <span>Montant retenu sur la TVA :</span>
                        <div class="text-[10px] text-indigo-600">Calculé sur la TVA (GNF {{ vatAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }})</div>
                      </div>
                      <span class="font-bold">- GNF {{ precompteAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <p class="text-[11px] text-gray-500 leading-tight">
                      * Conformément à la règle comptable et fiscale, le précompte est calculé sur le montant de la TVA. Il est distinctement déduit du total TTC pour déterminer le net à payer.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Colonne Droite : Récapitulatif Totaux en temps réel -->
              <div class="bg-white border rounded-lg p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
                    Décomposition financière en temps réel
                  </h4>

                  <div class="space-y-3 text-sm">
                    <!-- Sous-total HT -->
                    <div class="flex justify-between text-gray-700">
                      <span>Sous-total HT :</span>
                      <span class="font-medium text-gray-900">GNF {{ subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <!-- Remise (si applicable) -->
                    <div
                      *ngIf="quoteForm.get('hasDiscount')?.value && discountAmount > 0"
                      class="flex justify-between text-emerald-700 bg-emerald-50 p-2 rounded"
                    >
                      <span>
                        Remise ({{ quoteForm.get('discountType')?.value === 'percentage' ? (quoteForm.get('discountValue')?.value || 0) + '%' : 'Fixe' }}) :
                      </span>
                      <span class="font-semibold">- GNF {{ discountAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <!-- Total HT après remise -->
                    <div
                      *ngIf="quoteForm.get('hasDiscount')?.value && discountAmount > 0"
                      class="flex justify-between text-gray-800 font-medium"
                    >
                      <span>Total HT après remise :</span>
                      <span>GNF {{ subtotalAfterDiscount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <!-- TVA -->
                    <div class="flex justify-between text-gray-700">
                      <span>TVA ({{ quoteForm.get('vatRate')?.value || 0 }}%) :</span>
                      <span class="font-medium text-gray-900">GNF {{ vatAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <!-- Total TTC -->
                    <div class="flex justify-between font-semibold text-gray-900 pt-2 border-t">
                      <span>Total TTC :</span>
                      <span>GNF {{ total.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>

                    <!-- Précompte TVA (si applicable) -->
                    <div
                      *ngIf="quoteForm.get('hasPrecompte')?.value && precompteAmount > 0"
                      class="flex justify-between text-indigo-700 bg-indigo-50 p-2 rounded"
                    >
                      <span>
                        Précompte TVA ({{ quoteForm.get('precompteRate')?.value || 0 }}%) :
                      </span>
                      <span class="font-semibold">- GNF {{ precompteAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Net à payer mis en valeur -->
                <div class="mt-6 pt-4 border-t-2 border-primary-200 bg-primary-50 p-4 rounded-xl">
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="text-xs uppercase font-bold text-primary-800 tracking-wider">Montant final</span>
                      <div class="text-lg font-extrabold text-primary-900">Net à payer :</div>
                    </div>
                    <div class="text-2xl font-black text-primary-700">
                      GNF {{ netToPay.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                  </div>
                  <div *ngIf="quoteForm.get('hasPrecompte')?.value && precompteAmount > 0" class="text-[11px] text-primary-600 mt-1">
                    * Déduction faite du précompte TVA de GNF {{ precompteAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Boutons de soumission & Informations -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
            <div class="text-xs text-gray-500">
              <span *ngIf="!isEditMode">
                ℹ️ Le devis sera enregistré en mode <strong>Brouillon (inaccessible au client)</strong>. Vous pourrez l'envoyer au client après validation.
              </span>
              <span *ngIf="isEditMode">
                ℹ️ Les modifications seront enregistrées et conservent l'état actuel de visibilité dans l'espace client.
              </span>
            </div>

            <div class="flex space-x-3 w-full sm:w-auto justify-end">
              <button type="button" (click)="goBack()" class="btn-outline">
                Annuler
              </button>
              <button
                type="submit"
                [disabled]="quoteForm.invalid || isLoading || !canEdit"
                class="btn-primary"
              >
                <span *ngIf="isLoading" class="mr-2">Enregistrement...</span>
                {{ isEditMode ? 'Enregistrer les modifications' : 'Créer le devis' }}
              </button>
            </div>
          </div>

          <div *ngIf="!canEdit" class="text-sm text-red-600 text-right">
            Vous n'avez pas la permission de créer/modifier des devis
          </div>
        </form>
      </div>
    </div>
  `,
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

  // Mode Édition / Création
  isEditMode = false;
  quoteId: string | null = null;
  existingQuote: Quote | null = null;

  // Calculs financiers
  subtotal = 0;
  discountAmount = 0;
  subtotalAfterDiscount = 0;
  vatAmount = 0;
  total = 0;
  precompteAmount = 0;
  netToPay = 0;

  stockParts: { designation: string; prixUnitaire: number }[] = [];

  // Options d'envoi
  sendWhatsApp = true;
  sendEmail = false;
  sendSMS = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly authService: AuthService,
    private readonly userManagementService: UserManagementService,
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.quoteForm = this.fb.group({
      quoteNumber: [''],
      validUntil: ['', Validators.required],
      kilometrage: [''],
      clientId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      items: this.fb.array([this.createItemGroup()]),
      // Configuration Remise
      hasDiscount: [false],
      discountType: ['percentage'],
      discountValue: [0, [Validators.min(0)]],
      // Configuration TVA
      vatRate: [18, [Validators.required, Validators.min(0), Validators.max(100)]],
      // Configuration Précompte
      hasPrecompte: [false],
      precompteRate: [0, [Validators.min(0), Validators.max(100)]],
    });
  }

  get itemsArray(): FormArray {
    return this.quoteForm.get('items') as FormArray;
  }

  ngOnInit() {
    (async () => {
      this.quoteId = this.route.snapshot.paramMap.get('id');
      this.isEditMode = !!this.quoteId;

      await this.loadClients();
      await this.loadStockParts();

      if (this.isEditMode && this.quoteId) {
        await this.loadExistingQuote(this.quoteId);
      } else {
        this.generateQuoteNumber();
        this.setDefaultValidUntil();
      }

      await this.checkEditPermissions();
      this.calculateTotals();
    })();
  }

  private async loadExistingQuote(id: string): Promise<void> {
    this.isLoading = true;
    try {
      this.existingQuote = await this.garageDataService.getById<Quote>('quotes', id);
      if (this.existingQuote) {
        if (this.existingQuote.clientId) {
          await this.loadVehiclesForClient(this.existingQuote.clientId);
        }

        const validUntilDate = this.existingQuote.validUntil ? new Date(this.existingQuote.validUntil) : new Date();
        const formattedValidUntil = validUntilDate.toISOString().split('T')[0];

        this.quoteForm.patchValue({
          quoteNumber: this.existingQuote.quoteNumber,
          validUntil: formattedValidUntil,
          kilometrage: this.existingQuote.kilometrage || '',
          clientId: this.existingQuote.clientId,
          vehicleId: this.existingQuote.vehicleId,
          hasDiscount: !!this.existingQuote.hasDiscount,
          discountType: this.existingQuote.discountType || 'percentage',
          discountValue: this.existingQuote.discountValue || 0,
          vatRate: typeof this.existingQuote.vatRate === 'number' ? this.existingQuote.vatRate : 18,
          hasPrecompte: !!this.existingQuote.hasPrecompte,
          precompteRate: this.existingQuote.precompteRate || 0,
        });

        // Charger les articles
        while (this.itemsArray.length > 0) {
          this.itemsArray.removeAt(0);
        }

        if (this.existingQuote.items && this.existingQuote.items.length > 0) {
          this.existingQuote.items.forEach((item) => {
            this.itemsArray.push(
              this.fb.group({
                id: [item.id || this.generateId()],
                designation: [item.designation, Validators.required],
                quantity: [item.quantity, [Validators.required, Validators.min(1)]],
                unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
                subtotal: [item.subtotal || item.quantity * item.unitPrice],
                type: [item.type || 'Part'],
              })
            );
          });
        } else {
          this.itemsArray.push(this.createItemGroup());
        }

        this.calculateTotals();
      }
    } catch (error) {
      this.notificationService.showError('Impossible de charger le devis existant : ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadClients(): Promise<void> {
    this.isLoading = true;
    try {
      this.clients = await this.garageDataService.getAll<Client>('clients');
    } catch (error) {
      this.notificationService.showError(
        'Impossible de charger la liste des clients ' + error
      );
    } finally {
      this.isLoading = false;
    }
  }

  private async loadStockParts(): Promise<void> {
    const stockItems = await this.garageDataService.getAll<any>('stock');
    this.stockParts = stockItems
      .filter((item) => item.status === 'entre')
      .map((item) => ({
        designation: item.designation,
        prixUnitaire: item.prixUnitaire,
      }));
  }

  private async checkEditPermissions(): Promise<void> {
    const currentUser = await firstValueFrom(this.authService.currentUser$);
    if (currentUser) {
      this.canEdit =
        this.userManagementService.hasPermission(
          currentUser.role,
          'quotes:write'
        ) ||
        this.userManagementService.hasPermission(
          currentUser.role,
          'quotes:approve'
        );
    }
  }

  private generateQuoteNumber(): void {
    const quoteNumber = this.garageDataService.generateUniqueNumber('DV');
    this.quoteForm.patchValue({ quoteNumber });
  }

  private setDefaultValidUntil(): void {
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 30); // 30 days from now
    this.quoteForm.patchValue({
      validUntil: validUntil.toISOString().split('T')[0],
    });
  }

  async onClientSelected(event: any): Promise<void> {
    const clientId = event.target.value;
    if (!clientId) {
      this.vehiclesForClient = [];
      this.quoteForm.patchValue({ vehicleId: '' });
      return;
    }
    await this.loadVehiclesForClient(clientId);
  }

  private async loadVehiclesForClient(clientId: string): Promise<void> {
    try {
      this.vehiclesForClient = await this.garageDataService.getAll<Vehicle>(
        'vehicles'
      );
      this.vehiclesForClient = this.vehiclesForClient.filter(
        (v) => v.clientId === clientId
      );
    } catch (error) {
      this.notificationService.showError(
        'Impossible de charger les véhicules du client ' + error
      );
    }
  }

  onDiscountToggle(): void {
    if (!this.quoteForm.get('hasDiscount')?.value) {
      this.quoteForm.patchValue({ discountValue: 0 });
    }
    this.calculateTotals();
  }

  onPrecompteToggle(): void {
    if (!this.quoteForm.get('hasPrecompte')?.value) {
      this.quoteForm.patchValue({ precompteRate: 0 });
    }
    this.calculateTotals();
  }

  private createItemGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      designation: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0],
      type: ['Part'],
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
    const quantity = Number(item.get('quantity')?.value) || 0;
    const unitPrice = Number(item.get('unitPrice')?.value) || 0;
    const subtotal = Math.max(0, quantity * unitPrice);

    item.patchValue({ subtotal }, { emitEvent: false });
    this.calculateTotals();
  }

  getItemSubtotal(index: number): number {
    const item = this.itemsArray.at(index);
    const quantity = Number(item.get('quantity')?.value) || 0;
    const unitPrice = Number(item.get('unitPrice')?.value) || 0;
    return Math.max(0, quantity * unitPrice);
  }

  calculateTotals(): void {
    // 1. Sous-total HT = somme des prestations/articles
    this.subtotal = this.itemsArray.controls.reduce((sum, item) => {
      const quantity = Number(item.get('quantity')?.value) || 0;
      const unitPrice = Number(item.get('unitPrice')?.value) || 0;
      return sum + Math.max(0, quantity * unitPrice);
    }, 0);

    // 2. Gestion de la remise (appliquée sur le HT)
    const hasDiscount = !!this.quoteForm.get('hasDiscount')?.value;
    const discountType = this.quoteForm.get('discountType')?.value || 'percentage';
    let discountVal = Number(this.quoteForm.get('discountValue')?.value) || 0;

    if (discountVal < 0) {
      discountVal = 0;
      this.quoteForm.patchValue({ discountValue: 0 }, { emitEvent: false });
    }

    if (hasDiscount && this.subtotal > 0) {
      if (discountType === 'percentage') {
        if (discountVal > 100) {
          discountVal = 100;
          this.quoteForm.patchValue({ discountValue: 100 }, { emitEvent: false });
        }
        this.discountAmount = (this.subtotal * discountVal) / 100;
      } else {
        // Montant fixe : plafonné au sous-total HT
        if (discountVal > this.subtotal) {
          discountVal = this.subtotal;
          this.quoteForm.patchValue({ discountValue: this.subtotal }, { emitEvent: false });
        }
        this.discountAmount = discountVal;
      }
    } else {
      this.discountAmount = 0;
    }

    // 3. Montant HT après remise
    this.subtotalAfterDiscount = Math.max(0, this.subtotal - this.discountAmount);

    // 4. Calcul de la TVA sur le montant HT après remise
    let vatRate = Number(this.quoteForm.get('vatRate')?.value);
    if (isNaN(vatRate) || vatRate < 0) vatRate = 0;
    if (vatRate > 100) {
      vatRate = 100;
      this.quoteForm.patchValue({ vatRate: 100 }, { emitEvent: false });
    }
    this.vatAmount = (this.subtotalAfterDiscount * vatRate) / 100;

    // 5. Total TTC
    this.total = this.subtotalAfterDiscount + this.vatAmount;

    // 6. Gestion du précompte (calculé sur le montant de la TVA)
    const hasPrecompte = !!this.quoteForm.get('hasPrecompte')?.value;
    let precompteRate = Number(this.quoteForm.get('precompteRate')?.value) || 0;

    if (precompteRate < 0) {
      precompteRate = 0;
      this.quoteForm.patchValue({ precompteRate: 0 }, { emitEvent: false });
    }
    if (precompteRate > 100) {
      precompteRate = 100;
      this.quoteForm.patchValue({ precompteRate: 100 }, { emitEvent: false });
    }

    if (hasPrecompte && this.vatAmount > 0) {
      this.precompteAmount = (this.vatAmount * precompteRate) / 100;
    } else {
      this.precompteAmount = 0;
    }

    // 7. Net à payer = Total TTC - Précompte
    this.netToPay = Math.max(0, this.total - this.precompteAmount);
  }

  onSelectPart(index: number): void {
    const item = this.itemsArray.at(index);
    const selectedDesignation = item.get('designation')?.value;
    const part = this.stockParts.find(
      (p) => p.designation === selectedDesignation
    );

    if (part) {
      item.patchValue({
        unitPrice: part.prixUnitaire,
      });
      this.calculateItemSubtotal(index);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.quoteForm.invalid) return;

    this.isLoading = true;

    try {
      const formValue = this.quoteForm.value;
      this.calculateTotals();

      const clientId = this.diagnostic ? this.client!.id : formValue.clientId;
      const vehicleId = this.diagnostic
        ? this.diagnostic.vehicleId
        : formValue.vehicleId;

      const currentUser = await firstValueFrom(this.authService.currentUser$);
      const adminName = currentUser?.displayName || currentUser?.email || 'Administrateur';

      const items = formValue.items.map((item: any) => ({
        ...item,
        subtotal: (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
      }));

      if (this.isEditMode && this.quoteId && this.existingQuote) {
        // Mode Modification : mettre à jour le devis existant
        const updateData: Partial<Quote> = {
          clientId,
          vehicleId,
          quoteNumber: formValue.quoteNumber,
          validUntil: new Date(formValue.validUntil),
          kilometrage: formValue.kilometrage,
          items,
          subtotal: this.subtotal,
          hasDiscount: !!formValue.hasDiscount,
          discountType: formValue.discountType,
          discountValue: Number(formValue.discountValue) || 0,
          discountAmount: this.discountAmount,
          subtotalAfterDiscount: this.subtotalAfterDiscount,
          vatRate: Number(formValue.vatRate) || 0,
          vatAmount: this.vatAmount,
          total: this.total,
          hasPrecompte: !!formValue.hasPrecompte,
          precompteRate: Number(formValue.precompteRate) || 0,
          precompteAmount: this.precompteAmount,
          netToPay: this.netToPay,
          updatedAt: new Date(),
          revisionHistory: [
            ...(this.existingQuote.revisionHistory || []),
            {
              id: this.generateId(),
              revisionNumber: (this.existingQuote.revisionHistory?.length || 0) + 1,
              changes: 'Mise à jour des prestations et/ou des conditions financières',
              createdAt: new Date(),
              createdBy: adminName,
            },
          ],
        };

        await this.garageDataService.update('quotes', this.quoteId, updateData);
        this.notificationService.showSuccess('Devis modifié avec succès');
        this.router.navigate(['/quotes', this.quoteId]);
      } else {
        // Mode Création : isVisibleToClient = false par défaut (Brouillon)
        const quoteData: Omit<Quote, 'id'> = {
          garageId: currentUser?.garageId || (this.diagnostic ? this.diagnostic.garageId : 'defaultGarage'),
          diagnosticId: this.diagnosticId || '0011',
          vehicleId,
          clientId,
          quoteNumber: formValue.quoteNumber,
          items,
          subtotal: this.subtotal,
          hasDiscount: !!formValue.hasDiscount,
          discountType: formValue.discountType,
          discountValue: Number(formValue.discountValue) || 0,
          discountAmount: this.discountAmount,
          subtotalAfterDiscount: this.subtotalAfterDiscount,
          vatRate: Number(formValue.vatRate) || 0,
          vatAmount: this.vatAmount,
          total: this.total,
          hasPrecompte: !!formValue.hasPrecompte,
          precompteRate: Number(formValue.precompteRate) || 0,
          precompteAmount: this.precompteAmount,
          netToPay: this.netToPay,
          status: 'Pending',
          isVisibleToClient: false,
          validUntil: new Date(formValue.validUntil),
          kilometrage: formValue.kilometrage,
          revisionHistory: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await this.garageDataService.create('quotes', quoteData);

        this.notificationService.showSuccess('Devis créé avec succès (enregistré en brouillon)');
        this.router.navigate(['/quotes']);
      }
    } catch (error) {
      this.notificationService.showError('Impossible d\'enregistrer le devis : ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    if (this.isEditMode && this.quoteId) {
      this.router.navigate(['/quotes', this.quoteId]);
    } else {
      this.router.navigate(['/quotes']);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }

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
      const message = `Bonjour ${client.firstName},

      Nous avons le plaisir de vous informer que votre devis N° ${quoteNumber} est désormais disponible.

      Vous pouvez le consulter et le télécharger en suivant ce lien :
      ${window.location.origin}/quotes/${quoteId}

      Nous restons à votre disposition pour toute information complémentaire.

      Merci de votre confiance,
      L’équipe CarGest 🚘📑`;

      await this.emailService.sendWhatsAppMessage(client.phone!, message);
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

  filterStockParts(
    input: string | null | undefined
  ): { designation: string; prixUnitaire: number }[] {
    if (!input || input.length < 1) return [];
    const query = input.toLowerCase().trim();
    return this.stockParts
      .filter((part) => part.designation.toLowerCase().includes(query))
      .slice(0, 8);
  }

  onAutoCompletePart(index: number): void {
    const item = this.itemsArray.at(index);
    const typedValue = item.get('designation')?.value;
    const part = this.stockParts.find((p) => p.designation === typedValue);

    if (part) {
      item.patchValue({
        unitPrice: part.prixUnitaire,
      });
      this.calculateItemSubtotal(index);
    }
  }
  
}
