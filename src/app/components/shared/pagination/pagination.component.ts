import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 space-y-3 sm:space-y-0"
      *ngIf="totalItems > itemsPerPage"
    >
      <!-- Informations sur les éléments -->
      <div class="text-xs sm:text-sm text-gray-600 order-1 sm:order-none">
        Affichage de {{ startItem }}-{{ endItem }} sur {{ totalItems }} éléments
      </div>

      <!-- Contrôles de pagination -->
      <div
        class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto order-2 sm:order-none"
      >
        <!-- Sélecteur d'éléments par page -->
        <div class="flex items-center space-x-2 w-full sm:w-auto">
          <label class="text-xs sm:text-sm text-gray-600 whitespace-nowrap"
            >Afficher:</label
          >
          <select
            class="text-xs sm:text-sm border rounded px-2 py-1.5 sm:py-1 min-w-16 sm:min-w-20"
            [(ngModel)]="itemsPerPage"
            (change)="onItemsPerPageChange()"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <!-- Navigation des pages -->
        <div class="flex items-center space-x-1 sm:space-x-2">
          <button
            class="px-2 sm:px-3 py-1.5 sm:py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors touch-target"
            [disabled]="currentPage === 1"
            (click)="changePage(currentPage - 1)"
          >
            <span class="hidden sm:inline">&larr; Précédent</span>
            <span class="sm:hidden">&larr;</span>
          </button>

          <span class="text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded">
            {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="px-2 sm:px-3 py-1.5 sm:py-1 border rounded text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors touch-target"
            [disabled]="currentPage === totalPages"
            (click)="changePage(currentPage + 1)"
          >
            <span class="hidden sm:inline">Suivant &rarr;</span>
            <span class="sm:hidden">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      button:not(:disabled):hover {
        background-color: #f3f4f6;
      }
    `,
  ],
})
export class PaginationComponent {
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() currentPage = 1;
  @Output() pageChange = new EventEmitter<number>();
  @Output() itemsPerPageChange = new EventEmitter<number>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }

  get endItem(): number {
    const end = this.currentPage * this.itemsPerPage;
    return end > this.totalItems ? this.totalItems : end;
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.pageChange.emit(newPage);
    }
  }

  onItemsPerPageChange(): void {
    this.currentPage = 1;
    this.itemsPerPageChange.emit(this.itemsPerPage);
    this.pageChange.emit(1);
  }
}
