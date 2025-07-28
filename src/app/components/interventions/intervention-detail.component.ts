import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Intervention, InterventionTask } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';
import { Personnel } from '../../models/garage.model';

@Component({
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FirestoreDatePipe, FormsModule],
  template: `
    <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  </div>

  <div *ngIf="!isLoading">
    <div class="space-y-6" *ngIf="intervention">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Intervention Details
          </h2>
          <p class="text-lg text-gray-600">
            <span class="status-badge" [ngClass]="getStatusClass(intervention.status)">
              {{ intervention.status }}
            </span>
          </p>
        </div>
        <div class="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          <button
            (click)="updateStatus('InProgress')"
            class="btn-primary"
            *ngIf="intervention.status === 'Scheduled'"
          >
            Start Work
          </button>
          <button
            (click)="updateStatus('Completed')"
            class="btn-primary"
            *ngIf="intervention.status === 'InProgress' && allTasksCompleted()"
          >
            Complete Intervention
          </button>
          <button
            [routerLink]="['/invoices/create', intervention.id]"
            class="btn-primary"
            *ngIf="intervention.status === 'Completed'"
          >
            Create Invoice
          </button>
        </div>
      </div>

      <!-- Intervention Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Intervention Details</h3>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-500">Start Date</label>
              <p class="mt-1 text-sm text-gray-900">{{ intervention.startDate | firestoreDate | date:'medium' }}</p>
            </div>
            <div *ngIf="intervention.endDate">
              <label class="text-sm font-medium text-gray-500">End Date</label>
              <p class="mt-1 text-sm text-gray-900">{{ intervention.endDate | firestoreDate | date:'medium' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Duration</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ intervention.actualDuration || intervention.estimatedDuration }}h
                <span class="text-gray-500">(Est: {{ intervention.estimatedDuration }}h)</span>
              </p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Status</label>
              <p class="mt-1">
                <span class="status-badge" [ngClass]="getStatusClass(intervention.status)">
                  {{ intervention.status }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div class="card" *ngIf="client && vehicle">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Client & Vehicle</h3>
          <div class="space-y-3">
            <div>
              <label class="text-sm font-medium text-gray-500">Client</label>
              <p class="mt-1 text-sm text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Phone</label>
              <p class="mt-1 text-sm text-gray-900">{{ client.phone }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Vehicle</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.brand }} {{ vehicle.model }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">License Plate</label>
              <p class="mt-1 text-sm text-gray-900">{{ vehicle.licensePlate }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Overview -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Progress Overview</h3>
        <div class="mb-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{{ getCompletedTasks() }}/{{ intervention.tasks.length }} tasks completed</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-primary-600 h-3 rounded-full transition-all duration-300"
              [style.width.%]="getProgress()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Tasks -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Tasks</h3>
        <div class="space-y-4">
          <div *ngFor="let task of intervention.tasks; let i = index"
               class="border rounded-lg p-4"
               [ngClass]="task.completed ? 'border-green-200 bg-green-50' : 'border-gray-200'">
            <div class="flex items-start justify-between">
              <div class="flex items-start space-x-3 flex-1">
                <input
                  type="checkbox"
                  [checked]="task.completed"
                  (change)="toggleTask(i, $event)"
                  class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  [disabled]="intervention.status === 'Completed'"
                />
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900" [ngClass]="task.completed ? 'line-through text-gray-500' : ''">
                    {{ task.description }}
                  </h4>
                  <div class="mt-1 text-sm text-gray-500">
                    Estimated: {{ task.estimatedTime }}h
                    <span *ngIf="task.actualTime"> | Actual: {{ task.actualTime }}h</span>
                  </div>
                  <div *ngIf="task.notes" class="mt-2 text-sm text-gray-600">
                    <strong>Notes:</strong> {{ task.notes }}
                  </div>
                </div>
              </div>
              <div class="ml-4">
                <span class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium"
                      [ngClass]="task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'">
                  {{ task.completed ? '✓' : i + 1 }}
                </span>
<button
  *ngIf="intervention.status !== 'Completed' && !task.completed"
  class="text-xs underline ml-4"
  [ngClass]="{
    'text-yellow-600': task.status !== 'Suspended',
    'text-blue-600': task.status === 'Suspended'
  }"
  (click)="task.status === 'Suspended' ? resumeTask(task) : openSuspendModal(task)"
>
  {{ task.status === 'Suspended' ? 'Resume' : 'Suspend' }}
</button>

              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Used Parts -->
      <div class="card" *ngIf="intervention.usedParts.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Used Parts</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Part Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Cost
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr *ngFor="let part of intervention.usedParts">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ part.partName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ part.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  \${{ part.unitCost.toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  \${{ part.totalCost.toFixed(2) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Final Report -->
      <div class="card" *ngIf="intervention.finalReport">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Final Report</h3>
        <p class="text-gray-900 whitespace-pre-wrap">{{ intervention.finalReport }}</p>
      </div>

       <!-- Technic interve -->

      <div class="card" *ngIf="technicianUsers.length > 0">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Technicians Involved</h3>
        <ul class="space-y-2">
          <li *ngFor="let tech of technicianUsers" class="text-sm text-gray-800 flex items-center gap-2">
            <span>{{ tech.firstName }}. {{ tech.lastName }}</span>
            <span *ngIf="tech.id === intervention?.groupLeader" class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Group Leader</span>
          </li>
        </ul>
      </div>
    </div>



    <!-- Modal de suspension -->
<div *ngIf="showSuspendModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white rounded-lg p-6 w-full max-w-md">
    <h3 class="text-lg font-bold mb-4">Suspend Task</h3>
    <p class="text-sm text-gray-600 mb-2">Provide the reason for suspending the task:</p>
    <textarea [(ngModel)]="suspendReason" rows="3" class="w-full border border-gray-300 rounded p-2 mb-4"></textarea>

    <div class="flex justify-end space-x-3">
      <button (click)="cancelSuspend()" class="btn-secondary">Cancel</button>
      <button (click)="confirmSuspend()" class="btn-primary">Confirm</button>
    </div>
  </div>
</div>
    </div>


  `
})
export class InterventionDetailComponent implements OnInit {
  intervention: Intervention | null = null;
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  interventionId: string | null = null;
  isLoading = true;

