import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { GarageDataService } from '../../services/garage-data.service';
import { Quote, QuoteItem } from '../../models/quote.model';
import { NotificationService } from '../../services/notification.service';
import { StockModel } from '../../models/stock-model';

@Component({
  selector: 'app-diagnostic-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"
      ></div>
    </div>

    <div *ngIf="!isLoading">
      <div class="p-6 space-y-6">
        <!-- Titre -->
        <div class="text-2xl font-bold text-primary-700">
          📦 Tableau de bord - Stock
        </div>

        <!-- Statistiques -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-700">Stock total</h3>
            <p class="text-2xl font-bold text-primary-600">{{ totalStock }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-700">Sorties totales</h3>
            <p class="text-2xl font-bold text-red-500">{{ totalSorties }}</p>
          </div>
          <div class="card">
            <h3 class="text-lg font-semibold text-gray-700">
              Pièces les + sorties (mensuel)
            </h3>
            <ul class="text-sm text-gray-600 mt-2 list-disc pl-4">
              <li *ngFor="let part of topSortiesMensuelles">{{ part }}</li>
            </ul>
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex justify-between items-center">
          <button class="btn-primary" (click)="showModal = true">
            + Ajouter
          </button>
          <button
            class="btn-secondary text-red-600"
            (click)="showSortieModal = true"
          >
            📤 Sortie
          </button>
        </div>

        <div class="mb-4">
          <label class="form-label">🔍 Rechercher un produit</label>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            placeholder="Tapez une désignation ou fournisseur..."
            class="form-input w-full"
          />
        </div>
        <!-- Tableau -->
        <div
          class="overflow-x-auto bg-white shadow rounded-lg border border-gray-200"
        >
          <table class="min-w-full divide-y divide-gray-200">
            <thead
              class="bg-gray-50 text-left text-sm font-medium text-gray-700"
            >
              <tr>
                <th class="px-4 py-3">Date Sortie</th>
                <th class="px-4 py-3">Fournisseur</th>
                <th class="px-4 py-3">Désignation</th>
                <th class="px-4 py-3">Quantité</th>
                <th class="px-4 py-3">PU TTC</th>
                <th class="px-4 py-3">PU HT</th>
                <th class="px-4 py-3">Statut</th>
                <th class="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-sm text-gray-700">
              <tr *ngFor="let item of paginatedStock">
                <td class="px-4 py-2">{{ item.createdAt | firestoreDate | date: 'medium'}}</td>
                <td class="px-4 py-2">{{ item.fournisseur }}</td>
                <td class="px-4 py-2">{{ item.designation }}</td>
                <td class="px-4 py-2">{{ item.quantite }}</td>
                <td class="px-4 py-2">
                  {{ item.prixUnitaire | currency : 'GNF' }}
                </td>
                <td class="px-4 py-2">
                  {{ item.prixUnitaireHT | currency : 'GNF' }}
                </td>
                <td class="px-4 py-2">
                  <span
                    class="text-xs font-semibold px-2 py-1 rounded-full"
                    [ngClass]="{
                      'bg-green-100 text-green-700': item.status === 'entre',
                      'bg-red-100 text-red-700': item.status === 'sortie'
                    }"
                  >
                    {{ item.status | titlecase }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <button
                    class="text-primary-600 hover:underline hover:text-primary-800 transition"
                    (click)="openModal(item)"
                  >
                    ✏️ Éditer
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="flex justify-end px-4 py-2">
            <button
              *ngFor="let page of [].constructor(totalPages); let i = index"
              (click)="currentPage = i + 1"
              class="mx-1 px-3 py-1 rounded border"
              [class.bg-primary-600]="currentPage === i + 1"
              [class.text-white]="currentPage === i + 1"
            >
              {{ i + 1 }}
            </button>
          </div>
        </div>

        <!-- Modal -->
        <div
          *ngIf="showModal"
          class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-slide-in-right"
          >
            <h3 class="text-lg font-semibold mb-4">Ajouter un produit</h3>

            <label class="form-label">Fournisseur</label>
            <input
              type="text"
              [(ngModel)]="newItem.fournisseur"
              class="form-input mb-3"
            />

            <label class="form-label">Désignation</label>
            <input
              type="text"
              [(ngModel)]="newItem.designation"
              class="form-input mb-3"
            />

            <label class="form-label">Quantité</label>
            <input
              type="number"
              [(ngModel)]="newItem.quantite"
              class="form-input mb-3"
            />

            <label class="form-label">Prix unitaire TTC</label>
            <input
              type="number"
              [(ngModel)]="newItem.prixUnitaire"
              class="form-input mb-3"
            />

            <label class="form-label">Prix unitaire HT</label>
            <input
              type="number"
              [(ngModel)]="newItem.prixUnitaireHT"
              class="form-input mb-3"
            />

            <div class="font-medium text-sm text-gray-700">
              Total prix :
              <span class="text-primary-600 font-bold">{{
                totalPrix | currency
              }}</span>
            </div>

            <div class="flex justify-end mt-4 space-x-2">
              <button class="btn-secondary" (click)="closeModal()">
                Annuler
              </button>
              <button class="btn-primary" (click)="addItem()">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL SORTIE -->
      <div
        *ngIf="showSortieModal"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      >
        <div
          class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp"
        >
          <!-- En-tête avec bouton fermer intégré -->
          <div
            class="flex justify-between items-center border-b p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
          >
            <div>
              <h3
                class="text-2xl font-bold text-gray-800 flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6 text-indigo-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
                Sortie de Stock
              </h3>
              <p class="text-sm text-gray-600 mt-1">
                Gestion des pièces sorties pour intervention
              </p>
            </div>
            <button
              (click)="showSortieModal = false"
              class="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Fermer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Contenu principal avec scroll -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- Recherche du devis -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Numéro du devis</label
              >
              <div class="flex gap-3">
                <input
                  [(ngModel)]="sortieQuoteNumber"
                  (keyup.enter)="loadQuoteByNumber()"
                  placeholder="Saisissez le numéro de devis"
                  class="flex-1 form-input rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  (click)="loadQuoteByNumber()"
                  [disabled]="!sortieQuoteNumber"
                  class="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Charger
                </button>
              </div>
            </div>

            <!-- Liste des articles -->
            <div
              *ngIf="sortieItems.length > 0"
              class="border rounded-xl overflow-hidden"
            >
              <div
                class="grid grid-cols-12 bg-gray-100 p-4 font-medium text-gray-700"
              >
                <div class="col-span-5">Désignation</div>
                <div class="col-span-2 text-center">Prévue</div>
                <div class="col-span-2 text-center">À sortir</div>
                <div class="col-span-2 text-center">Stock</div>
                <div class="col-span-1 text-center">État</div>
              </div>

              <div class="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                <div
                  *ngFor="let item of sortieItems"
                  class="grid grid-cols-12 p-4 items-center hover:bg-gray-50 transition-colors"
                >
                  <div
                    class="col-span-5 font-medium text-gray-800 flex items-center gap-3"
                  >
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    </div>
                    {{ item.designation }}
                  </div>
                  <div class="col-span-2 text-center text-gray-600">
                    {{ item.quantitePrevue }}
                  </div>
                  <div class="col-span-2 text-center">
                    <div class="relative mx-auto w-24">
                      <input
                        type="number"
                        [(ngModel)]="item.quantiteSortie"
                        [max]="stockDisponible[item.designation] || 0"
                        min="0"
                        class="form-input text-center border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <div
                        class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none text-gray-400"
                      >
                        <span class="text-xs">u</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-span-2 text-center">
                    <span
                      [class.text-green-600]="
                        stockDisponible[item.designation] >= item.quantitePrevue
                      "
                      [class.text-yellow-600]="
                        stockDisponible[item.designation] < item.quantitePrevue
                      "
                    >
                      {{ stockDisponible[item.designation] || 0 }}
                    </span>
                  </div>
                  <div class="col-span-1 text-center">
                    <span
                      class="inline-flex items-center justify-center w-8 h-8 rounded-full"
                      [class.bg-green-100]="isQuantityAvailable(item)"
                      [class.bg-red-100]="!isQuantityAvailable(item)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        [class.text-green-600]="isQuantityAvailable(item)"
                        [class.text-red-600]="!isQuantityAvailable(item)"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          *ngIf="isQuantityAvailable(item)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        />
                        <path
                          *ngIf="!isQuantityAvailable(item)"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Résumé et validation -->
            <div *ngIf="sortieItems.length > 0" class="mt-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Mécanicien responsable</label
                  >
                  <input
                    [(ngModel)]="mechanicName"
                    placeholder="Nom du mécanicien"
                    class="form-input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Date de sortie</label
                  >
                  <input
                    type="date"
                    [(ngModel)]="sortieDate"
                    class="form-input w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-blue-800">
                      Résumé de la sortie
                    </h4>
                    <div class="mt-1 text-sm text-blue-700">
                      <p>{{ sortieItems.length }} article(s) sélectionné(s)</p>
                      <p>Total à sortir: {{ getTotalQuantity() }} unité(s)</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pied de page avec actions -->
          <div
            *ngIf="sortieItems.length > 0"
            class="border-t p-4 bg-gray-50 flex justify-end gap-3"
          >
            <button
              (click)="showSortieModal = false"
              class="btn-secondary flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Annuler
            </button>
            <button
              (click)="submitSortie()"
              [disabled]="!canSubmit()"
              class="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Valider la sortie
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StockDashboardComponent {
  showModal = false;
  showSortieModal = false;
  isEditMode = false;
  editItemId: string | null = null;
  isLoading = true;
  searchTerm: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  stock: StockModel[] = [];

  newItem = {
    fournisseur: '',
    designation: '',
    quantite: 0,
    prixUnitaire: 0,
    prixUnitaireHT: 0,
  };

  sortieQuoteNumber = '';
  mechanicName = '';
  sortieItems: any[] = [];
  stockDisponible: Record<string, number> = {};

  constructor(
    private readonly garageDataService: GarageDataService,
    private notificationService: NotificationService
  ) {
    this.loadStock();
  }

  async loadStock(): Promise<void> {
    this.isLoading = true;
    try {
      this.stock = await this.garageDataService.getAll<any>('stock');
      this.updateStockDisponible();
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  updateStockDisponible(): void {
    this.stockDisponible = {};
    this.stock.forEach((item) => {
      this.stockDisponible[item.designation] = item.quantite;
    });
  }

  get totalStock() {
    return (
      this.stock
        .filter((item) => item.status === 'entre')
        .reduce((sum, item) => sum + item.quantite, 0) -
      this.stock
        .filter((item) => item.status === 'sortie')
        .reduce((sum, item) => sum + item.quantite, 0)
    );
  }

  get totalSorties() {
    return this.stock
      .filter((item) => item.status === 'sortie')
      .reduce((sum, item) => sum + item.quantite, 0);
  }

  get topSortiesMensuelles(): string[] {
    const sortieMap: Record<string, number> = {};

    for (const item of this.stock) {
      if (item.status === 'sortie') {
        if (!sortieMap[item.designation]) sortieMap[item.designation] = 0;
        sortieMap[item.designation] += item.quantite;
      }
    }

    return Object.entries(sortieMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([designation]) => designation);
  }

  get totalPrix() {
    return this.newItem.quantite * this.newItem.prixUnitaire;
  }

  get paginatedStock() {
    const filtered = this.stock.filter(
      (item) =>
        item.designation
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        item.fournisseur.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    const filtered = this.stock.filter(
      (item) =>
        item.designation
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        item.fournisseur.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  openModal(item: any = null): void {
    if (item) {
      this.newItem = { ...item };
      this.editItemId = item.id;
      this.isEditMode = true;
      this.showModal = true;
    } else {
      this.newItem = {
        fournisseur: '',
        designation: '',
        quantite: 0,
        prixUnitaire: 0,
        prixUnitaireHT: 0,
      };
      this.isEditMode = false;
      this.editItemId = null;
    }
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.newItem = {
      fournisseur: '',
      designation: '',
      quantite: 0,
      prixUnitaire: 0,
      prixUnitaireHT: 0,
    };
    this.editItemId = null;
    this.isEditMode = false;
  }

  async addItem(): Promise<void> {
    if (this.isEditMode && this.editItemId) {
      // 1. Récupérer l'existant
      const currentItem = this.stock.find(
        (item) => item.id === this.editItemId
      );
      if (!currentItem) {
        alert('Erreur : Stock introuvable.');
        return;
      }

      // 2. Additionner les quantités
      const updatedQuantity = currentItem.quantite + this.newItem.quantite;

      // 3. Construire les données mises à jour
      const stockData = {
        ...this.newItem,
        quantite: updatedQuantity,
        status: 'entre' as const,
      };

      // 4. Mise à jour Firestore
      await this.garageDataService.update('stock', this.editItemId, stockData);
    } else {
      const stockData = {
        ...this.newItem,
        status: 'entre' as const,
      };
      await this.garageDataService.create('stock', stockData);
    }

    this.closeModal();
    await this.loadStock();
  }

  async deleteItem(id: string): Promise<void> {
    await this.garageDataService.delete('stock', id);
    await this.loadStock();
  }

  // SORTI
  getTotalQuantity(): number {
    return this.sortieItems.reduce(
      (total, item) => total + (item.quantiteSortie || 0),
      0
    );
  }
  sortieDate: string = new Date().toISOString().split('T')[0]; // Date du jour par défaut

  canSubmit(): boolean {
    return (
      this.sortieItems.length > 0 &&
      this.sortieItems.every((item) => item.quantiteSortie > 0) &&
      !!this.mechanicName &&
      this.sortieItems.every((item) => this.isQuantityAvailable(item))
    );
  }

  async loadQuoteByNumber(): Promise<void> {
    if (!this.sortieQuoteNumber) {
      this.notificationService.showInfo('Veuillez saisir un numéro de devis.');
      return;
    }

    try {
      const results = await this.garageDataService.getWithFilter<Quote>(
        'quotes',
        [
          {
            field: 'quoteNumber',
            operator: '==',
            value: this.sortieQuoteNumber,
          },
        ]
      );

      if (results.length === 0) {
        this.notificationService.showInfo(
          'Aucun devis trouvé avec ce numéro.',
          500
        );
        this.sortieItems = [];
        return;
      }

      const quote = results[0];

      if (quote.status !== 'Accepted') {
        this.notificationService.showInfo(
          'Ce devis n’a pas encore été accepté par le client.'
        );
        this.sortieItems = [];
        return;
      }

      const partItems: QuoteItem[] = quote.items.filter(
        (item) => item.type === 'Part'
      );

      if (partItems.length === 0) {
        this.notificationService.showInfo(
          'Aucune pièce n’est associée à ce devis.'
        );
        this.sortieItems = [];
        return;
      }

      this.sortieItems = partItems.map((part) => ({
        designation: part.designation,
        quantitePrevue: part.quantity,
        quantiteSortie: 0,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement du devis :', error);
      this.notificationService.showError(
        'Une erreur est survenue lors du chargement du devis.'
      );
    }
  }

  isQuantityAvailable(item: any): boolean {
    const stock = this.stockDisponible[item.designation] || 0;
    return item.quantiteSortie <= stock;
  }

  async submitSortie(): Promise<void> {
    const allValid = this.sortieItems.every((item) =>
      this.isQuantityAvailable(item)
    );
    if (!this.mechanicName || !allValid) {
      alert('Erreur : Vérifiez les quantités et le nom du mécanicien.');
      return;
    }

    for (const item of this.sortieItems) {
      const stockItem = this.stock.find(
        (s) => s.designation === item.designation
      );
      if (stockItem) {
        const updatedQuantity = stockItem.quantite - item.quantiteSortie;

        // 🔄 Mise à jour de la quantité du stock existant
        await this.garageDataService.update('stock', stockItem.id, {
          quantite: updatedQuantity,
        });

        // 🆕 Enregistrement d’une sortie distincte
        await this.garageDataService.create('stock', {
          designation: item.designation,
          quantite: item.quantiteSortie,
          prixUnitaire: stockItem.prixUnitaire,
          prixUnitaireHT: stockItem.prixUnitaireHT,
          fournisseur: stockItem.fournisseur,
          status: 'sortie',
          mecanicien: this.mechanicName,
          devisRef: this.sortieQuoteNumber,
          dateSortie: new Date(),
        });
      }
    }

    this.showSortieModal = false;
    this.mechanicName = '';
    this.sortieQuoteNumber = '';
    this.sortieItems = [];
    this.notificationService.showSuccess(
      'Sortie stock enregistrer avec succés'
    );
    await this.loadStock();
  }
}
