
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Personnel } from '../../models/garage.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-personnel-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FirestoreDatePipe],
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
  //     <div class="space-y-6">
  //       <div class="md:flex md:items-center md:justify-between">
  //         <div class="flex-1 min-w-0">
  //           <h2
  //             class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
  //           >
  //             Personnel Management
  //           </h2>
  //         </div>
  //         <div class="mt-4 flex md:mt-0 md:ml-4">
  //           <button routerLink="/personnel/new" class="btn-primary">
  //             Add New Employee
  //           </button>
  //         </div>
  //       </div>

  //       <!-- Search and Filter -->
  //       <div class="card">
  //         <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  //           <div>
  //             <label class="form-label">Search</label>
  //             <input
  //               type="text"
  //               [(ngModel)]="searchTerm"
  //               (input)="filterPersonnel()"
  //               class="form-input"
  //               placeholder="Search by name or email"
  //             />
  //           </div>
  //           <div>
  //             <label class="form-label">Role</label>
  //             <select
  //               [(ngModel)]="roleFilter"
  //               (change)="filterPersonnel()"
  //               class="form-input"
  //             >
  //               <option value="">All Roles</option>
  //               <option value="AdminGarage">Admin Garage</option>
  //               <option value="Manager">Manager</option>
  //               <option value="Technician">Technician</option>
  //               <option value="Receptionist">Receptionist</option>
  //               <option value="Accountant">Accountant</option>
  //             </select>
  //           </div>
  //           <div>
  //             <label class="form-label">Status</label>
  //             <select
  //               [(ngModel)]="statusFilter"
  //               (change)="filterPersonnel()"
  //               class="form-input"
  //             >
  //               <option value="">All Status</option>
  //               <option value="active">Active</option>
  //               <option value="inactive">Inactive</option>
  //             </select>
  //           </div>
  //         </div>
  //       </div>

  //       <!-- Personnel Table -->
  //       <div class="card">
  //         <div class="overflow-x-auto">
  //           <table class="min-w-full divide-y divide-gray-200">
  //             <thead class="bg-gray-50">
  //               <tr>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Employee
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Role
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Contact
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Hire Date
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Status
  //                 </th>
  //                 <th
  //                   class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
  //                 >
  //                   Actions
  //                 </th>
  //               </tr>
  //             </thead>
  //             <tbody class="bg-white divide-y divide-gray-200">
  //               <tr
  //                 *ngFor="let person of filteredPersonnel"
  //                 class="hover:bg-gray-50"
  //               >
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <div class="flex items-center">
  //                     <div
  //                       class="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center"
  //                     >
  //                       <span class="text-white text-sm font-medium">
  //                         {{ person.firstName.charAt(0)
  //                         }}{{ person.lastName.charAt(0) }}
  //                       </span>
  //                     </div>
  //                     <div class="ml-4">
  //                       <div class="text-sm font-medium text-gray-900">
  //                         {{ person.firstName }} {{ person.lastName }}
  //                       </div>
  //                       <div class="text-sm text-gray-500">
  //                         {{ person.email }}
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
  //                     [ngClass]="getRoleClass(person.role)"
  //                   >
  //                     {{ person.role }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                   {{ person.phone }}
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  //                   {{ person.hireDate | firestoreDate | date : 'short' }}
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap">
  //                   <span
  //                     class="status-badge"
  //                     [ngClass]="
  //                       person.isActive ? 'status-accepted' : 'status-rejected'
  //                     "
  //                   >
  //                     {{ person.isActive ? 'Active' : 'Inactive' }}
  //                   </span>
  //                 </td>
  //                 <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
  //                   <button
  //                     [routerLink]="['/personnel', person.id]"
  //                     class="text-primary-600 hover:text-primary-900 mr-3"
  //                   >
  //                     View
  //                   </button>
  //                   <button
  //                     [routerLink]="['/personnel', person.id, 'edit']"
  //                     class="text-secondary-600 hover:text-secondary-900 mr-3"
  //                   >
  //                     Edit
  //                   </button>
  //                   <button
  //                     (click)="toggleStatus(person)"
  //                     class="text-accent-600 hover:text-accent-900"
  //                   >
  //                     {{ person.isActive ? 'Deactivate' : 'Activate' }}
  //                   </button>
  //                 </td>
  //               </tr>
  //             </tbody>
  //           </table>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // `,
  template: `
      <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
        <div class="animate-pulse flex flex-col items-center">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-500"
          ></div>
          <p class="mt-4 text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>

      <div *ngIf="!isLoading">
        <div class="space-y-6">
          <div class="md:flex md:items-center md:justify-between">
            <div class="flex-1 min-w-0">
              <h2
                class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
              >
                Gestion du personnel
              </h2>
            </div>
            <div class="mt-4 flex md:mt-0 md:ml-4">
              <button routerLink="/personnel/new" class="btn-primary">
                Ajouter un employé
              </button>
            </div>
          </div>

          <!-- Recherche et Filtrage -->
          <div class="card">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="form-label">Rechercher</label>
                <input
                  type="text"
                  [(ngModel)]="searchTerm"
                  (input)="filterPersonnel()"
                  class="form-input"
                  placeholder="Nom ou email"
                />
              </div>
              <div>
                <label class="form-label">Rôle</label>
                <select
                  [(ngModel)]="roleFilter"
                  (change)="filterPersonnel()"
                  class="form-input"
                >
                  <option value="">Tous les rôles</option>
                  <option value="AdminGarage">Administrateur Garage</option>
                  <option value="Manager">Manager</option>
                  <option value="Technician">Technicien</option>
                  <option value="Receptionist">Réceptionniste</option>
                  <option value="Accountant">Comptable</option>
                </select>
              </div>
              <div>
                <label class="form-label">Statut</label>
                <select
                  [(ngModel)]="statusFilter"
                  (change)="filterPersonnel()"
                  class="form-input"
                >
                  <option value="">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Tableau du personnel -->
          <div class="card">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Employé
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rôle
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date d'embauche
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Statut
                    </th>
                    <th
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr
                    *ngFor="let person of filteredPersonnel"
                    class="hover:bg-gray-50"
                  >
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="flex items-center">
                        <div
                          class="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center"
                        >
                          <span class="text-white text-sm font-medium">
                            {{ person.firstName.charAt(0)
                            }}{{ person.lastName.charAt(0) }}
                          </span>
                        </div>
                        <div class="ml-4">
                          <div class="text-sm font-medium text-gray-900">
                            {{ person.firstName }} {{ person.lastName }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{ person.email }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        [ngClass]="getRoleClass(person.role)"
                      >
                        {{ person.role }}
                      </span>
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {{ person.phone }}
                    </td>
                    <td
                      class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {{ person.hireDate | firestoreDate | date : 'short' }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="status-badge"
                        [ngClass]="
                          person.isActive
                            ? 'status-accepted'
                            : 'status-rejected'
                        "
                      >
                        {{ person.isActive ? 'Actif' : 'Inactif' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        [routerLink]="['/personnel', person.id]"
                        class="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        Voir
                      </button>
                      <button
                        [routerLink]="['/personnel', person.id, 'edit']"
                        class="text-secondary-600 hover:text-secondary-900 mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        (click)="toggleStatus(person)"
                        class="text-accent-600 hover:text-accent-900"
                      >
                        {{ person.isActive ? 'Désactiver' : 'Activer' }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

  `,
})
export class PersonnelListComponent implements OnInit {
  personnel: Personnel[] = [];
  filteredPersonnel: Personnel[] = [];
  searchTerm = '';
  roleFilter = '';
  statusFilter = '';
  isLoading = true;
  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit() {
    (async () => {
      await this.loadPersonnel();
    })();
  }

