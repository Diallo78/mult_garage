import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { Intervention } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { FirestoreDatePipe } from '../../pipe/firestore-date.pipe';

@Component({
  selector: 'app-intervention-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FirestoreDatePipe],
  template: `
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
    </div>
  `
})
export class InterventionDetailComponent implements OnInit {
  intervention: Intervention | null = null;
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  interventionId: string | null = null;

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
    try {
      this.intervention = await this.garageDataService.getById<Intervention>('interventions', this.interventionId!);

      if (this.intervention) {
        [this.quote, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Quote>('quotes', this.intervention.quoteId),
          this.garageDataService.getById<Vehicle>('vehicles', this.intervention.vehicleId)
        ]);

        if (this.quote) {
          this.client = await this.garageDataService.getById<Client>('clients', this.quote.clientId);
        }
      }
    } catch (error) {
      this.notificationService.showError('Failed to load intervention data');
    }
  }

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
}