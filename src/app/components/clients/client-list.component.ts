import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Client } from '../../models/client.model';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';


@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
  template: `

      <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
      </div>

      <div *ngIf="!isLoading">
        <div class="space-y-6">
        <div class="md:flex md:items-center md:justify-between">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Clients
            </h2>
          </div>
          <div class="mt-4 flex md:mt-0 md:ml-4">
            <button routerLink="/clients/new" class="btn-primary">
              Ajouter un nouveau client
            </button>
          </div>
        </div>

        <!-- Search and Filter -->
        <div class="card">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="form-label">Recherche</label>
              <input
                type="text"
                [(ngModel)]="searchTerm"
                (input)="filterClients()"
                class="form-input"
                placeholder="Rechercher par nom, e-mail, ou téléphone"
              />
            </div>
          </div>
        </div>

        <!-- Clients Table -->
        <div class="card">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Adresse
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Créé
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr *ngFor="let client of filteredClients" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">
                      {{ client.firstName }} {{ client.lastName }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ client.email }}</div>
                    <div class="text-sm text-gray-500">{{ client.phone }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ client.address || 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ client.createdAt | firestoreDate | date:'short' }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      [routerLink]="['/clients', client.id]"
                      class="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Voir
                    </button>
                    <button
                      [routerLink]="['/clients', client.id, 'edit']"
                      class="text-secondary-600 hover:text-secondary-900 mr-3"
                    >
                      Modifier
                    </button>
                    <button
                      (click)="deleteClient(client)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    `
  })
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  filteredClients: Client[] = [];
  searchTerm = '';
  isLoading = true;

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    (async() => {
      await this.loadClients();
    })()
  }

  private async loadClients(): Promise<void> {
    this.isLoading = true;
    try {
      this.clients = await this.garageDataService.getAll<Client>('clients');
      this.filteredClients = [...this.clients];
    } catch (error) {
      this.notificationService.showError('Failed to load clients');
    } finally {
      this.isLoading = false;
    }
  }

  filterClients(): void {
    if (!this.searchTerm) {
      this.filteredClients = [...this.clients];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.firstName.toLowerCase().includes(term) ||
      client.lastName.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term) ||
      client.phone.toLowerCase().includes(term)
    );
  }

  async deleteClient(client: Client): Promise<void> {
    if (confirm(`Are you sure you want to delete ${client.firstName} ${client.lastName}?`)) {
      try {
        await this.garageDataService.delete('clients', client.id);
        this.clients = this.clients.filter(c => c.id !== client.id);
        this.filterClients();
        this.notificationService.showSuccess('Client deleted successfully');
      } catch (error) {
        this.notificationService.showError('Failed to delete client');
      }
    }
  }
}