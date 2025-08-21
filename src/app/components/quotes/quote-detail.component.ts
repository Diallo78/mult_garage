import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe, FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quote-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe, FormsModule],
  // template: `
  //   <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
  //     <div class="animate-pulse flex flex-col items-center">
  //       <div
  //         class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
  //       ></div>
  //       <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
  //     </div>
  //   </div>

  //   <div *ngIf="!isLoading">
  //     <div class="space-y-6" *ngIf="quote">
  //       <div class="md:flex md:items-center md:justify-between">
  //         <div class="flex-1 min-w-0">
  //           <h2
  //             class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
  //           >
  //             Devis N: {{ quote.quoteNumber }}
  //           </h2>
  //           <p class="text-lg text-gray-600">
  //             <span
  //               class="status-badge"
  //               [ngClass]="getStatusClass(quote.status)"
  //             >
  //               {{ quote.status }}
  //             </span>
  //           </p>
  //         </div>
  //         <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
  //           <button (click)="downloadPDF()" class="btn-secondary">
  //             Télécharger le PDF
  //           </button>
  //           @if(this.authService.isClient){
  //           <button
  //             (click)="updateStatus('Accepted')"
  //             class="btn-primary"
  //             *ngIf="quote.status === 'Pending'"
  //           >
  //             Accepter le devis
  //           </button>
  //           <button
  //             (click)="openRejectionModal()"
  //             class="btn-outline"
  //             *ngIf="quote.status === 'Pending'"
  //           >
  //             Rejeter le devis
  //           </button>
  //           }
  //           <button
  //             [routerLink]="['/interventions/create', quote.id]"
  //             class="btn-primary"
  //             *ngIf="
  //               this.authService.canBtnAccessInterventions &&
  //               quote.status === 'Accepted'
  //             "
  //           >
  //             Démarrer l'intervention
  //           </button>
  //         </div>
  //       </div>

  //       <!-- Quote Information -->
  //       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //         <div class="card">
  //           <h3 class="text-lg font-medium text-gray-900 mb-4">
  //             Quote Details
  //           </h3>
  //           <div class="space-y-3">
  //             <div>
  //               <label class="text-sm font-medium text-gray-500"
  //                 >Quote Number</label
  //               >
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ quote.quoteNumber }}
  //               </p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500"
  //                 >Created Date</label
  //               >
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ quote.createdAt | firestoreDate | date : 'medium' }}
  //               </p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500"
  //                 >Valid Until</label
  //               >
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ quote.validUntil | firestoreDate | date : 'medium' }}
  //               </p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500">Status</label>
  //               <p class="mt-1">
  //                 <span
  //                   class="status-badge"
  //                   [ngClass]="getStatusClass(quote.status)"
  //                 >
  //                   {{ quote.status }}
  //                 </span>
  //               </p>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="card" *ngIf="client && vehicle">
  //           <h3 class="text-lg font-medium text-gray-900 mb-4">
  //             Client & Vehicle
  //           </h3>
  //           <div class="space-y-3">
  //             <div>
  //               <label class="text-sm font-medium text-gray-500">Client</label>
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ client.firstName }} {{ client.lastName }}
  //               </p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500">Phone</label>
  //               <p class="mt-1 text-sm text-gray-900">{{ client.phone }}</p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500">Vehicle</label>
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ vehicle.brand }} {{ vehicle.model }}
  //               </p>
  //             </div>
  //             <div>
  //               <label class="text-sm font-medium text-gray-500"
  //                 >License Plate</label
  //               >
  //               <p class="mt-1 text-sm text-gray-900">
  //                 {{ vehicle.licensePlate }}
  //               </p>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Quote Items -->
  //       <div class="card">
  //         <h3 class="text-lg font-medium text-gray-900 mb-4">Quote Items</h3>
  //         <div class="overflow-x-auto">
  //           <table class="min-w-full divide-y divide-gray-200">
  //             <thead class="bg-gray-50">
  //               <tr>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Description
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Type
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Quantity
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Unit Price
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Subtotal
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody class="bg-white divide-y divide-gray-200">
  //               <tr *ngFor="let item of quote.items">
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="text-sm font-medium text-gray-900">
  //                     {{ item.designation }}
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
  //                     [ngClass]="getTypeClass(item.type)"
  //                   >
  //                     {{ item.type }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                   {{ item.quantity }}
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  //                   \${{ item.unitPrice.toFixed(2) }}
  //                 </td>
  //                 <td
  //                   class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
  //                 >
  //                   \${{ item.subtotal.toFixed(2) }}
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>

  //       <!-- Quote Totals -->
  //       <div class="card">
  //         <div class="max-w-md ml-auto">
  //           <div class="space-y-2">
  //             <div class="flex justify-between">
  //               <span class="text-sm text-gray-600">Subtotal:</span>
  //               <span class="text-sm font-medium"
  //                 >\${{ quote.subtotal.toFixed(2) }}</span
  //               >
  //             </div>
  //             <div class="flex justify-between">
  //               <span class="text-sm text-gray-600"
  //                 >VAT ({{ quote.vatRate }}%):</span
  //               >
  //               <span class="text-sm font-medium"
  //                 >\${{ quote.vatAmount.toFixed(2) }}</span
  //               >
  //             </div>
  //             <div class="border-t pt-2">
  //               <div class="flex justify-between text-lg font-bold">
  //                 <span>Total:</span>
  //                 <span>\${{ quote.total.toFixed(2) }}</span>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Revision History -->
  //       <div class="card" *ngIf="quote.revisionHistory.length > 0">
  //         <h3 class="text-lg font-medium text-gray-900 mb-4">
  //           Revision History
  //         </h3>
  //         <div class="space-y-3">
  //           <div
  //             *ngFor="let revision of quote.revisionHistory"
  //             class="border-l-4 border-blue-400 pl-4"
  //           >
  //             <div class="flex items-center justify-between">
  //               <h4 class="text-sm font-medium text-gray-900">
  //                 Revision {{ revision.revisionNumber }}
  //               </h4>
  //               <span class="text-xs text-gray-500">{{
  //                 revision.createdAt | date : 'short'
  //               }}</span>
  //             </div>
  //             <p class="text-sm text-gray-600 mt-1">{{ revision.changes }}</p>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Modal de refus -->

  //     <div
  //       *ngIf="showRejectionModal"
  //       class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
  //     >
  //       <div
  //         class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-slide-in-right"
  //       >
  //         <h2 class="text-lg font-semibold mb-4">Motif du refu</h2>

  //         <label class="form-label">Titre</label>
  //         <input
  //           type="text"
  //           [(ngModel)]="rejectionTitle"
  //           class="form-input mb-4"
  //         />

  //         <label class="form-label">Description</label>
  //         <textarea
  //           [(ngModel)]="rejectionMessage"
  //           rows="4"
  //           class="form-input mb-4"
  //         ></textarea>

  //         <div class="flex justify-end space-x-2">
  //           <button class="btn-secondary" (click)="cancelRejection()">
  //             Annuler
  //           </button>
  //           <button class="btn-primary" (click)="submitRejection()">
  //             Enregistrer
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // `,
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-pulse flex flex-col items-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
        ></div>
        <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
      </div>
    </div>

    <div *ngIf="!isLoading" class="p-2 sm:p-4">
      <div class="space-y-4 md:space-y-6" *ngIf="quote">
        <!-- Header Section -->
        <div
          class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        >
          <div class="min-w-0">
            <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
              Devis N: {{ quote.quoteNumber }}
            </h2>
            <p class="text-base sm:text-lg text-gray-600 mt-1">
              <span
                class="status-badge text-sm sm:text-base"
                [ngClass]="getStatusClass(quote.status)"
              >
                {{ quote.status }}
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
            @if(this.authService.isClient){
            <div class="flex gap-2 sm:gap-3">
              <button
                (click)="updateStatus('Accepted')"
                class="btn-primary w-full sm:w-auto"
                *ngIf="quote.status === 'Pending'"
              >
                Accepter
              </button>
              <button
                (click)="openRejectionModal()"
                class="btn-outline w-full sm:w-auto"
                *ngIf="quote.status === 'Pending'"
              >
                Rejeter
              </button>
            </div>
            }
            <button
              [routerLink]="['/interventions/create', quote.id]"
              class="btn-primary w-full sm:w-auto"
              *ngIf="
                this.authService.canBtnAccessInterventions &&
                quote.status === 'Accepted'
              "
            >
              Démarrer
            </button>
          </div>
        </div>

        <!-- Quote Information - Responsive Grid -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <!-- Quote Details Card -->
          <div class="card p-3 sm:p-4">
            <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3">
              Détails du devis
            </h3>
            <div class="grid grid-cols-2 gap-3">
              <div class="col-span-2 sm:col-span-1">
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Numéro</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ quote.quoteNumber }}
                </p>
              </div>
              <div class="col-span-2 sm:col-span-1">
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Statut</label
                >
                <p class="mt-1">
                  <span
                    class="status-badge text-xs sm:text-sm"
                    [ngClass]="getStatusClass(quote.status)"
                  >
                    {{ quote.status }}
                  </span>
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Créé le</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ quote.createdAt | firestoreDate | date : 'short' }}
                </p>
              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Kilométrage</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ quote.kilometrage }} km/h
                </p>

              </div>
              <div>
                <label class="text-xs sm:text-sm font-medium text-gray-500"
                  >Valide jusqu'au</label
                >
                <p class="mt-1 text-xs sm:text-sm text-gray-900">
                  {{ quote.validUntil | firestoreDate | date : 'short' }}
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

        <!-- Quote Items - Responsive Table -->
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
                <tr *ngFor="let item of quote.items" class="hover:bg-gray-50">
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
                          {{ item.designation }}
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
                              \GNF {{ item.unitPrice.toFixed(2) }}
                            </div>
                          </div>
                          <div>
                            <div class="text-xs text-gray-500">Total</div>
                            <div class="text-xs font-medium text-gray-900">
                              \GNF {{ item.subtotal.toFixed(2) }}
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
                    \GNF {{ item.unitPrice.toFixed(2) }}
                  </td>
                  <td
                    class="px-3 py-3 sm:px-4 whitespace-nowrap text-sm font-medium text-gray-900 hidden sm:table-cell"
                  >
                    \GNF {{ item.subtotal.toFixed(2) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Quote Totals -->
        <div class="card p-3 sm:p-4">
          <div class="max-w-md ml-auto">
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-xs sm:text-sm text-gray-600"
                  >Sous-total:</span
                >
                <span class="text-xs sm:text-sm font-medium"
                  >\GNF {{ quote.subtotal.toFixed(2) }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-xs sm:text-sm text-gray-600"
                  >TVA ({{ quote.vatRate }}%):</span
                >
                <span class="text-xs sm:text-sm font-medium"
                  >\GNF {{ quote.vatAmount.toFixed(2) }}</span
                >
              </div>
              <div class="border-t pt-2">
                <div class="flex justify-between text-sm sm:text-lg font-bold">
                  <span>Total:</span>
                  <span>\GNF {{ quote.total.toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Revision History -->
        <div class="card p-3 sm:p-4" *ngIf="quote.revisionHistory.length > 0">
          <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3">
            Historique des révisions
          </h3>
          <div class="space-y-3">
            <div
              *ngFor="let revision of quote.revisionHistory"
              class="border-l-4 border-blue-400 pl-3 py-2"
            >
              <div
                class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
              >
                <h4 class="text-xs sm:text-sm font-medium text-gray-900">
                  Révision {{ revision.revisionNumber }}
                </h4>
                <span class="text-xs text-gray-500">{{
                  revision.createdAt | date : 'short'
                }}</span>
              </div>
              <p class="text-xs sm:text-sm text-gray-600 mt-1">
                {{ revision.changes }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rejection Modal -->
      <div
        *ngIf="showRejectionModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      >
        <div
          class="bg-white rounded-lg shadow-lg w-full max-w-md p-4 sm:p-6 animate-slide-in-right"
        >
          <h2 class="text-lg font-semibold mb-3">Motif du refus</h2>

          <label class="form-label text-xs sm:text-sm">Titre</label>
          <input
            type="text"
            [(ngModel)]="rejectionTitle"
            class="form-input mb-3 text-xs sm:text-sm"
          />

          <label class="form-label text-xs sm:text-sm">Description</label>
          <textarea
            [(ngModel)]="rejectionMessage"
            rows="3"
            class="form-input mb-4 text-xs sm:text-sm"
          ></textarea>

          <div class="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              class="btn-secondary text-xs sm:text-sm"
              (click)="cancelRejection()"
            >
              Annuler
            </button>
            <button
              class="btn-primary text-xs sm:text-sm"
              (click)="submitRejection()"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class QuoteDetailComponent implements OnInit {
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  quoteId: string | null = null;
  isLoading = true;

  // =============MODAL==============
  showRejectionModal = false;
  rejectionTitle = '';
  rejectionMessage = '';

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly pdfService: PDFService,
    private readonly route: ActivatedRoute,
    public authService: AuthService
  ) {}

  ngOnInit(){
    (async()=> {
      this.quoteId = this.route.snapshot.paramMap.get('id');
      if (this.quoteId) {
        await this.loadQuoteData();
      }
    })()
  }

  private async loadQuoteData(): Promise<void> {
    this.isLoading = true;
    try {
      this.quote = await this.garageDataService.getById<Quote>(
        'quotes',
        this.quoteId!
      );

      if (this.quote) {
        [this.client, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Client>(
            'clients',
            this.quote.clientId
          ),
          this.garageDataService.getById<Vehicle>(
            'vehicles',
            this.quote.vehicleId
          ),
        ]);
      }
    } catch (error) {
      this.notificationService.showError('Failed to load quote data ' +error);
    } finally {
      this.isLoading = false;
    }
  }

  async updateStatus(status: 'Accepted'): Promise<void> {
    if (!this.quote) return;

    try {
      await this.garageDataService.update('quotes', this.quoteId!, { status });

      // Enregistrement d'une notification
      await this.garageDataService.create('notifications', {
        title: 'Devis accepté',
        message: `Le client a accepté le devis n°${this.quote.quoteNumber}. Vous pouvez désormais démarrer l'intervention.`,
        createdAt: new Date(),
        read: false,
        garageId: this.quote.garageId,
        emailDesitnateur: null, // ou undefined, car c'est le garage qui est notifié
        type: 'Devis'
      });

      this.quote.status = status;
      this.notificationService.showSuccess(
        `Quote ${status.toLowerCase()} successfully`
      );
    } catch (error) {
      this.notificationService.showError(
        `Failed to ${status.toLowerCase()} quote ${error}`
      );
    }
  }

  // =============== MODAL ===========
  openRejectionModal() {
    this.rejectionTitle = '';
    this.rejectionMessage = '';
    this.showRejectionModal = true;
  }

  cancelRejection() {
    this.showRejectionModal = false;
  }

  async submitRejection(): Promise<void> {
    if (!this.quoteId || !this.quote) return;
    if (!this.rejectionTitle.trim() || !this.rejectionMessage.trim()) {
      this.notificationService.showError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      // Mise à jour du devis
      await this.garageDataService.update('quotes', this.quoteId, {
        status: 'Rejected',
        rejectionReason: {
          title: this.rejectionTitle,
          message: this.rejectionMessage,
          date: new Date(),
        },
      });

      // Enregistrement d'une notification
      await this.garageDataService.create('notifications', {
        title: `Devis n°${this.quote.quoteNumber} rejeté`,
        message: `${this.rejectionTitle} – ${this.rejectionMessage}`,
        read: false,
        quoteId: this.quoteId,
        emailDesitnateur: null,
        type: 'Devis'
      });

      this.quote.status = 'Rejected'; // mise à jour locale
      this.notificationService.showSuccess('Le devis a été rejeté.');
      this.showRejectionModal = false;
    } catch (error) {
      this.notificationService.showError('Erreur lors du rejet du devis. ' +error);
    }
  }

  async downloadPDF(): Promise<void> {
    if (!this.quote || !this.client || !this.vehicle) return;

    try {
      const clientName = `${this.client.firstName} ${this.client.lastName}`;
      const vehicleInfo = `${this.vehicle.brand} ${this.vehicle.model} (${this.vehicle.licensePlate})`;

      const pipeDate = new FirestoreDatePipeTS();
      const dateFonctio = pipeDate.transform(this.quote.createdAt);
      this.quote.createdAt = new Date(dateFonctio);
      await this.pdfService.generateQuotePDF(
        this.quote,
        clientName,
        vehicleInfo
      );
      this.notificationService.showSuccess('PDF downloaded successfully');
    } catch (error) {
      this.notificationService.showError('Failed to generate PDF ' + error);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'accepted':
        return 'status-accepted';
      case 'rejected':
        return 'status-rejected';
      case 'expired':
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