  private async loadPersonnel(): Promise<void> {
    this.isLoading = true;
    try {
      this.personnel = await this.garageDataService.getAll<Personnel>(
        'personnel'
      );
      this.filteredPersonnel = [...this.personnel];
    } catch (error) {
      this.notificationService.showError('Failed to load personnel: ' + error);
    } finally {
      this.isLoading = false;
    }
  }

  filterPersonnel(): void {
    let filtered = [...this.personnel];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (person) =>
          person.firstName.toLowerCase().includes(term) ||
          person.lastName.toLowerCase().includes(term) ||
          person.email.toLowerCase().includes(term)
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter((person) => person.role === this.roleFilter);
    }

    if (this.statusFilter) {
      const isActive = this.statusFilter === 'active';
      filtered = filtered.filter((person) => person.isActive === isActive);
    }

    this.filteredPersonnel = filtered;
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'AdminGarage':
        return 'bg-red-100 text-red-800';
      case 'Manager':
        return 'bg-purple-100 text-purple-800';
      case 'Technician':
        return 'bg-blue-100 text-blue-800';
      case 'Receptionist':
        return 'bg-green-100 text-green-800';
      case 'Accountant':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  async toggleStatus(person: Personnel): Promise<void> {
    try {
      const newStatus = !person.isActive;
      await this.garageDataService.update('personnel', person.id, {
        isActive: newStatus,
      });
      person.isActive = newStatus;
      this.notificationService.showSuccess(
        `Employee ${newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      this.notificationService.showError(
        'Failed to update employee status : ' + error
      );
    }
  }
}