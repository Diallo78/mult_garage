import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { VehicleExam } from '../../models/exam.model';
import { FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';
import { DateFonction } from '../../services/fonction/date-fonction';

@Component({
  selector: 'app-exame-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            Examens de véhicules
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Liste des examens de diagnostic et vérification
          </p>
        </div>
        <div class="mt-4 flex md:ml-4 md:mt-0">
          <button (click)="createExam()" class="btn-primary">
            Nouvel examen
          </button>
        </div>
      </div>

      <!-- Filtres -->
      <div class="bg-white p-4 rounded-lg border">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="form-label">Rechercher</label>
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (input)="filterExams()"
              class="form-input"
              placeholder="Numéro, client, véhicule..."
            />
          </div>
          <div>
            <label class="form-label">Statut</label>
            <select
              [(ngModel)]="statusFilter"
              (change)="filterExams()"
              class="form-input"
            >
              <option value="">Tous</option>
              <option value="Conforme">Conforme</option>
              <option value="NonConforme">Non Conforme</option>
              <option value="PartiellementConforme">
                Partiellement Conforme
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">Date de début</label>
            <input
              type="date"
              [(ngModel)]="startDate"
              (change)="filterExams()"
              class="form-input"
            />
          </div>
          <div>
            <label class="form-label">Date de fin</label>
            <input
              type="date"
              [(ngModel)]="endDate"
              (change)="filterExams()"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Liste des examens -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div *ngIf="isLoading" class="flex justify-center items-center h-32">
          <div
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"
          ></div>
        </div>

        <div
          *ngIf="!isLoading && filteredExams.length === 0"
          class="text-center py-12"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Aucun examen</h3>
          <p class="mt-1 text-sm text-gray-500">
            Commencez par créer un nouvel examen.
          </p>
        </div>

        <ul
          *ngIf="!isLoading && filteredExams.length > 0"
          class="divide-y divide-gray-200"
        >
          <li *ngFor="let exam of filteredExams" class="hover:bg-gray-50">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <div
                      class="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center"
                    >
                      <svg
                        class="h-6 w-6 text-primary-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="flex items-center">
                      <p class="text-sm font-medium text-gray-900">
                        Examen N° {{ exam.examNumber }}
                      </p>
                      <span
                        class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        [class]="getStatusClass(exam.finalDecision)"
                      >
                        {{ getStatusLabel(exam.finalDecision) }}
                      </span>
                    </div>
                    <div class="mt-1">
                      <p class="text-sm text-gray-500">
                        <strong>Client:</strong> {{ exam.clientName }}
                        <span class="mx-2">•</span>
                        <strong>Véhicule:</strong> {{ exam.vehicleMake }} -
                        {{ exam.vehicleRegistration }}
                      </p>
                    </div>
                    <div class="mt-1">
                      <p class="text-sm text-gray-500">
                        <strong>Date:</strong> {{ formatDate(exam.date) }}
                        <span class="mx-2">•</span>
                        <strong>Technicien:</strong>
                        {{ exam.technicianSignature || 'Non signé' }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    (click)="viewExam(exam.id)"
                    class="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    Voir
                  </button>
                  <button
                    (click)="editExam(exam.id)"
                    class="text-gray-600 hover:text-gray-900 text-sm font-medium"
                  >
                    Modifier
                  </button>
                  <button
                    (click)="deleteExam(exam.id)"
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Pagination -->
      <div
        *ngIf="!isLoading && filteredExams.length > 0"
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            (click)="previousPage()"
            [disabled]="currentPage === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Précédent
          </button>
          <button
            (click)="nextPage()"
            [disabled]="currentPage === totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Suivant
          </button>
        </div>
        <div
          class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-sm text-gray-700">
              Affichage de {{ (currentPage - 1) * itemsPerPage + 1 }} à
              {{
                Math.min(currentPage * itemsPerPage, filteredExams.length)
              }}
              sur {{ filteredExams.length }} résultats
            </p>
          </div>
          <div>
            <nav
              class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            >
              <button
                (click)="previousPage()"
                [disabled]="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                (click)="nextPage()"
                [disabled]="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ExameListComponent implements OnInit {
  exams: VehicleExam[] = [];
  filteredExams: VehicleExam[] = [];
  isLoading = false;

  // Filtres
  searchTerm = '';
  statusFilter = '';
  startDate = '';
  endDate = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Utilitaires
  Math = Math;
  private readonly datePipe = new FirestoreDatePipeTS();

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.loadExams();
  }

  private async loadExams(): Promise<void> {
    this.isLoading = true;
    try {
      this.exams = await this.garageDataService.getAll<VehicleExam>('exams');
      this.filteredExams = DateFonction.sortByCreatedAtDesc([...this.exams]);
      this.updatePagination();
    } catch (error) {
      console.error('Erreur lors du chargement des examens:', error);
      this.notificationService.showError('Échec du chargement des examens.');
    } finally {
      this.isLoading = false;
    }
  }

  filterExams(): void {
    this.filteredExams = this.exams.filter((exam) => {
      const matchesSearch =
        !this.searchTerm ||
        exam.examNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        exam.clientName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        exam.vehicleMake
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        exam.vehicleRegistration
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());

      const matchesStatus =
        !this.statusFilter || exam.finalDecision === this.statusFilter;

      const matchesDate =
        !this.startDate ||
        !this.endDate ||
        (new Date(exam.date) >= new Date(this.startDate) &&
          new Date(exam.date) <= new Date(this.endDate));

      return matchesSearch && matchesStatus && matchesDate;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredExams.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  createExam(): void {
    this.router.navigate(['/exams/new']);
  }

  viewExam(id: string): void {
    this.router.navigate(['/exams', id]);
  }

  editExam(id: string): void {
    this.router.navigate(['/exams', id, 'edit']);
  }

  async deleteExam(id: string): Promise<void> {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet examen ?')) {
      try {
        await this.garageDataService.delete('exams', id);
        this.notificationService.showSuccess('Examen supprimé avec succès');
        this.loadExams();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'examen:", error);
        this.notificationService.showError(
          "Échec de la suppression de l'examen"
        );
      }
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Conforme':
        return 'bg-green-100 text-green-800';
      case 'NonConforme':
        return 'bg-red-100 text-red-800';
      case 'PartiellementConforme':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Conforme':
        return 'Conforme';
      case 'NonConforme':
        return 'Non Conforme';
      case 'PartiellementConforme':
        return 'Partiellement Conforme';
      default:
        return status;
    }
  }

  formatDate(date: Date | string): string {
    if (typeof date === 'string') return date;
    const result = this.datePipe.transform(date);
    return typeof result === 'string' ? result : '';
  }
}