  technicianUsers: Personnel[] = [];
  groupLeaderName: string = '';

  constructor(
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly route: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    this.interventionId = this.route.snapshot.paramMap.get('id');
    if (this.interventionId) {
      await this.loadInterventionData();
    }
  }

  private async loadInterventionData(): Promise<void> {
    this.isLoading = true;
    try {
      this.intervention = await this.garageDataService.getById<Intervention>('interventions', this.interventionId!);
      if (!this.intervention) throw new Error('Intervention not found');

      const [quote, vehicle] = await Promise.all([
        this.garageDataService.getById<Quote>('quotes', this.intervention.quoteId),
        this.garageDataService.getById<Vehicle>('vehicles', this.intervention.vehicleId)
      ]);
      this.quote = quote;
      this.vehicle = vehicle;

      if (quote) {
        this.client = await this.garageDataService.getById<Client>('clients', quote.clientId);
      }

      // Charger les techniciens
      const technicianPromises = this.intervention.technicians.map(id =>
        this.garageDataService.getById<Personnel>('personnel', id)
      );
      const techResults = await Promise.all(technicianPromises);
      this.technicianUsers = techResults.filter((user): user is Personnel => user !== null);

      // Trouver le chef de groupe
      const leader = this.technicianUsers.find(u => u.id === this.intervention!.groupLeader);
      this.groupLeaderName = leader ? leader.firstName : 'Not Found';

    } catch (error) {
      this.notificationService.showError('Failed to load intervention data');
    } finally {
      this.isLoading = false;
    }
  }


//   private async loadInterventionData(): Promise<void> {
//     this.isLoading = true
//     try {
//       this.intervention = await this.garageDataService.getById<Intervention>('interventions', this.interventionId!);

//       if (this.intervention) {
//         [this.quote, this.vehicle] = await Promise.all([
//           this.garageDataService.getById<Quote>('quotes', this.intervention.quoteId),
//           this.garageDataService.getById<Vehicle>('vehicles', this.intervention.vehicleId)
//         ]);
//         // Charger les techniciens de l'intervention
//         await this.loadTechnicians(this.intervention.technicians, this.intervention.groupLeader);

//         if (this.quote) {
//           this.client = await this.garageDataService.getById<Client>('clients', this.quote.clientId);
//         }
//       }
//     } catch (error) {
//       this.notificationService.showError('Failed to load intervention data');
//     }finally{
//       this.isLoading = false
//     }
//   }

//  private async loadTechnicians(technicianIds: string[], groupLeaderId: string): Promise<void> {
//   try {
//     const userFetches = technicianIds.map(id => this.garageDataService.getById<Personnel>('personnel', id));
//     const results = await Promise.all(userFetches);

//     // Filtrer les `null`
//     this.technicianUsers = results.filter((user): user is Personnel => user !== null);

//     const leader = this.technicianUsers.find(u => u.id === groupLeaderId);
//     this.groupLeaderName = leader ? leader.firstName : 'Not Found';

//   } catch (error) {
//     this.notificationService.showError('Failed to load technician information');
//   }
// }



