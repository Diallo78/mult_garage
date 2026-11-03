import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { PrintTemplateService } from '../../services/print-template.service';
import {
  PrintDocumentType,
  PRINT_DOCUMENT_TYPES,
} from '../../models/print-template.model';

/**
 * Liste des modèles d'impression disponibles pour le garage courant.
 * Permet d'accéder à l'éditeur de chaque type de document et de savoir
 * si un modèle a déjà été personnalisé.
 */
@Component({
  selector: 'app-print-template-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- En-tête de page -->
      <div class="md:flex md:items-center md:justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-gray-900 sm:text-3xl">
            Modèles d'impression
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            Personnalisez l'apparence de vos documents : en-tête, contenu, pied
            de page, signatures et apparence générale.
          </p>
        </div>
      </div>

      <!-- État de chargement -->
      <div
        *ngIf="loading"
        class="card flex items-center justify-center py-16 text-gray-500"
      >
        <svg
          class="animate-spin h-6 w-6 mr-3 text-primary-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
        Chargement des modèles...
      </div>

      <!-- Cartes des types de documents -->
      <div
        *ngIf="!loading"
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
      >
        <div
          *ngFor="let type of documentTypes"
          class="card flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
        >
          <div>
            <div class="flex items-start justify-between gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex-shrink-0"
              >
                <svg
                  class="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
              </div>
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                [ngClass]="
                  isCustomized(type.value)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                "
              >
                {{ isCustomized(type.value) ? 'Personnalisé' : 'Par défaut' }}
              </span>
            </div>

            <h3 class="mt-4 text-lg font-semibold text-gray-900">
              {{ type.label }}
            </h3>
            <p class="mt-1 text-sm text-gray-600">
              {{ type.description }}
            </p>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <a
              class="btn-primary"
              [routerLink]="['/print-templates', type.value]"
            >
              Personnaliser
            </a>
            <button
              type="button"
              class="btn-secondary"
              *ngIf="isCustomized(type.value)"
              (click)="resetTemplate(type.value, type.label)"
            >
              Restaurer
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PrintTemplateListComponent implements OnInit {
  readonly documentTypes = PRINT_DOCUMENT_TYPES;

  loading = true;

  /** Types de documents pour lesquels un modèle personnalisé existe. */
  private readonly customized = new Set<PrintDocumentType>();

  constructor(
    private readonly templateService: PrintTemplateService,
    private readonly notificationService: NotificationService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  isCustomized(documentType: PrintDocumentType): boolean {
    return this.customized.has(documentType);
  }

  async resetTemplate(
    documentType: PrintDocumentType,
    label: string
  ): Promise<void> {
    const confirmed = window.confirm(
      `Restaurer le modèle par défaut pour « ${label} » ? Votre personnalisation sera supprimée.`
    );
    if (!confirmed) return;

    try {
      await this.templateService.resetTemplate(documentType);
      this.customized.delete(documentType);
      this.notificationService.showSuccess(
        `Modèle « ${label} » restauré par défaut`
      );
    } catch (error) {
      this.notificationService.showError(
        'Échec de la restauration du modèle : ' + error
      );
    }
  }

  private async reload(): Promise<void> {
    this.loading = true;
    try {
      const saved = await this.templateService.getAllSaved();
      this.customized.clear();
      saved.forEach((template) => this.customized.add(template.documentType));
    } catch (error) {
      this.notificationService.showError(
        'Échec du chargement des modèles : ' + error
      );
    } finally {
      this.loading = false;
    }
  }
}
