import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Intervention } from '../../models/intervention.model';
import { Quote } from '../../models/quote.model';
import { Client, Vehicle } from '../../models/client.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6" *ngIf="quote && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Create Intervention
          </h2>
          <p class="text-lg text-gray-600">
            {{ vehicle.brand }} {{ vehicle.model }} - {{ client.firstName }} {{ client.lastName }}
          </p>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="interventionForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Start Date *</label>
              <input
                type="datetime-local"
                formControlName="startDate"
                class="form-input"
                [class.border-red-500]="interventionForm.get('startDate')?.invalid && interventionForm.get('startDate')?.touched"
              />
              <div *ngIf="interventionForm.get('startDate')?.invalid && interventionForm.get('startDate')?.touched" class="mt-1 text-sm text-red-600">
                Start date is required
              </div>
            </div>
            <div>
              <label class="form-label">Estimated Duration (hours) *</label>
              <input
                type="number"
                formControlName="estimatedDuration"
                class="form-input"
                min="0.5"
                step="0.5"
                [class.border-red-500]="interventionForm.get('estimatedDuration')?.invalid && interventionForm.get('estimatedDuration')?.touched"
              />
              <div *ngIf="interventionForm.get('estimatedDuration')?.invalid && interventionForm.get('estimatedDuration')?.touched" class="mt-1 text-sm text-red-600">
                Estimated duration is required
              </div>
            </div>
          </div>

          <!-- Tasks -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Intervention Tasks *</label>
              <button
                type="button"
                (click)="addTask()"
                class="btn-secondary text-sm"
              >
                Add Task
              </button>
            </div>

            <div formArrayName="tasks" class="space-y-4">
              <div *ngFor="let task of tasksArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="form-label">Task Description *</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="form-input"
                      placeholder="Describe the task to be performed"
                    />
                  </div>

                  <div>
                    <label class="form-label">Estimated Time (hours)</label>
                    <input
                      type="number"
                      formControlName="estimatedTime"
                      class="form-input"
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <div class="md:col-span-3">
                    <label class="form-label">Notes</label>
                    <textarea
                      formControlName="notes"
                      rows="2"
                      class="form-input"
                      placeholder="Additional notes for this task"
                    ></textarea>
                  </div>
                </div>

                <div class="mt-3 flex justify-end">
                  <button
                    type="button"
                    (click)="removeTask(i)"
                    class="text-red-600 hover:text-red-900 text-sm"
                    [disabled]="tasksArray.length === 1"
                  >
                    Remove Task
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Used Parts -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Used Parts (Optional)</label>
              <button
                type="button"
                (click)="addPart()"
                class="btn-secondary text-sm"
              >
                Add Part
              </button>
            </div>

            <div formArrayName="usedParts" class="space-y-4">
              <div *ngFor="let part of usedPartsArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="form-label">Part Name</label>
                    <input
                      type="text"
                      formControlName="partName"
                      class="form-input"
                      placeholder="Part name"
                    />
                  </div>

                  <div>
                    <label class="form-label">Quantity</label>
                    <input
                      type="number"
                      formControlName="quantity"
                      (input)="calculatePartCost(i)"
                      class="form-input"
                      min="1"
                    />
                  </div>

                  <div>
                    <label class="form-label">Unit Cost</label>
                    <input
                      type="number"
                      formControlName="unitCost"
                      (input)="calculatePartCost(i)"
                      class="form-input"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label class="form-label">Total Cost</label>
                    <input
                      type="number"
                      formControlName="totalCost"
                      class="form-input bg-gray-100"
                      readonly
                    />
                  </div>
                </div>

                <div class="mt-3 flex justify-end">
                  <button
                    type="button"
                    (click)="removePart(i)"
                    class="text-red-600 hover:text-red-900 text-sm"
                  >
                    Remove Part
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="form-label">Status</label>
            <select formControlName="status" class="form-input">
              <option value="Scheduled">Scheduled</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="OnHold">On Hold</option>
            </select>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              (click)="goBack()"
              class="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              [disabled]="interventionForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Creating...</span>
              Create Intervention
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InterventionFormComponent implements OnInit {
  interventionForm: FormGroup;
  quote: Quote | null = null;
  client: Client | null = null;
  vehicle: Vehicle | null = null;
  quoteId: string | null = null;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.interventionForm = this.fb.group({
      startDate: ['', Validators.required],
      estimatedDuration: ['', [Validators.required, Validators.min(0.5)]],
      tasks: this.fb.array([this.createTaskGroup()]),
      usedParts: this.fb.array([]),
      status: ['Scheduled']
    });
  }

  get tasksArray(): FormArray {
    return this.interventionForm.get('tasks') as FormArray;
  }

  get usedPartsArray(): FormArray {
    return this.interventionForm.get('usedParts') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    this.quoteId = this.route.snapshot.paramMap.get('quoteId');
    if (this.quoteId) {
      await this.loadQuoteData();
      this.setDefaultStartDate();
    }
  }

  private async loadQuoteData(): Promise<void> {
    try {
      this.quote = await this.garageDataService.getById<Quote>('quotes', this.quoteId!);

      if (this.quote) {
        [this.client, this.vehicle] = await Promise.all([
          this.garageDataService.getById<Client>('clients', this.quote.clientId),
          this.garageDataService.getById<Vehicle>('vehicles', this.quote.vehicleId)
        ]);

        // Pre-populate tasks based on quote items
        this.populateTasksFromQuote();
      }
    } catch (error) {
      this.notificationService.showError('Failed to load quote data');
    }
  }

  private populateTasksFromQuote(): void {
    if (!this.quote) return;

    // Clear existing tasks
    while (this.tasksArray.length > 0) {
      this.tasksArray.removeAt(0);
    }

    // Add tasks based on quote items
    this.quote.items.forEach(item => {
      if (item.type === 'Labor' || item.type === 'Service') {
        this.tasksArray.push(this.createTaskGroup(item.designation, 1));
      }
    });

    // If no labor/service items, add a default task
    if (this.tasksArray.length === 0) {
      this.tasksArray.push(this.createTaskGroup());
    }
  }

  private setDefaultStartDate(): void {
    const now = new Date();
    now.setHours(9, 0, 0, 0); // Default to 9 AM
    this.interventionForm.patchValue({
      startDate: now.toISOString().slice(0, 16)
    });
  }

  private createTaskGroup(description: string = '', estimatedTime: number = 1): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      description: [description, Validators.required],
      completed: [false],
      estimatedTime: [estimatedTime],
      actualTime: [null],
      notes: ['']
    });
  }

  private createPartGroup(): FormGroup {
    return this.fb.group({
      id: [this.generateId()],
      partName: [''],
      quantity: [1],
      unitCost: [0],
      totalCost: [0],
      supplierPartNumber: ['']
    });
  }

  addTask(): void {
    this.tasksArray.push(this.createTaskGroup());
  }

  removeTask(index: number): void {
    if (this.tasksArray.length > 1) {
      this.tasksArray.removeAt(index);
    }
  }

  addPart(): void {
    this.usedPartsArray.push(this.createPartGroup());
  }

  removePart(index: number): void {
    this.usedPartsArray.removeAt(index);
  }

  calculatePartCost(index: number): void {
    const part = this.usedPartsArray.at(index);
    const quantity = part.get('quantity')?.value || 0;
    const unitCost = part.get('unitCost')?.value || 0;
    const totalCost = quantity * unitCost;

    part.patchValue({ totalCost });
  }

  async onSubmit(): Promise<void> {
    if (this.interventionForm.invalid || !this.quote) return;

    this.isLoading = true;

    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');

      const formValue = this.interventionForm.value;
      const interventionData: Omit<Intervention, 'id'> = {
        garageId: currentUser.garageId,
        quoteId: this.quoteId!,
        diagnosticId: this.quote.diagnosticId,
        vehicleId: this.quote.vehicleId,
        assignedTechnicianId: currentUser.uid,
        tasks: formValue.tasks,
        estimatedDuration: formValue.estimatedDuration,
        usedParts: formValue.usedParts,
        extraCosts: [],
        status: formValue.status,
        startDate: new Date(formValue.startDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await this.garageDataService.create('interventions', interventionData);
      this.notificationService.showSuccess('Intervention created successfully');
      this.router.navigate(['/interventions']);
    } catch (error) {
      this.notificationService.showError('Failed to create intervention');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/quotes']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}