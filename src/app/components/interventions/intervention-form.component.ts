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
import { Personnel } from '../../models/garage.model';

@Component({
  selector: 'app-intervention-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6" *ngIf="quote && client && vehicle">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Créer une intervention
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
              <label class="form-label">Date de début *</label>
              <input
                type="datetime-local"
                formControlName="startDate"
                class="form-input"
                [class.border-red-500]="interventionForm.get('startDate')?.invalid && interventionForm.get('startDate')?.touched"
              />
              <div *ngIf="interventionForm.get('startDate')?.invalid && interventionForm.get('startDate')?.touched" class="mt-1 text-sm text-red-600">
                Date de début est requise
              </div>
            </div>
            <div>
              <label class="form-label">Durée estimée (heures) *</label>
              <input
                type="number"
                formControlName="estimatedDuration"
                class="form-input"
                min="0.5"
                step="0.5"
                [class.border-red-500]="interventionForm.get('estimatedDuration')?.invalid && interventionForm.get('estimatedDuration')?.touched"
              />
              <div *ngIf="interventionForm.get('estimatedDuration')?.invalid && interventionForm.get('estimatedDuration')?.touched" class="mt-1 text-sm text-red-600">
                Durée estimée est requise
              </div>
            </div>
          </div>

          <!-- Intervenants -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="form-label">Techniciens *</label>
              <select
                formControlName="technicians"
                class="form-input"
                multiple
              >
                <option *ngFor="let tech of technicianList" [value]="tech.id">
                  {{ tech.name }}
                </option>
              </select>
              <div *ngIf="interventionForm.get('technicians')?.invalid && interventionForm.get('technicians')?.touched" class="text-red-500 text-sm">
                Au moins un technicien est requis
              </div>
            </div>

            <div>
              <label class="form-label">Chef d'équipe *</label>
              <select
                formControlName="groupLeader"
                class="form-input"
              >
                <option value="">-- Sélectionner le chef d'équipe --</option>
                <option *ngFor="let tech of technicianList" [value]="tech.id">
                  {{ tech.name }}
                </option>
              </select>
              <div *ngIf="interventionForm.get('groupLeader')?.invalid && interventionForm.get('groupLeader')?.touched" class="text-red-500 text-sm">
                Chef d'équipe est requis
              </div>
            </div>
          </div>


          <!-- Tasks -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Tâches d'intervention *</label>
              <button
                type="button"
                (click)="addTask()"
                class="btn-secondary text-sm"
              >
                Ajouter une tâche
              </button>
            </div>

            <div formArrayName="tasks" class="space-y-4">
              <div *ngFor="let task of tasksArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="form-label">Description de la tâche *</label>
                    <input
                      type="text"
                      formControlName="description"
                      class="form-input"
                      placeholder="Décrire la tâche à effectuer"
                    />
                  </div>

                  <div>
                    <label class="form-label">Durée estimée (heures)</label>
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
                      placeholder="Noter la tâche"
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
                    Supprimer la tâche
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Used Parts -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <label class="form-label">Composants utilisés (facultatif)</label>
              <button
                type="button"
                (click)="addPart()"
                class="btn-secondary text-sm"
              >
                Ajouter un composant
              </button>
            </div>

            <div formArrayName="usedParts" class="space-y-4">
              <div *ngFor="let part of usedPartsArray.controls; let i = index"
                   [formGroupName]="i"
                   class="border rounded-lg p-4 bg-gray-50">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label class="form-label">Nom du composant</label>
                    <input
                      type="text"
                      formControlName="partName"
                      class="form-input"
                      placeholder="Part name"
                    />
                  </div>

                  <div>
                    <label class="form-label">Quantité</label>
                    <input
                      type="number"
                      formControlName="quantity"
                      (input)="calculatePartCost(i)"
                      class="form-input"
                      min="1"
                    />
                  </div>

                  <div>
                    <label class="form-label">Coût unitaire</label>
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
                    <label class="form-label">Coût total</label>
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
                    Supprimer le composant
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="form-label">Statut</label>
            <select formControlName="status" class="form-input">
              <option value="Scheduled">Planifiée</option>
              <option value="InProgress">En cours</option>
              <option value="Completed">Complétée</option>
              <option value="OnHold">En pause</option>
            </select>
          </div>

          <div class="flex justify-end space-x-4">
            <button
              type="button"
              (click)="goBack()"
              class="btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              [disabled]="interventionForm.invalid || isLoading"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Création en cours...</span>
              Créer une intervention
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

  technicianList: { id: string; name: string }[] = [];

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
      status: ['Scheduled'],

      // 👇 Ajout pour les techniciens
      technicians: [[], Validators.required],
      groupLeader: ['', Validators.required]
    });
  }

  get tasksArray(): FormArray {
    return this.interventionForm.get('tasks') as FormArray;
  }

  get usedPartsArray(): FormArray {
    return this.interventionForm.get('usedParts') as FormArray;
  }

  ngOnInit() {
    this.quoteId = this.route.snapshot.paramMap.get('quoteId');
    (async()=>{
      if (this.quoteId) {
        await this.loadQuoteData();
        await this.loadTechnicians();
        this.setDefaultStartDate();
      }
    })()
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
      this.notificationService.showError('Failed to load quote data ' + error);
    }
  }

  private async loadTechnicians(): Promise<void> {
    const pers = await this.garageDataService.getAll<Personnel>('personnel');
    this.technicianList = pers
      .filter(p => p.role === 'Technician')
      .map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`
      }));
  }

  private populateTasksFromQuote(): void {
    if (!this.quote) return;

    // Clear existing tasks
    while (this.tasksArray.length > 0) {
      this.tasksArray.removeAt(0);
    }

    // Add tasks based on quote items
    this.quote.items.forEach(item => {
      if (item.type === 'Part' || item.type === 'Service') {
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

        technicians: formValue.technicians,
        groupLeader: formValue.groupLeader,

        tasks: formValue.tasks,
        estimatedDuration: formValue.estimatedDuration,
        usedParts: formValue.usedParts,
        extraCosts: [],
        status: formValue.status,
        startDate: new Date(formValue.startDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      console.log(interventionData);

      await this.garageDataService.create('interventions', interventionData);
      this.notificationService.showSuccess('Intervention created successfully');
      this.router.navigate(['/interventions']);
    } catch (error) {
      this.notificationService.showError('Failed to create intervention');
      console.log('Failed to create intervention ' + error);

    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/quotes']);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }
}