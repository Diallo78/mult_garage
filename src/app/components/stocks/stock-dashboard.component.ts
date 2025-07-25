import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { FirestoreDatePipe } from "../../pipe/firestore-date.pipe";
import { GarageDataService } from "../../services/garage-data.service";
import { Quote, QuoteItem } from "../../models/quote.model";

@Component({
  selector: 'app-diagnostic-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
    </div>

    <div *ngIf="!isLoading">
    <div class="p-6 space-y-6">
    <!-- Titre -->
    <div class="text-2xl font-bold text-primary-700">📦 Tableau de bord - Stock</div>

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
        <h3 class="text-lg font-semibold text-gray-700">Pièces les + sorties (mensuel)</h3>
        <ul class="text-sm text-gray-600 mt-2 list-disc pl-4">
          <li *ngFor="let part of topSortiesMensuelles">{{ part }}</li>
        </ul>
        </div>
    </div>

    <!-- Boutons -->
    <div class="flex justify-between items-center">
        <button class="btn-primary" (click)="showModal = true">+ Ajouter</button>
        <button class="btn-secondary text-red-600"  (click)="showSortieModal = true">📤 Sortie</button>
    </div>

    <div class="mb-4">
      <label class="form-label">🔍 Rechercher un produit</label>
      <input type="text" [(ngModel)]="searchTerm" placeholder="Tapez une désignation ou fournisseur..." class="form-input w-full" />
    </div>
    <!-- Tableau -->
    <div class="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50 text-left text-sm font-medium text-gray-700">
            <tr>
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
              <td class="px-4 py-2">{{ item.fournisseur }}</td>
              <td class="px-4 py-2">{{ item.designation }}</td>
              <td class="px-4 py-2">{{ item.quantite }}</td>
              <td class="px-4 py-2">{{ item.prixUnitaire | currency }}</td>
              <td class="px-4 py-2">{{ item.prixUnitaireHT | currency }}</td>
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
        <button *ngFor="let page of [].constructor(totalPages); let i = index"
                (click)="currentPage = i + 1"
                class="mx-1 px-3 py-1 rounded border"
                [class.bg-primary-600]="currentPage === i + 1"
                [class.text-white]="currentPage === i + 1">
            {{ i + 1 }}
        </button>
        </div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-slide-in-right">
        <h3 class="text-lg font-semibold mb-4">Ajouter un produit</h3>

        <label class="form-label">Fournisseur</label>
        <input type="text" [(ngModel)]="newItem.fournisseur" class="form-input mb-3" />

        <label class="form-label">Désignation</label>
        <input type="text" [(ngModel)]="newItem.designation" class="form-input mb-3" />

        <label class="form-label">Quantité</label>
        <input type="number" [(ngModel)]="newItem.quantite" class="form-input mb-3" />

        <label class="form-label">Prix unitaire TTC</label>
        <input type="number" [(ngModel)]="newItem.prixUnitaire" class="form-input mb-3" />

        <label class="form-label">Prix unitaire HT</label>
        <input type="number" [(ngModel)]="newItem.prixUnitaireHT" class="form-input mb-3" />

        <div class="font-medium text-sm text-gray-700">Total prix :
            <span class="text-primary-600 font-bold">{{ totalPrix | currency }}</span>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
            <button class="btn-secondary" (click)="closeModal()">Annuler</button>
            <button class="btn-primary" (click)="addItem()">Enregistrer</button>
        </div>
        </div>
    </div>
    </div>

    <!-- MODAL SORTIE -->
  <div *ngIf="showSortieModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl animate-slide-in-right">
      <h3 class="text-lg font-semibold mb-4">📤 Sortie de Stock</h3>
      <button (click)="showSortieModal">X</button>
      <div class="mb-4">
        <label class="form-label">Numéro du devis</label>
        <div class="flex gap-2">
          <input [(ngModel)]="sortieQuoteNumber" class="form-input w-full" />
          <button class="btn-primary" (click)="loadQuoteByNumber()">Charger</button>
        </div>
      </div>

      <div *ngIf="sortieItems.length > 0">
        <table class="min-w-full border mt-4 text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-2">Désignation</th>
              <th class="px-4 py-2">Quantité prévue</th>
              <th class="px-4 py-2">Quantité à sortir</th>
              <th class="px-4 py-2">Stock dispo</th>
              <th class="px-4 py-2">État</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of sortieItems">
              <td class="px-4 py-2">{{ item.designation }}</td>
              <td class="px-4 py-2 text-center">{{ item.quantitePrevue }}</td>
              <td class="px-4 py-2 text-center">
                <input type="number" [(ngModel)]="item.quantiteSortie" class="form-input w-24 text-center" />
              </td>
              <td class="px-4 py-2 text-center">{{ stockDisponible[item.designation] || 0 }}</td>
              <td class="px-4 py-2 text-center">
                <span [class.text-green-600]="isQuantityAvailable(item)"
                      [class.text-red-600]="!isQuantityAvailable(item)">
                  {{ isQuantityAvailable(item) ? '✅ OK' : '❌ Insuffisant' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="mt-6">
          <label class="form-label">Nom du mécanicien</label>
          <input [(ngModel)]="mechanicName" class="form-input" />
        </div>

        <div class="flex justify-end mt-4 gap-2">
          <button class="btn-secondary" (click)="showSortieModal = false">Annuler</button>
          <button class="btn-primary" (click)="submitSortie()">Valider la sortie</button>
        </div>
      </div>
    </div>
  </div>

  </div>
   `
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
  stock: any[] = [];

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

  constructor(private readonly garageDataService: GarageDataService) {
    this.loadStock();
  }

  async loadStock(): Promise<void> {
    this.isLoading = true
    try {
      this.stock = await this.garageDataService.getAll<any>('stock');
      this.updateStockDisponible();
    } catch (error) {

    }finally{this.isLoading = false}
  }

  updateStockDisponible(): void {
    this.stockDisponible = {};
    this.stock.forEach(item => {
      this.stockDisponible[item.designation] = item.quantite;
    });
  }

 get totalStock() {
    return this.stock
      .filter(item => item.status === 'entre')
      .reduce((sum, item) => sum + item.quantite, 0)
      - this.stock
          .filter(item => item.status === 'sortie')
          .reduce((sum, item) => sum + item.quantite, 0);
  }

  get totalSorties() {
    return this.stock
      .filter(item => item.status === 'sortie')
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
    const filtered = this.stock.filter(item =>
      item.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.fournisseur.toLowerCase().includes(this.searchTerm.toLowerCase())
    );

    const start = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    const filtered = this.stock.filter(item =>
      item.designation.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      item.fournisseur.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    return Math.ceil(filtered.length / this.itemsPerPage);
  }

  openModal(item: any = null): void {
    if (item) {
      this.newItem = { ...item };
      this.editItemId = item.id;
      this.isEditMode = true;
      this.showModal = true
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
      const currentItem = this.stock.find(item => item.id === this.editItemId);
      if (!currentItem) {
        alert("Erreur : Stock introuvable.");
        return;
      }

      // 2. Additionner les quantités
      const updatedQuantity = currentItem.quantite + this.newItem.quantite;

      // 3. Construire les données mises à jour
      const stockData = {
        ...this.newItem,
        quantite: updatedQuantity,
        status: 'entre' as const
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

  async loadQuoteByNumberv1(): Promise<void> {
    const items = await this.garageDataService.getWithFilter<Quote>('quotes', [
      { field: 'quoteNumber', operator: '==', value: this.sortieQuoteNumber }
    ]);
    if (items.length > 0) {
      this.sortieItems = items.map(item => ({
        designation: item.diagnosticId,
        quantitePrevue: item,
        quantiteSortie: 0
      }));
    } else {
      this.sortieItems = [];
      alert('Aucun devis trouvé avec ce numéro');
    }
  }

  async loadQuoteByNumber(): Promise<void> {
  if (!this.sortieQuoteNumber) return;

  try {
    const results = await this.garageDataService.getWithFilter<Quote>(
      'quotes',
      [{ field: 'quoteNumber', operator: '==', value: this.sortieQuoteNumber }]
    );

    if (results.length === 0) {
      alert('Aucun devis trouvé avec ce numéro.');
      this.sortieItems = [];
      return;
    }

    const quote = results[0]; // Un seul résultat attendu
    const partItems: QuoteItem[] = quote.items.filter(item => item.type === 'Part');

    this.sortieItems = partItems.map(part => ({
      designation: part.designation,
      quantitePrevue: part.quantity,
      quantiteSortie: 0
    }));

  } catch (error) {
    console.error('Erreur lors du chargement du devis :', error);
    alert('Une erreur est survenue lors du chargement du devis.');
  }
}

  isQuantityAvailable(item: any): boolean {
    const stock = this.stockDisponible[item.designation] || 0;
    return item.quantiteSortie <= stock;
  }

  async submitSortiev1(): Promise<void> {
    const allValid = this.sortieItems.every(item => this.isQuantityAvailable(item));
    if (!this.mechanicName || !allValid) {
      alert('Erreur : Vérifiez les quantités et le nom du mécanicien.');
      return;
    }

    for (const item of this.sortieItems) {
      const stockItem = this.stock.find(s => s.designation === item.designation);
      if (stockItem) {
        const updatedQuantity = stockItem.quantite - item.quantiteSortie;
        await this.garageDataService.update('stock', stockItem.id, { quantite: updatedQuantity });
      }
    }

    this.showSortieModal = false;
    this.mechanicName = '';
    this.sortieQuoteNumber = '';
    this.sortieItems = [];
    await this.loadStock();
  }

  async submitSortie(): Promise<void> {
    const allValid = this.sortieItems.every(item => this.isQuantityAvailable(item));
    if (!this.mechanicName || !allValid) {
      alert('Erreur : Vérifiez les quantités et le nom du mécanicien.');
      return;
    }

    for (const item of this.sortieItems) {
      const stockItem = this.stock.find(s => s.designation === item.designation);
      if (stockItem) {
        const updatedQuantity = stockItem.quantite - item.quantiteSortie;

        // 🔄 Mise à jour de la quantité du stock existant
        await this.garageDataService.update('stock', stockItem.id, {
          quantite: updatedQuantity
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
          dateSortie: new Date()
        });
      }
    }

    this.showSortieModal = false;
    this.mechanicName = '';
    this.sortieQuoteNumber = '';
    this.sortieItems = [];

    await this.loadStock();
  }


}