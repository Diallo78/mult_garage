import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { GarageDataService } from "../../services/garage-data.service";
import { DiagnosticCategory, NameCategory } from "../../models/diagnostic.model";
import { NotificationService } from "../../services/notification.service";
import { FirestoreDatePipe } from "../../pipe/firestore-date.pipe";

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
      <div class="container mx-auto px-4 py-8">
        <div class="card">
          <!-- Header with Filter and Add Button -->
          <div
            class="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4"
          >
            <input
              type="text"
              [(ngModel)]="searchTerm"
              placeholder="Rechercher une catégorie..."
              class="form-input md:w-1/2"
            />
            <button class="btn-primary" (click)="openModal()">
              + Ajouter une catégorie
            </button>
          </div>

          <!-- Table -->
          <div *ngIf="categories" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-100">
                <tr>
                  <th
                    class="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    Date création
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    Nom de la catégorie
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    Problème
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    Description
                  </th>
                  <th
                    class="px-6 py-3 text-left text-sm font-medium text-gray-700"
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let item of filteredCategories()">
                  <td class="px-6 py-4 text-sm text-gray-800">
                    {{ item.createdAt | firestoreDate | date : 'dd-MMM-yyyy hh:mm' }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                    {{ item.name }}
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-800">
                    {{ item.categorie }}
                  </td>
                  <td
                    class="px-6 py-4 text-sm text-gray-600 max-w-[300px] truncate"
                  >
                    {{ item.description }}
                  </td>

                  <td
                    class="px-6 py-4 text-sm text-gray-600 space-x-2  whitespace-nowrap"
                  >
                    <button class="btn-secondary" (click)="editCategory(item)">
                      Modifier
                    </button>
                    <button
                      class="btn-secondary text-red-600 hover:text-red-800"
                      (click)="deleteCategory(item)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
                <tr *ngIf="filteredCategories().length === 0">
                  <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                    Aucune catégorie trouvée
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- MODAL -->
      <div
        *ngIf="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div
          class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 animate-slide-in-right"
        >
          <h2 class="text-lg font-semibold mb-4">
            Ajouter une nouvelle catégorie
          </h2>

          <label class="form-label">Nom de la catégorie</label>
          <select [(ngModel)]="newCategory.categorie" class="form-input mb-4">
            <option value="Problèmes Mécaniques">Problèmes Mécaniques</option>
            <option value="Problèmes Électriques">Problèmes Électriques</option>
            <option value="Carrosserie">Carrosserie</option>
            <option value="Pneumatique">Pneumatique</option>
            <option value="Système de Refroidissement">
              Système de Refroidissement
            </option>
            <option value="Entretien Général">Entretien Général</option>
            <option value="Autre">Autre</option>
          </select>

          <label class="form-label">Nom de la catégorie</label>
          <input
            type="text"
            [(ngModel)]="newCategory.name"
            class="form-input mb-4"
          />

          <label class="form-label">Description</label>
          <textarea
            [(ngModel)]="newCategory.description"
            rows="3"
            class="form-input mb-4"
          ></textarea>

          <div class="flex justify-end space-x-2">
            <button class="btn-secondary" (click)="closeModal()">
              Annuler
            </button>
            <button class="btn-primary" (click)="saveCategory()">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ChecksFiagnostique {
  searchTerm: string = '';
  showModal: boolean = false;
  isLoading = true;
  isEditMode = false;
  categorieId: string | null = null;

  private readonly _garageId!: string;

  newCategory = {
    categorie: '',
    name: '',
    description: '',
  };

  categories: DiagnosticCategory[] = [];

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService
  ) {
    (async () => {
      await this.loadDateCategorie();
    })();
    if (localStorage.getItem('garageId'))
      this._garageId = localStorage.getItem('garageId') ?? '';
  }

  private async loadDateCategorie(): Promise<void> {
    this.isLoading = true;
    try {
      this.categories = await this.garageDataService.getAll<DiagnosticCategory>(
        'diagnosticCategory'
      );
    } catch (error) {
      this.notificationService.showError('Failed to load categories' + error);
    } finally {
      this.isLoading = false;
    }
  }

  filteredCategories() {
    const term = this.searchTerm.toLowerCase();
    return this.categories.filter(
      (c) =>
        c.categorie.toLowerCase().includes(term) ||
        c.description.toLowerCase().includes(term)
    );
  }

  openModal() {
    this.newCategory = { categorie: '', name: '', description: '' };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  async saveCategory(): Promise<void> {
    try {
      if (!this.newCategory) throw new Error('No categorie is note null');
      if (!this._garageId) throw new Error('Le garage est vide');

      if (this.newCategory.name.trim()) {
        const checkDiagnostique: Omit<DiagnosticCategory, 'id'> = {
          name: this.newCategory.categorie,
          categorie: this.newCategory.name,
          description: this.newCategory.description,
          garageId: this._garageId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (this.isEditMode && this.categorieId) {
          await this.garageDataService.update(
            'diagnosticCategory',
            this.categorieId,
            checkDiagnostique
          );
          this.notificationService.showSuccess(
            'Diagnostic categorie updated successfully'
          );
        } else {
          await this.garageDataService.create(
            'diagnosticCategory',
            checkDiagnostique
          );
          this.notificationService.showSuccess(
            'Diagnostic categorie report created successfully'
          );
        }
        this.closeModal();
      } else {
        alert('Veuillez entrer un nom de catégorie');
      }
    } catch (error) {
      this.notificationService.showError(
        'Failed to create diagnostic categorie report'
      );
    }
  }

  editCategory(item: DiagnosticCategory) {
    this.isEditMode = true;
    this.openModal();
    this.newCategory.name = item.categorie;
    this.newCategory.description = item.description;
    this.categorieId = item.id;
  }

  deleteCategory(item: any) {
    this.categories = this.categories.filter((c) => c !== item);
  }
}