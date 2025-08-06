import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Personnel } from '../../models/garage.model';
import {
  FirestoreDatePipe,
  FirestoreDatePipeTS,
} from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-personnel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FirestoreDatePipe],
  // template: `
  //   <div class="space-y-6" *ngIf="personnel">
  //     <div class="md:flex md:items-center md:justify-between">
  //       <div class="flex-1 min-w-0">
  //         <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
  //           {{ personnel.firstName }} {{ personnel.lastName }}
  //         </h2>
  //         <p class="text-lg text-gray-600">{{ personnel.role }}</p>
  //       </div>
  //       <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
  //         <button [routerLink]="['/personnel', personnel.id, 'edit']" class="btn-secondary">
  //           Edit Employee
  //         </button>
  //         <button
  //           (click)="toggleStatus()"
  //           [class]="personnel.isActive ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md' : 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md'"
  //         >
  //           {{ personnel.isActive ? 'Deactivate' : 'Activate' }}
  //         </button>
  //       </div>
  //     </div>

  //     <!-- Personal Information -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
  //       <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Full Name</label>
  //           <p class="mt-1 text-sm text-gray-900">{{ personnel.firstName }} {{ personnel.lastName }}</p>
  //         </div>
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Email</label>
  //           <p class="mt-1 text-sm text-gray-900">{{ personnel.email }}</p>
  //         </div>
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Phone</label>
  //           <p class="mt-1 text-sm text-gray-900">{{ personnel.phone }}</p>
  //         </div>
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Status</label>
  //           <p class="mt-1">
  //             <span class="status-badge" [ngClass]="personnel.isActive ? 'status-accepted' : 'status-rejected'">
  //               {{ personnel.isActive ? 'Active' : 'Inactive' }}
  //             </span>
  //           </p>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Job Information -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Job Information</h3>
  //       <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Role</label>
  //           <p class="mt-1">
  //             <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" [ngClass]="getRoleClass(personnel.role)">
  //               {{ personnel.role }}
  //             </span>
  //           </p>
  //         </div>
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Hire Date</label>
  //           <p class="mt-1 text-sm text-gray-900">{{ personnel.hireDate | date:'mediumDate' }}</p>
  //         </div>
  //         <div>
  //           <label class="text-sm font-medium text-gray-500">Years of Service</label>
  //           <p class="mt-1 text-sm text-gray-900">{{ getYearsOfService() }} years</p>
  //         </div>
  //         <div *ngIf="personnel.salary">
  //           <label class="text-sm font-medium text-gray-500">Monthly Salary</label>
  //           <p class="mt-1 text-sm text-gray-900">\${{ personnel.salary.toLocaleString() }}</p>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Specializations -->
  //     <div class="card" *ngIf="personnel.specializations && personnel.specializations.length > 0">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Specializations</h3>
  //       <div class="flex flex-wrap gap-2">
  //         <span *ngFor="let spec of personnel.specializations"
  //               class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
  //           {{ spec }}
  //         </span>
  //       </div>
  //     </div>

  //     <!-- Permissions -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Permissions</h3>
  //       <div class="space-y-4">
  //         <div *ngFor="let permission of personnel.permissions" class="border rounded-lg p-4">
  //           <h4 class="font-medium text-gray-900 mb-2 capitalize">{{ permission.module }}</h4>
  //           <div class="flex flex-wrap gap-2">
  //             <span *ngFor="let action of permission.actions"
  //                   class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
  //               {{ action }}
  //             </span>
  //           </div>
  //         </div>
  //         <div *ngIf="personnel.permissions.length === 0" class="text-center py-4 text-gray-500">
  //           No specific permissions assigned
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Activity Summary -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Activity Summary</h3>
  //       <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  //         <div class="text-center">
  //           <div class="text-2xl font-bold text-blue-600">{{ activityStats.totalTasks }}</div>
  //           <div class="text-sm text-gray-500">Total Tasks</div>
  //         </div>
  //         <div class="text-center">
  //           <div class="text-2xl font-bold text-green-600">{{ activityStats.completedTasks }}</div>
  //           <div class="text-sm text-gray-500">Completed Tasks</div>
  //         </div>
  //         <div class="text-center">
  //           <div class="text-2xl font-bold text-purple-600">{{ activityStats.efficiency }}%</div>
  //           <div class="text-sm text-gray-500">Efficiency Rate</div>
  //         </div>
  //       </div>
  //     </div>

  //     <!-- Recent Activity -->
  //     <div class="card">
  //       <h3 class="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
  //       <div class="space-y-3">
  //         <div class="text-center py-8 text-gray-500">
  //           Activity tracking will be implemented in future updates
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // `
  template: `
    <div class="space-y-6" *ngIf="personnel">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2
            class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate"
          >
            {{ personnel.firstName }} {{ personnel.lastName }}
          </h2>
          <p class="text-lg text-gray-600">{{ personnel.role }}</p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            [routerLink]="['/personnel', personnel.id, 'edit']"
            class="btn-secondary"
          >
            Modifier l'employé
          </button>
          <button
            (click)="toggleStatus()"
            [class]="
              personnel.isActive
                ? 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md'
                : 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md'
            "
          >
            {{ personnel.isActive ? 'Deactivate' : 'Activate' }}
          </button>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Informations personnelles
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom complet</label>
            <p class="mt-1 text-sm text-gray-900">
              {{ personnel.firstName }} {{ personnel.lastName }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="mt-1 text-sm text-gray-900">{{ personnel.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Téléphone</label>
            <p class="mt-1 text-sm text-gray-900">{{ personnel.phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Statut</label>
            <p class="mt-1">
              <span
                class="status-badge"
                [ngClass]="
                  personnel.isActive ? 'status-accepted' : 'status-rejected'
                "
              >
                {{ personnel.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Informations professionnelles -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Informations professionnelles
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label class="text-sm font-medium text-gray-500">Rôle</label>
            <p class="mt-1">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                [ngClass]="getRoleClass(personnel.role)"
              >
                {{ personnel.role }}
              </span>
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >Date d'embauche</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ personnel.hireDate | firestoreDate | date : 'mediumDate' }}
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500"
              >Années de service</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ getYearsOfService() }} ans
            </p>
          </div>
          <div *ngIf="personnel.salary">
            <label class="text-sm font-medium text-gray-500"
              >Salaire mensuel</label
            >
            <p class="mt-1 text-sm text-gray-900">
              {{ personnel.salary.toLocaleString() }} €
            </p>
          </div>
        </div>
      </div>

      <!-- Spécialisations -->
      <div class="card" *ngIf="personnel.specializations?.length">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Spécialisations</h3>
        <div class="flex flex-wrap gap-2">
          <span
            *ngFor="let spec of personnel.specializations"
            class="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
          >
            {{ spec }}
          </span>
        </div>
      </div>

      <!-- Permissions -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Autorisations</h3>
        <div class="space-y-4">
          <div
            *ngFor="let permission of personnel.permissions"
            class="border rounded-lg p-4"
          >
            <h4 class="font-medium text-gray-900 mb-2 capitalize">
              {{ permission.module }}
            </h4>
            <div class="flex flex-wrap gap-2">
              <span
                *ngFor="let action of permission.actions"
                class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded"
              >
                {{ action }}
              </span>
            </div>
          </div>
          <div
            *ngIf="personnel.permissions.length === 0"
            class="text-center py-4 text-gray-500"
          >
            Aucune autorisation spécifique attribuée
          </div>
        </div>
      </div>

      <!-- Résumé d'activité -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          Résumé d'activité
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">
              {{ activityStats.totalTasks }}
            </div>
            <div class="text-sm text-gray-500">Tâches totales</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">
              {{ activityStats.completedTasks }}
            </div>
            <div class="text-sm text-gray-500">Tâches complétées</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">
              {{ activityStats.efficiency }}%
            </div>
            <div class="text-sm text-gray-500">Taux d'efficacité</div>
          </div>
        </div>
      </div>

      <!-- Activité récente -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
        <div class="space-y-3">
          <div class="text-center py-8 text-gray-500">
            Le suivi d'activité sera disponible dans les prochaines mises à
            jour.
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PersonnelDetailComponent implements OnInit {
  personnel: Personnel | null = null;
  personnelId: string | null = null;
  activityStats = {
    totalTasks: 0,
    completedTasks: 0,
    efficiency: 0,
  };

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit() {
    (async () => {
      this.personnelId = this.route.snapshot.paramMap.get('id');
      if (this.personnelId) {
        await this.loadPersonnelData();
      }
    })();
  }

  private async loadPersonnelData(): Promise<void> {
    try {
      this.personnel = await this.garageDataService.getById<Personnel>(
        'personnel',
        this.personnelId!
      );
      if (this.personnel) {
        this.calculateActivityStats();
      }
    } catch (error) {
      this.notificationService.showError('Failed to load personnel data');
    }
  }

  private calculateActivityStats(): void {
    // Mock data for now - will be replaced with real activity tracking
    this.activityStats = {
      totalTasks: Math.floor(Math.random() * 50) + 10,
      completedTasks: Math.floor(Math.random() * 40) + 5,
      efficiency: Math.floor(Math.random() * 30) + 70,
    };
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

  getYearsOfService(): number {
    if (!this.personnel) return 0;
    const pipe = new FirestoreDatePipeTS();
    // const hireDate = new Date(this.personnel.hireDate);
    const hireDate = new Date(pipe.transform(this.personnel.hireDate));
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hireDate.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    return diffYears;
  }

  async toggleStatus(): Promise<void> {
    if (!this.personnel) return;

    try {
      const newStatus = !this.personnel.isActive;
      await this.garageDataService.update('personnel', this.personnelId!, {
        isActive: newStatus,
      });
      this.personnel.isActive = newStatus;
      this.notificationService.showSuccess(
        `Employee ${newStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      this.notificationService.showError('Failed to update employee status');
    }
  }
}
