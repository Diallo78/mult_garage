import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { Invoice } from '../../models/invoice.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe, FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  // template: `
  //   <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  //   </div>

  //   <div *ngIf="!isLoading">
  //   <div class="space-y-6" *ngIf="invoice">
  //     <div class="md:flex md:items-center md:justify-between">
  //       <div class="flex-1 min-w-0">
  //         <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
  //           Invoice {{ invoice.invoiceNumber }}
  //         </h2>
  //         <p class="text-lg text-gray-600">
  //           <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
  //             {{ invoice.status }}
  //           </span>
  //         </p>
  //       </div>
  //       <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
  //         <button
  //           (click)="downloadPDF()"
  //           class="btn-secondary"
  //         >
  //           Download PDF
  //         </button>
  //         <button
  //           [routerLink]="['/payments/create', invoice.id]"
  //           class="btn-primary"
  //           *ngIf="invoice.status !== 'Paid'"
  //         >
  //           Add Payment
  //         </button>
  //       </div>
  //     </div>

  //     <!-- Invoice Information -->
  //     <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //       <div class="card">
  //         <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice Details</h3>
  //         <div class="space-y-3">
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Invoice Number</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ invoice.invoiceNumber }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Created Date</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ invoice.createdAt | firestoreDate | date:'medium' }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Due Date</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ invoice.dueDate | firestoreDate | date:'medium' }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Status</label>
  //             <p class="mt-1">
  //               <span class="status-badge" [ngClass]="getStatusClass(invoice.status)">
  //                 {{ invoice.status }}
  //               </span>
  //             </p>
  //           </div>
  //         </div>
  //       </div>

  //       <div class="card" *ngIf="client && vehicle">
  //         <h3 class="text-lg font-medium text-gray-900 mb-4">Client & Vehicle</h3>
  //         <div class="space-y-3">
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Client</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Phone</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ client.phone }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">Vehicle</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
  //           </div>
  //           <div>
  //             <label class="text-sm font-medium text-gray-500">License Plate</label>
  //             <p class="mt-1 text-sm text-gray-900">{{ vehicle.licensePlate }}</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Invoice Items -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Invoice Items</h3>
  //       <div class="overflow-x-auto">
  //         <table class="min-w-full divide-y divide-gray-200">
  //           <thead class="bg-gray-50">
  //             <tr>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Description
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Type
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Quantity
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Unit Price
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Subtotal
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody class="bg-white divide-y divide-gray-200">
  //             <tr *ngFor="let item of invoice.items">
  //               <td class="px-6 py-4 whitespace-nowrap">
  //                 <div class="text-sm font-medium text-gray-900">{{ item.description }}</div>
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap">
  //                 <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
  //                       [ngClass]="getTypeClass(item.type)">
  //                   {{ item.type }}
  //                 </span>
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                 {{ item.quantity }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                 \${{ item.unitPrice.toFixed(2) }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
  //                 \${{ item.subtotal.toFixed(2) }}
  //               </td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>

  //     <!-- Invoice Totals -->
  //     <div class="card">
  //       <div class="max-w-md ml-auto">
  //         <div class="space-y-2">
  //           <div class="flex justify-between">
  //             <span class="text-sm text-gray-600">Subtotal:</span>
  //             <span class="text-sm font-medium">\${{ invoice.subtotal.toFixed(2) }}</span>
  //           </div>
  //           <div class="flex justify-between" *ngIf="invoice.discountAmount > 0">
  //             <span class="text-sm text-gray-600">Discount:</span>
  //             <span class="text-sm font-medium">-\${{ invoice.discountAmount.toFixed(2) }}</span>
  //           </div>
  //           <div class="flex justify-between">
  //             <span class="text-sm text-gray-600">VAT:</span>
  //             <span class="text-sm font-medium">\${{ invoice.vatAmount.toFixed(2) }}</span>
  //           </div>
  //           <div class="border-t pt-2">
  //             <div class="flex justify-between text-lg font-bold">
  //               <span>Total:</span>
  //               <span>\${{ invoice.totalAmount.toFixed(2) }}</span>
  //             </div>
  //           </div>
  //           <div class="border-t pt-2">
  //             <div class="flex justify-between text-sm">
  //               <span class="text-gray-600">Amount Paid:</span>
  //               <span class="font-medium text-green-600">\${{ invoice.amountPaid.toFixed(2) }}</span>
  //             </div>
  //             <div class="flex justify-between text-lg font-bold">
  //               <span class="text-red-600">Amount Due:</span>
  //               <span class="text-red-600">\${{ invoice.amountDue.toFixed(2) }}</span>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Payment History -->
  //     <div class="card" *ngIf="invoice.payments.length > 0">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Payment History</h3>
  //       <div class="overflow-x-auto">
  //         <table class="min-w-full divide-y divide-gray-200">
  //           <thead class="bg-gray-50">
  //             <tr>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Date
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Amount
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Method
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Reference
  //               </th>
  //               <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
  //                 Actions
  //               </th>
  //             </tr>
  //           </thead>
  //           <tbody class="bg-white divide-y divide-gray-200">
  //             <tr *ngFor="let payment of invoice.payments">
  //               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                 {{ payment.date | firestoreDate | date:'short' }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
  //                 \${{ payment.amount.toFixed(2) }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                 {{ payment.method }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                 {{ payment.reference || 'N/A' }}
  //               </td>
  //               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                 <button
  //                   (click)="downloadPaymentReceipt(payment)"
  //                   class="text-primary-600 hover:text-primary-900"
  //                 >
  //                   Receipt
  //                 </button>
  //               </td>
  //             </tr>
  //           </tbody>
  //         </table>
  //       </div>
  //     </div>
  //   </div>
  //   </div>
  // `
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
      ></div>
    </div>

    <div *ngIf="!isLoading" class="p-3 sm:p-4">
      <div class="space-y-4 md:space-y-6" *ngIf="invoice">
        <!-- Header Section -->
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
              Facture {{ invoice.invoiceNumber }}
            </h2>
            <p class="text-base sm:text-lg text-gray-600 mt-1">
              <span
                class="status-badge text-sm sm:text-base"
                [ngClass]="getStatusClass(invoice.status)"
              >
                {{ invoice.status }}
              </span>
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2 sm:mt-0">
            <button
              (click)="downloadPDF()"
              class="btn-secondary w-full sm:w-auto"
            >
              Télécharger PDF
            </button>
            <button
              *ngIf="invoice.status !== 'Paid'"
              [routerLink]="['/payments/create', invoice.id]"
              class="btn-primary w-full sm:w-auto"
            >
              Ajouter paiement
            </button>
          </div>
        </div>

        <!-- Invoice Information - Responsive Grid -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Invoice Details Card -->
          <div class="card p-3 sm:p-4">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3">
              Détails de la facture
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >N° Facture</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ invoice.invoiceNumber }}
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Statut</label
                >
                <p class="mt-1">
                  <span
                    class="status-badge text-xs sm:text-sm"
                    [ngClass]="getStatusClass(invoice.status)"
                  >
                    {{ invoice.status }}
                  </span>
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Créée le</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ invoice.createdAt | firestoreDate | date : 'short' }}
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Échéance</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ invoice.dueDate | firestoreDate | date : 'short' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Client & Vehicle Card -->
          <div class="card p-3 sm:p-4" *ngIf="client && vehicle">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3">
              Client & Véhicule
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2">
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Client</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ client.firstName }} {{ client.lastName }}
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Téléphone</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ client.phone }}
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Véhicule</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ vehicle.brand }} {{ vehicle.model }}
                </p>
              </div>
              <div class="col-span-2">
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Plaque d'immatriculation</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ vehicle.licensePlate }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice Items - Responsive Table -->
        <div class="card overflow-hidden">
          <h3
            class="text-base sm:text-lg font-medium text-gray-900 mb-3 p-3 sm:p-4"
          >
            Articles
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Qté
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prix unit.
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Sous-total
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let item of invoice.items" class="hover:bg-gray-50">
                  <!-- Mobile View -->
                  <td class="px-3 py-3 sm:px-4 block sm:table-cell">
                    <div class="flex flex-col sm:flex-row">
                      <div class="flex-1">
                        <div
                          class="text-xs sm:text-sm font-medium text-gray-900 sm:hidden"
                        >
                          Article
                        </div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ item.description }}
                        </div>
                        <div class="sm:hidden mt-1 grid grid-cols-2 gap-2">
                          <div>
                            <div class="text-xs text-gray-500">Type</div>
                            <span
                              class="text-xs"
                              [ngClass]="getTypeClass(item.type)"
                            >
                              {{ item.type }}
                            </span>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500">Qté</div>
                            <div class="text-xs text-gray-900">
                              {{ item.quantity }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500">Prix unit.</div>
                            <div class="text-xs text-gray-900">
                              \${{ item.unitPrice.toFixed(2) }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500">Total</div>
                            <div class="text-xs font-medium text-gray-900">
                              \${{ item.subtotal.toFixed(2) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </td>

                  <!-- Desktop View -->
                  <td
                    class="px-3 py-3 sm:px-4 whitespace-nowrap hidden sm:table-cell"
                  >
                    <span
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      [ngClass]="getTypeClass(item.type)"
                    >
                      {{ item.type }}
                    </span>
                  </td>
                  <td
                    class="px-3 py-3 sm:px-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell"
                  >
                    {{ item.quantity }}
                  </td>
                  <td
                    class="px-3 py-3 sm:px-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell"
                  >
                    \${{ item.unitPrice.toFixed(2) }}
                  </td>
                  <td
                    class="px-3 py-3 sm:px-4 whitespace-nowrap text-sm font-medium text-gray-900 hidden sm:table-cell"
                  >
                    \${{ item.subtotal.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Invoice Totals -->
        <div class="card p-3 sm:p-4">
          <div class="max-w-md ml-auto">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-xs sm:text-sm text-gray-600"
                  >Sous-total:</span
                >
                <span class="text-xs sm:text-sm font-medium"
                  >\${{ invoice.subtotal.toFixed(2) }}</span
                >
              </div>
              <div
                class="flex justify-between"
                *ngIf="invoice.discountAmount > 0"
              >
                <span class="text-xs sm:text-sm text-gray-600">Remise:</span>
                <span class="text-xs sm:text-sm font-medium"
                  >-\${{ invoice.discountAmount.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-xs sm:text-sm text-gray-600">TVA:</span>
                <span class="text-xs sm:text-sm font-medium"
                  >\${{ invoice.vatAmount.toFixed(2) }}</span
                >
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-sm sm:text-lg font-bold">
                  <span>Total:</span>
                  <span>\${{ invoice.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-xs sm:text-sm">
                  <span class="text-gray-600">Payé:</span>
                  <span class="font-medium text-green-600"
                    >\${{ invoice.amountPaid.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between text-sm sm:text-lg font-bold">
                  <span class="text-red-600">Dû:</span>
                  <span class="text-red-600"
                    >\${{ invoice.amountDue.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="card p-3 sm:p-4" *ngIf="invoice.payments.length > 0">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3">
            Historique des paiements
          </h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50 hidden sm:table-header-group">
                <tr>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Montant
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                  >
                    Méthode
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell"
                  >
                    Référence
                  </th>
                  <th
                    class="px-3 py-2 sm:px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  *ngFor="let payment of invoice.payments"
                  class="hover:bg-gray-50"
                >
                  <!-- Mobile View -->
                  <td class="px-3 py-3 sm:px-4 block sm:table-cell">
                    <div class="flex flex-col">
                      <div class="text-sm font-medium text-gray-900">
                        {{ payment.date | firestoreDate | date : 'short' }}
                      </div>
                      <div class="sm:hidden text-xs text-gray-500 mt-1">
                        <div>Montant: \${{ payment.amount.toFixed(2) }}</div>
                        <div>Méthode: {{ payment.method }}</div>
                        <div *ngIf="payment.reference">
                          Réf: {{ payment.reference }}
                        </div>
                      </div>
                      <div class="sm:hidden mt-1">
                        <button
                          (click)="downloadPaymentReceipt(payment)"
                          class="text-primary-600 hover:text-primary-900 text-xs"
                        >
                          Reçu
                        </button>
                      </div>
                    </div>
                  </td>

                  <!-- Desktop View -->
                  <td class="px-3 py-4 whitespace-nowrap hidden sm:table-cell">
                    <div class="text-sm font-medium text-gray-900">
                      \${{ payment.amount.toFixed(2) }}
                    </div>
                  </td>
                  <td class="px-3 py-4 whitespace-nowrap hidden md:table-cell">
                    <div class="text-sm text-gray-900">
                      {{ payment.method }}
                    </div>
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell"
                  >
                    {{ payment.reference || 'N/A' }}
                  </td>
                  <td
                    class="px-3 py-4 whitespace-nowrap text-sm font-medium hidden sm:table-cell"
                  >
                    <button
                      (click)="downloadPaymentReceipt(payment)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      Reçu
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  invoiceId: string | null = null;
  isLoading = true;

  constructor(
    private garageDataService: GarageDataService,
    private notificationService: NotificationService,
    private pdfService: PDFService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId) {
      await this.loadInvoiceData();
    }
  }

  private async loadInvoiceData(): Promise<void> {
    this.isLoading = true;
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
    } finally {
      this.isLoading = false;
    }
  }

  async downloadPDF(): Promise<void> {
    if (!this.invoice || !this.client || !this.vehicle) return;

    try {
      const clientName = `${this.client.firstName} ${this.client.lastName}`;
      const vehicleInfo = `${this.vehicle.brand} ${this.vehicle.model} (${this.vehicle.licensePlate})`;

      const pipeDate = new FirestoreDatePipeTS();
      const _createdAt = pipeDate.transform(this.invoice.createdAt);
      const dueDate = pipeDate.transform(this.invoice.dueDate);
      this.invoice.dueDate = new Date(dueDate);
      this.invoice.createdAt = new Date(_createdAt);

      await this.pdfService.generateInvoicePDF(
        this.invoice,
        clientName,
        vehicleInfo
      );
      this.notificationService.showSuccess('PDF downloaded successfully');
    } catch (error) {
      this.notificationService.showError('Failed to generate PDF');
      console.log('Failed to generate PDF ' + error);
    }
  }

  async downloadPaymentReceipt(payment: any): Promise<void> {
    if (!this.invoice || !this.client) return;

    try {
      const clientName = `${this.client.firstName} ${this.client.lastName}`;
      await this.pdfService.generatePaymentReceiptPDF(
        payment,
        this.invoice.invoiceNumber,
        clientName
      );
      this.notificationService.showSuccess('Receipt downloaded successfully');
    } catch (error) {
      this.notificationService.showError('Failed to generate receipt');
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

  getTypeClass(type: string): string {
    switch (type) {
      case 'Part':
        return 'bg-blue-100 text-blue-800';
      case 'Labor':
        return 'bg-green-100 text-green-800';
      case 'Service':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}