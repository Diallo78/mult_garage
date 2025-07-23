import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { GarageDataService } from '../../services/garage-data.service';
import { StorageService } from '../../services/storage.service';
import { NotificationService } from '../../services/notification.service';
import { Visit, Client, Vehicle, Driver } from '../../models/client.model';
import { FirestoreDatePipeTS } from '../../pipe/firestore-date.pipe';

interface VisitDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

@Component({
  selector: 'app-visit-form-enhanced',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
  <div *ngIf="isLoading" class="flex justify-center items-center h-[60vh]">
    <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-solid"></div>
  </div>

  <div *ngIf="!isLoading">
    <div class="space-y-6">
      <div class="md:flex md:items-center md:justify-between">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {{ isEditMode ? 'Modifier la visite' : 'Nouvelle visite' }}
          </h2>
        </div>
      </div>

      <div class="card">
        <form [formGroup]="visitForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <!-- Visit Date -->
          <div>
            <label class="form-label">Date de la visite *</label>
            <input
              type="datetime-local"
              formControlName="visitDate"
              class="form-input"
              [class.border-red-500]="visitForm.get('visitDate')?.invalid && visitForm.get('visitDate')?.touched"
            />
            <div *ngIf="visitForm.get('visitDate')?.invalid && visitForm.get('visitDate')?.touched" class="mt-1 text-sm text-red-600">
              Visit date is required
            </div>
          </div>

          <!-- Client Selection -->
          <div>
            <label class="form-label">Client *</label>
            <select
              formControlName="clientId"
              (change)="onClientChange()"
              class="form-input"
              [class.border-red-500]="visitForm.get('clientId')?.invalid && visitForm.get('clientId')?.touched"
            >
              <option value="">Sélectionnez un client</option>
              <option *ngFor="let client of clients" [value]="client.id">
                {{ client.firstName }} {{ client.lastName }}
              </option>
            </select>
            <div *ngIf="visitForm.get('clientId')?.invalid && visitForm.get('clientId')?.touched" class="mt-1 text-sm text-red-600">
              Please select a client
            </div>
          </div>

          <!-- Vehicle Selection -->
          <div>
            <label class="form-label">Véhicule *</label>
            <select
              formControlName="vehicleId"
              class="form-input"
              [class.border-red-500]="visitForm.get('vehicleId')?.invalid && visitForm.get('vehicleId')?.touched"
            >
              <option value="">Sélectionnez un Véhicule *</option>
              <option *ngFor="let vehicle of selectedClientVehicles" [value]="vehicle.id">
                {{ vehicle.brand }} {{ vehicle.model }} ({{ vehicle.licensePlate }})
              </option>
            </select>
            <div *ngIf="visitForm.get('vehicleId')?.invalid && visitForm.get('vehicleId')?.touched" class="mt-1 text-sm text-red-600">
              Please select a vehicle
            </div>
          </div>

          <!-- Driver Information -->
          <div class="border rounded-lg p-4 bg-gray-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Informations sur le conducteur (facultatif)</h3>
            <div formGroupName="driver" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nom du conducteur</label>
                <input
                  type="text"
                  formControlName="name"
                  class="form-input"
                  placeholder="Enter driver name"
                />
              </div>
              <div>
                <label class="form-label">Téléphone du conducteur</label>
                <input
                  type="tel"
                  formControlName="phone"
                  class="form-input"
                  placeholder="Enter driver phone"
                />
              </div>
              <div>
                <label class="form-label">Numéro de licence</label>
                <input
                  type="text"
                  formControlName="licenseNumber"
                  class="form-input"
                  placeholder="Enter license number"
                />
              </div>
            </div>
          </div>

          <!-- Issue Declaration Method -->
          <div class="border rounded-lg p-4 bg-blue-50">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Déclaration d'émission</h3>
            <div class="mb-4">
              <div class="flex items-center space-x-6">
                <div class="flex items-center">
                  <input
                    type="radio"
                    id="manual"
                    value="manual"
                    formControlName="declarationMethod"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label for="manual" class="ml-2 text-sm text-gray-700">Saisie manuelle</label>
                </div>
                <div class="flex items-center">
                  <input
                    type="radio"
                    id="document"
                    value="document"
                    formControlName="declarationMethod"
                    class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label for="document" class="ml-2 text-sm text-gray-700">Télécharger le document</label>
                </div>
              </div>
            </div>

            <!-- Manual Entry -->
            <div *ngIf="visitForm.get('declarationMethod')?.value === 'manual'">
              <div class="flex items-center justify-between mb-4">
                <label class="form-label">Problèmes signalés *</label>
                <button
                  type="button"
                  (click)="addIssue()"
                  class="btn-secondary text-sm"
                >
                  Ajouter un problème
                </button>
              </div>
              <div formArrayName="reportedIssues" class="space-y-3">
                <div *ngFor="let issue of reportedIssuesArray.controls; let i = index" class="flex items-center space-x-3">
                  <input
                    type="text"
                    [formControlName]="i"
                    class="form-input flex-1"
                    placeholder="Describe the issue"
                  />
                  <button
                    type="button"
                    (click)="removeIssue(i)"
                    class="text-red-600 hover:text-red-900"
                    [disabled]="reportedIssuesArray.length === 1"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>

            <!-- Document Upload -->
            <div *ngIf="visitForm.get('declarationMethod')?.value === 'document'">
              <div class="space-y-4">
                <div>
                  <label class="form-label">Télécharger le document de déclaration</label>
                  <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary-400 transition-colors">
                    <div class="space-y-1 text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <div class="flex text-sm text-gray-600">
                        <label for="file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                          <span>Télécharger des fichiers</span>
                          <input
                            id="file-upload"
                            type="file"
                            class="sr-only"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                            (change)="onFileSelect($event)"
                          />
                        </label>
                        <p class="pl-1">ou glisser-déposer</p>
                      </div>
                      <p class="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG jusqu'à 10 Mo chacun</p>
                    </div>
                  </div>
                </div>

                <!-- Uploaded Files -->
                <div *ngIf="uploadedDocuments.length > 0" class="space-y-2">
                  <h4 class="text-sm font-medium text-gray-900">Uploaded Documents:</h4>
                  <div class="space-y-2">
                    <div *ngFor="let doc of uploadedDocuments; let i = index"
                         class="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div class="flex items-center space-x-3">
                        <div class="flex-shrink-0">
                          <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ doc.name }}</p>
                          <p class="text-xs text-gray-500">{{ formatFileSize(doc.size) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <button
                          type="button"
                          (click)="viewDocument(doc)"
                          class="text-primary-600 hover:text-primary-900 text-sm"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          (click)="removeDocument(i)"
                          class="text-red-600 hover:text-red-900 text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Upload Progress -->
                <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="w-full bg-gray-200 rounded-full h-2">
                  <div class="bg-primary-600 h-2 rounded-full transition-all duration-300" [style.width.%]="uploadProgress"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="form-label">Statut</label>
            <select formControlName="status" class="form-input">
              <option value="Pending">En attente</option>
              <option value="InProgress">En cours</option>
              <option value="Completed">Complété</option>
              <option value="Cancelled">Annulé</option>
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
              [disabled]="visitForm.invalid || isLoading || (visitForm.get('declarationMethod')?.value === 'manual' && reportedIssuesArray.length === 0)"
              class="btn-primary"
            >
              <span *ngIf="isLoading" class="mr-2">Saving...</span>
              {{ isEditMode ? 'Modifier une Visit' : 'Créer une visite' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  `
})
export class VisitFormEnhancedComponent implements OnInit {
  visitForm: FormGroup;
  clients: Client[] = [];
  vehicles: Vehicle[] = [];
  selectedClientVehicles: Vehicle[] = [];
  isEditMode = false;
  isLoading = false;
  visitId: string | null = null;
  declarationMethod: 'manual' | 'document' = 'manual';
  uploadedDocuments: VisitDocument[] = [];
  uploadProgress = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly garageDataService: GarageDataService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.visitForm = this.fb.group({
      visitDate: ['', Validators.required],
      clientId: ['', Validators.required],
      vehicleId: [{ value: '', disabled: true }, Validators.required],
      driver: this.fb.group({
        name: [''],
        phone: [''],
        licenseNumber: ['']
      }),
      reportedIssues: this.fb.array([this.fb.control('', Validators.required)]),
      status: ['Pending'],
      declarationMethod: ['manual']
    });
  }

  get reportedIssuesArray(): FormArray {
    return this.visitForm.get('reportedIssues') as FormArray;
  }

  async ngOnInit(): Promise<void> {
    this.visitId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.visitId;

    await this.loadData();

    // Pre-select client and vehicle if provided in query params
    const clientId = this.route.snapshot.queryParamMap.get('clientId');
    const vehicleId = this.route.snapshot.queryParamMap.get('vehicleId');

    if (clientId) {
      this.visitForm.patchValue({ clientId });
      this.onClientChange();
    }

    if (vehicleId) {
      this.visitForm.patchValue({ vehicleId });
    }

    if (this.isEditMode && this.visitId) {
      await this.loadVisit();
    }
  }

  private async loadData(): Promise<void> {
    this.isLoading = true
    try {
      [this.clients, this.vehicles] = await Promise.all([
        this.garageDataService.getAll<Client>('clients'),
        this.garageDataService.getAll<Vehicle>('vehicles')
      ]);
    } catch (error) {
      this.notificationService.showError('Échec du chargement des données.' );
      console.log("Échec du chargement des données " + error);

    }finally{this.isLoading = false}
  }

  private async loadVisit(): Promise<void> {
    try {
      const visit = await this.garageDataService.getById<Visit>('visits', this.visitId!);
      if (visit) {
        // Clear existing issues
        while (this.reportedIssuesArray.length > 0) {
          this.reportedIssuesArray.removeAt(0);
        }

        // Add issues from visit
        if (visit.reportedIssues && visit.reportedIssues.length > 0) {
          visit.reportedIssues.forEach(issue => {
            this.reportedIssuesArray.push(this.fb.control(issue, Validators.required));
          });
          this.visitForm.patchValue({ declarationMethod: 'manual' });
        } else {
          // Load documents if no manual issues
          this.visitForm.patchValue({ declarationMethod: 'document' });
          // Load documents from storage
        }
        const pipeDate = new FirestoreDatePipeTS()
        this.visitForm.patchValue({
          // visitDate: new Date(visit.visitDate).toISOString().slice(0, 16),
          visitDate: pipeDate.transform(visit.visitDate),
          clientId: visit.clientId,
          vehicleId: visit.vehicleId,
          status: visit.status
        });

        this.onClientChange();
      }
    } catch (error) {
      this.notificationService.showError('Échec du chargement des données.' );
      console.log("Échec du chargement des données " + error);
    }
  }

  onClientChange(): void {
    const clientId = this.visitForm.get('clientId')?.value;
    if (clientId) {
      this.selectedClientVehicles = this.vehicles.filter(v => v.clientId === clientId);
      // Reset vehicle selection if current vehicle doesn't belong to selected client
      const currentVehicleId = this.visitForm.get('vehicleId')?.value;
      if (currentVehicleId && !this.selectedClientVehicles.find(v => v.id === currentVehicleId)) {
        this.visitForm.patchValue({ vehicleId: '' });
      }
      // Enable vehicle control
      this.visitForm.get('vehicleId')?.enable();
    } else {
      this.selectedClientVehicles = [];
      this.visitForm.patchValue({ vehicleId: '' });
      // Disable vehicle control
      this.visitForm.get('vehicleId')?.disable();
    }
  }

  addIssue(): void {
    this.reportedIssuesArray.push(this.fb.control('', Validators.required));
  }

  removeIssue(index: number): void {
    if (this.reportedIssuesArray.length > 1) {
      this.reportedIssuesArray.removeAt(index);
    }
  }

  async onFileSelect(event: any): Promise<void> {
    const files = Array.from(event.target.files) as File[];
    if (files.length === 0) return;

    this.uploadProgress = 0;
    const totalFiles = files.length;
    let uploadedCount = 0;

    try {
      for (const file of files) {
        // Validate file
        this.storageService.validateFile(file, 10, [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'text/plain'
        ]);

        // Upload file
        const url = await this.storageService.uploadFile(file, 'visit-documents');

        const document: VisitDocument = {
          id: this.generateId(),
          name: file.name,
          url,
          type: file.type,
          size: file.size,
          uploadedAt: new Date()
        };

        this.uploadedDocuments.push(document);
        uploadedCount++;
        this.uploadProgress = (uploadedCount / totalFiles) * 100;
      }

      this.notificationService.showSuccess(`${files.length} document(s) uploaded successfully`);
    } catch (error: any) {
      this.notificationService.showError(error.message || 'Failed to upload documents');
    } finally {
      this.uploadProgress = 0;
      // Reset file input
      event.target.value = '';
    }
  }

  removeDocument(index: number): void {
    const document = this.uploadedDocuments[index];
    this.uploadedDocuments.splice(index, 1);

    // Delete from storage
    this.storageService.deleteFile(document.url).catch(error => {
      console.error('Failed to delete file from storage:', error);
    });
  }

  viewDocument(document: VisitDocument): void {
    window.open(document.url, '_blank');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    if (this.visitForm.invalid) return;

    // Validate declaration method
    if (this.visitForm.get('declarationMethod')?.value === 'manual' && this.reportedIssuesArray.length === 0) {
      this.notificationService.showError('Please add at least one reported issue');
      return;
    }

    if (this.visitForm.get('declarationMethod')?.value === 'document' && this.uploadedDocuments.length === 0) {
      this.notificationService.showError('Please upload at least one document');
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.visitForm.value;
      const visitData: any = {
        visitDate: new Date(formValue.visitDate),
        clientId: formValue.clientId,
        vehicleId: formValue.vehicleId,
        status: formValue.status,
        declarationMethod: this.declarationMethod
      };

      if (formValue.declarationMethod === 'manual') {
        visitData.reportedIssues = formValue.reportedIssues.filter((issue: string) => issue.trim());
      } else {
        visitData.documents = this.uploadedDocuments;
        visitData.reportedIssues = ['See uploaded documents'];
      }

      if (formValue.driver.name) {
        visitData.driverId = formValue.driver;
      }

      if (this.isEditMode && this.visitId) {
        await this.garageDataService.update('visits', this.visitId, visitData);
        this.notificationService.showSuccess('Visit updated successfully');
      } else {
        await this.garageDataService.create('visits', visitData);
        this.notificationService.showSuccess('Visit created successfully');
      }

      this.router.navigate(['/visits']);
    } catch (error) {
      this.notificationService.showError('Failed to save visit');
    } finally {
      this.isLoading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/visits']);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}