  async toggleTask(index: number, event: any): Promise<void> {
    if (!this.intervention || this.intervention.status === 'Completed') return;

    const completed = event.target.checked;
    this.intervention.tasks[index].completed = completed;

    try {
      await this.garageDataService.update('interventions', this.interventionId!, {
        tasks: this.intervention.tasks
      });

      if (completed) {
        this.notificationService.showSuccess('Task marked as completed');
      } else {
        this.notificationService.showSuccess('Task marked as incomplete');
      }
    } catch (error) {
      this.notificationService.showError('Failed to update task');
      // Revert the change
      this.intervention.tasks[index].completed = !completed;
    }
  }

  async updateStatus(status: 'InProgress' | 'Completed'): Promise<void> {
    if (!this.intervention) return;

    try {
      const updateData: any = { status };

      if (status === 'Completed') {
        updateData.endDate = new Date();
        // Calculate actual duration
        const startTime = new Date(this.intervention.startDate).getTime();
        const endTime = new Date().getTime();
        updateData.actualDuration = Math.round((endTime - startTime) / (1000 * 60 * 60) * 10) / 10; // Hours with 1 decimal
      }

      await this.garageDataService.update('interventions', this.interventionId!, updateData);
      this.intervention.status = status;

      if (status === 'Completed') {
        this.intervention.endDate = new Date();
        this.intervention.actualDuration = updateData.actualDuration;
      }

      this.notificationService.showSuccess(`Intervention ${status.toLowerCase()} successfully`);
    } catch (error) {
      this.notificationService.showError(`Failed to ${status.toLowerCase()} intervention`);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'status-pending';
      case 'inprogress': return 'status-accepted';
      case 'completed': return 'status-paid';
      case 'onhold': return 'status-partial';
      default: return 'status-pending';
    }
  }

  getProgress(): number {
    if (!this.intervention) return 0;
    const completed = this.getCompletedTasks();
    return (completed / this.intervention.tasks.length) * 100;
  }

  getCompletedTasks(): number {
    if (!this.intervention) return 0;
    return this.intervention.tasks.filter(task => task.completed).length;
  }

  allTasksCompleted(): boolean {
    if (!this.intervention) return false;
    return this.intervention.tasks.every(task => task.completed);
  }

  // 🔧 Variables pour la suspension
showSuspendModal = false;
suspendReason: string = '';
taskToSuspend: InterventionTask | null = null;

openSuspendModal(task: InterventionTask): void {
  this.taskToSuspend = task;
  this.suspendReason = task.suspendReason || '';
  this.showSuspendModal = true;
}

cancelSuspend(): void {
  this.showSuspendModal = false;
  this.taskToSuspend = null;
  this.suspendReason = '';
}

async confirmSuspend(): Promise<void> {
  if (!this.intervention || !this.taskToSuspend) return;

  this.taskToSuspend.status = 'Suspended';
  this.taskToSuspend.suspendReason = this.suspendReason;

  try {
    await this.garageDataService.update('interventions', this.interventionId!, {
      tasks: this.intervention.tasks
    });

    this.notificationService.showSuccess('Task suspended successfully');
  } catch (error) {
    this.notificationService.showError('Failed to suspend task');
  } finally {
    this.cancelSuspend();
  }
}

resumeTask(task: InterventionTask): void {
  task.status = 'Pending';
  task.suspendReason = '';

  this.garageDataService.update('interventions', this.interventionId!, {
    tasks: this.intervention?.tasks
  }).then(() => {
    this.notificationService.showSuccess('Task resumed');
  }).catch(() => {
    this.notificationService.showError('Failed to resume task');
  });
}

}