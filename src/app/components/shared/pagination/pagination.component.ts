import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="flex justify-between items-center mt-4"
      *ngIf="totalItems > itemsPerPage"
    >
      <div class="text-sm text-gray-600">
        Affichage de {{ startItem }}-{{ endItem }} sur {{ totalItems }} éléments
      </div>

      <div class="flex items-center space-x-2">
        <select
          class="text-sm border rounded px-2 py-1"
          [(ngModel)]="itemsPerPage"
          (change)="onItemsPerPageChange()"
        >
          <option value="5">5 par page</option>
          <option value="10">10 par page</option>
          <option value="20">20 par page</option>
          <option value="50">50 par page</option>
        </select>

        <button
          class="px-3 py-1 border rounded text-sm disabled:opacity-50"
          [disabled]="currentPage === 1"
          (click)="changePage(currentPage - 1)"
        >
          &larr; Précédent
        </button>

        <span class="text-sm"> Page {{ currentPage }} / {{ totalPages }} </span>

        <button
          class="px-3 py-1 border rounded text-sm disabled:opacity-50"
          [disabled]="currentPage === totalPages"
          (click)="changePage(currentPage + 1)"
        >
          Suivant &rarr;
        </button>
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
