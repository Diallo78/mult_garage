import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { PDFService } from '../../services/pdf.service';
import { PrintTemplateService } from '../../services/print-template.service';
import {
  PrintDocumentData,
  PrintRendererService,
} from '../../services/print-renderer.service';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import {
  FirestoreDatePipe,
  FirestoreDatePipeTS,
} from '../../pipe/firestore-date.pipe';
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
            <div class="flex items-center gap-3 flex-wrap">
              <h2 class="text-xl sm:text-2xl font-bold leading-7 text-gray-900">
                Devis N° {{ quote.quoteNumber }}
              </h2>
              <!-- Indicateur de statut métier -->
              <span
                class="status-badge text-xs sm:text-sm"
                [ngClass]="getStatusClass(quote.status)"
              >
                {{ quote.status }}
              </span>
              <!-- Indicateur de visibilité client pour le personnel -->
              <ng-container *ngIf="!this.authService.isClient">
                <span
                  *ngIf="quote.isVisibleToClient"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  <svg class="mr-1 h-3.5 w-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                  Visible par le client
                </span>
                <span
                  *ngIf="!quote.isVisibleToClient"
                  class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                >
                  <svg class="mr-1 h-3.5 w-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                    <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                  </svg>
                  Brouillon / Non envoyé
                </span>
              </ng-container>
            </div>

            <!-- Traçabilité d'envoi / retrait de visibilité -->
            <div *ngIf="!this.authService.isClient" class="mt-1 text-xs text-gray-500">
              <span *ngIf="quote.isVisibleToClient && quote.sentToClientAt">
                Envoyé au client le {{ quote.sentToClientAt | firestoreDate | date : 'dd/MM/yyyy à HH:mm' }}
                <span *ngIf="quote.sentToClientBy">par {{ quote.sentToClientBy }}</span>
              </span>
              <span *ngIf="!quote.isVisibleToClient && quote.visibilityRevokedAt">
                Visibilité retirée le {{ quote.visibilityRevokedAt | firestoreDate | date : 'dd/MM/yyyy à HH:mm' }}
                <span *ngIf="quote.visibilityRevokedBy">par {{ quote.visibilityRevokedBy }}</span>
              </span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
            <!-- Bouton Modifier pour le personnel -->
            <button
              *ngIf="!this.authService.isClient && this.authService.canAccessBtnEdit"
              [routerLink]="['/quotes', quote.id, 'edit']"
              class="btn-secondary w-full sm:w-auto"
            >
              Modifier
            </button>

            <!-- Actions de visibilité administrateur -->
            <button
              *ngIf="!this.authService.isClient && !quote.isVisibleToClient"
              type="button"
              (click)="openVisibilityModal(true)"
              class="btn-primary bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto text-white"
            >
              Envoyer au client
            </button>
            <button
              *ngIf="!this.authService.isClient && quote.isVisibleToClient"
              type="button"
              (click)="openVisibilityModal(false)"
              class="btn-secondary text-amber-700 hover:bg-amber-50 border-amber-300 w-full sm:w-auto"
            >
              Retirer la visibilité
            </button>

            <button
              (click)="downloadPDF()"
              class="btn-secondary w-full sm:w-auto"
            >
              Télécharger PDF
            </button>
            <button
              type="button"
              (click)="printWithTemplate()"
              class="btn-primary w-full sm:w-auto"
            >
              Imprimer
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
              <div *ngIf="!this.authService.isClient" class="col-span-2 border-t pt-2 mt-1">
                <div class="flex items-center justify-between text-xs sm:text-sm">
                  <span class="text-gray-500">Visibilité client :</span>
                  <span
                    class="font-semibold"
                    [ngClass]="quote.isVisibleToClient ? 'text-green-600' : 'text-amber-600'"
                  >
                    {{ quote.isVisibleToClient ? 'Visible dans l\'espace client' : 'Inaccessible au client (Brouillon)' }}
                  </span>
                </div>
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
        <div class="card p-4 sm:p-5">
          <div class="max-w-md ml-auto">
            <h4 class="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Récapitulatif financier</h4>
            <div class="space-y-2.5">
              <!-- Sous-total HT -->
              <div class="flex justify-between text-xs sm:text-sm">
                <span class="text-gray-600">Sous-total HT :</span>
                <span class="font-medium text-gray-900">
                  {{ formatAmount(quote.subtotal) }}
                </span>
              </div>

              <!-- Remise (si applicable) -->
              <div
                *ngIf="quote.hasDiscount && (quote.discountAmount || 0) > 0"
                class="flex justify-between text-xs sm:text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded"
              >
                <span>
                  Remise ({{ quote.discountType === 'percentage' ? quote.discountValue + '%' : 'Fixe' }}) :
                </span>
                <span class="font-semibold">
                  - {{ formatAmount(quote.discountAmount) }}
                </span>
              </div>

              <!-- Total HT après remise (si remise active) -->
              <div
                *ngIf="quote.hasDiscount && (quote.discountAmount || 0) > 0"
                class="flex justify-between text-xs sm:text-sm font-medium text-gray-800"
              >
                <span>Total HT après remise :</span>
                <span>
                  {{ formatAmount(quote.subtotalAfterDiscount ?? (quote.subtotal - (quote.discountAmount || 0))) }}
                </span>
              </div>

              <!-- TVA -->
              <div class="flex justify-between text-xs sm:text-sm">
                <span class="text-gray-600">TVA ({{ quote.vatRate }}%) :</span>
                <span class="font-medium text-gray-900">
                  {{ formatAmount(quote.vatAmount) }}
                </span>
              </div>

              <!-- Total TTC -->
              <div class="flex justify-between text-xs sm:text-sm font-semibold text-gray-900 pt-1 border-t">
                <span>Total TTC :</span>
                <span>
                  {{ formatAmount(quote.total) }}
                </span>
              </div>

              <!-- Précompte TVA (si applicable) -->
              <div
                *ngIf="quote.hasPrecompte && (quote.precompteAmount || 0) > 0"
                class="flex justify-between text-xs sm:text-sm text-indigo-700 bg-indigo-50 px-2 py-1 rounded"
              >
                <div class="flex flex-col">
                  <span>Précompte TVA :</span>
                  <span class="text-[10px] text-indigo-500">
                    ({{ quote.precompteRate ? quote.precompteRate + '% sur la TVA' : 'Montant retenu' }})
                  </span>
                </div>
                <span class="font-semibold">
                  - {{ formatAmount(quote.precompteAmount) }}
                </span>
              </div>

              <!-- Net à payer -->
              <div class="border-t-2 border-primary-200 pt-3 mt-2 bg-primary-50 p-3 rounded-lg">
                <div class="flex justify-between items-center text-sm sm:text-lg font-bold text-primary-900">
                  <span>Net à payer :</span>
                  <span class="text-primary-700">
                    {{ formatAmount(quote.netToPay ?? (quote.hasPrecompte && quote.precompteAmount ? quote.total - quote.precompteAmount : quote.total)) }}
                  </span>
                </div>
                <p *ngIf="quote.hasPrecompte && (quote.precompteAmount || 0) > 0" class="text-[11px] text-primary-600 mt-1">
                  * Montant net déduction faite de la retenue au titre du précompte TVA.
                </p>
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

      <!-- Visibility Confirmation Modal -->
      <div
        *ngIf="showVisibilityModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-5 sm:p-6 animate-fadeIn">
          <div class="flex items-center space-x-3 mb-4">
            <div
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              [ngClass]="pendingVisibilityState ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'"
            >
              <svg *ngIf="pendingVisibilityState" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg *ngIf="!pendingVisibilityState" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ pendingVisibilityState ? 'Envoyer au client' : 'Retirer la visibilité' }}
              </h3>
              <p class="text-xs text-gray-500">
                Devis N° {{ quote?.quoteNumber }}
              </p>
            </div>
          </div>

          <p class="text-sm text-gray-600 mb-6">
            <span *ngIf="pendingVisibilityState">
              En confirmant, ce devis deviendra immédiatement accessible au client dans son espace personnel. Le client pourra le consulter, le télécharger et l'accepter ou le refuser.
            </span>
            <span *ngIf="!pendingVisibilityState">
              En confirmant, la visibilité de ce devis sera temporairement retirée de l'espace client. Le client ne pourra plus y accéder jusqu'à un nouvel envoi.
            </span>
          </p>

          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="btn-secondary text-xs sm:text-sm"
              (click)="cancelVisibilityModal()"
              [disabled]="isUpdatingVisibility"
            >
              Annuler
            </button>
            <button
              type="button"
              (click)="submitToggleVisibility()"
              [disabled]="isUpdatingVisibility"
              [ngClass]="pendingVisibilityState ? 'btn-primary' : 'bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg shadow'"
              class="text-xs sm:text-sm"
            >
              <span *ngIf="isUpdatingVisibility" class="mr-2">Action en cours...</span>
              {{ pendingVisibilityState ? 'Confirmer l\'envoi' : 'Confirmer le retrait' }}
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

  // =============MODAL REJET==============
  showRejectionModal = false;
  rejectionTitle = '';
  rejectionMessage = '';

  // =============MODAL VISIBILITÉ==============
  showVisibilityModal = false;
  pendingVisibilityState = false;
  isUpdatingVisibility = false;

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly pdfService: PDFService,
    private readonly printTemplateService: PrintTemplateService,
    private readonly printRendererService: PrintRendererService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
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
        // Restriction de sécurité : un client ne peut consulter que les devis autorisés
        if (this.authService.isClient && !this.quote.isVisibleToClient) {
          this.notificationService.showError("Ce devis n'est pas encore accessible.");
          this.quote = null;
          this.router.navigate(['/client/dashboard']);
          return;
        }

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

  /**
   * Imprime le devis en utilisant le modèle d'impression personnalisé du
   * garage (repli sur le modèle par défaut si aucun n'a été configuré).
   * Le bouton « Télécharger PDF » existant reste inchangé.
   */
  async printWithTemplate(): Promise<void> {
    if (!this.quote || !this.client || !this.vehicle) return;

    try {
      const template = await this.printTemplateService.getTemplate('quote');
      const garage = await this.printRendererService.loadGarageInfo();
      const currency = garage?.currency ?? 'GNF';

      const data: PrintDocumentData = {
        documentType: 'quote',
        documentNumber: this.quote.quoteNumber,
        documentDate: this.formatDate(this.quote.createdAt),
        meta: [
          { label: "Valable jusqu'au", value: this.formatDate(this.quote.validUntil) },
          { label: 'Statut', value: this.quote.status },
        ],
        clientName: `${this.client.firstName} ${this.client.lastName}`,
        clientLines: [
          this.client.phone ? `Tél. : ${this.client.phone}` : '',
          this.client.email ? `E-mail : ${this.client.email}` : '',
          this.client.address ? `Adresse : ${this.client.address}` : '',
        ].filter((line) => !!line),
        vehicleLines: [
          `${this.vehicle.brand} ${this.vehicle.model}`,
          this.vehicle.licensePlate
            ? `Immatriculation : ${this.vehicle.licensePlate}`
            : '',
          this.quote.kilometrage
            ? `Kilométrage : ${this.quote.kilometrage}`
            : '',
        ].filter((line) => !!line),
        items: this.quote.items.map((item) => ({
          designation: item.designation,
          quantity: item.quantity,
          unitPrice: this.formatMoney(item.unitPrice, currency),
          total: this.formatMoney(item.subtotal, currency),
        })),
        itemsHead: ['Désignation', 'Qté', 'Prix unitaire', 'Total'],
        totals: [
          {
            label: 'Sous-total HT',
            value: this.formatMoney(this.quote.subtotal, currency),
          },
          ...(this.quote.hasDiscount && (this.quote.discountAmount || 0) > 0
            ? [
                {
                  label: `Remise (${this.quote.discountType === 'percentage' ? this.quote.discountValue + '%' : 'Fixe'})`,
                  value: `- ${this.formatMoney(this.quote.discountAmount, currency)}`,
                },
                {
                  label: 'Total HT après remise',
                  value: this.formatMoney(
                    this.quote.subtotalAfterDiscount ?? (this.quote.subtotal - (this.quote.discountAmount || 0)),
                    currency
                  ),
                },
              ]
            : []),
          {
            label: `TVA (${this.quote.vatRate}%)`,
            value: this.formatMoney(this.quote.vatAmount, currency),
          },
          {
            label: 'Total TTC',
            value: this.formatMoney(this.quote.total, currency),
            strong: !this.quote.hasPrecompte,
          },
          ...(this.quote.hasPrecompte && (this.quote.precompteAmount || 0) > 0
            ? [
                {
                  label: `Précompte TVA (${this.quote.precompteRate ? this.quote.precompteRate + '%' : 'Fixe'})`,
                  value: `- ${this.formatMoney(this.quote.precompteAmount, currency)}`,
                },
                {
                  label: 'Net à payer',
                  value: this.formatMoney(
                    this.quote.netToPay ?? (this.quote.total - (this.quote.precompteAmount || 0)),
                    currency
                  ),
                  strong: true,
                },
              ]
            : []),
        ],
        currency,
      };

      this.printRendererService.print(template, data, garage);
      this.notificationService.showSuccess('Document prêt pour impression');
    } catch (error) {
      this.notificationService.showError("Échec de l'impression : " + error);
    }
  }

  // ============= GESTION DE VISIBILITÉ =============
  openVisibilityModal(makeVisible: boolean): void {
    this.pendingVisibilityState = makeVisible;
    this.showVisibilityModal = true;
  }

  cancelVisibilityModal(): void {
    this.showVisibilityModal = false;
    this.pendingVisibilityState = false;
  }

  async submitToggleVisibility(): Promise<void> {
    if (!this.quoteId || !this.quote) return;
    this.isUpdatingVisibility = true;

    try {
      const currentUser = this.authService.getCurrentUser();
      const adminName = currentUser?.displayName || currentUser?.email || 'Administrateur';
      const makeVisible = this.pendingVisibilityState;

      const updates: Partial<Quote> = {
        isVisibleToClient: makeVisible,
      };

      if (makeVisible) {
        updates.sentToClientAt = new Date();
        updates.sentToClientBy = adminName;
        updates.sentToClientById = currentUser?.uid;
      } else {
        updates.visibilityRevokedAt = new Date();
        updates.visibilityRevokedBy = adminName;
      }

      await this.garageDataService.update('quotes', this.quoteId, updates);

      // Notification pour le client si visibilité accordée
      if (makeVisible && this.client?.email) {
        await this.garageDataService.create('notifications', {
          title: 'Nouveau devis disponible',
          message: `Votre devis N° ${this.quote.quoteNumber} est désormais consultable dans votre espace client.`,
          read: false,
          quoteId: this.quoteId,
          emailDesitnateur: this.client.email,
          type: 'Devis',
          garageId: this.quote.garageId,
          createdAt: new Date(),
        });
      }

      // Mise à jour locale
      this.quote.isVisibleToClient = makeVisible;
      if (makeVisible) {
        this.quote.sentToClientAt = updates.sentToClientAt;
        this.quote.sentToClientBy = updates.sentToClientBy;
      } else {
        this.quote.visibilityRevokedAt = updates.visibilityRevokedAt;
        this.quote.visibilityRevokedBy = updates.visibilityRevokedBy;
      }

      this.notificationService.showSuccess(
        makeVisible
          ? 'Le devis a été envoyé et est désormais visible par le client'
          : 'La visibilité du devis a été retirée pour le client'
      );
      this.cancelVisibilityModal();
    } catch (error) {
      this.notificationService.showError('Échec de la mise à jour de la visibilité : ' + error);
    } finally {
      this.isUpdatingVisibility = false;
    }
  }

  formatAmount(value: number | undefined): string {
    const amount = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `GNF ${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /** Convertit une date Firestore en date lisible (fr-FR). */
  private formatDate(value: unknown): string {
    if (!value) return '';
    const date = new FirestoreDatePipe().transform(value);
    return date ? date.toLocaleDateString('fr-FR') : '';
  }

  /** Formate un montant avec la devise du garage. */
  private formatMoney(value: number | undefined, currency: string): string {
    const amount = typeof value === 'number' ? value : 0;
    return `${amount.toLocaleString('fr-FR')} ${currency}`;
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