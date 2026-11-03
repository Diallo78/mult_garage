import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { PrintTemplateService } from '../../services/print-template.service';
import {
  PrintDocumentData,
  PrintGarageInfo,
  PrintRendererService,
} from '../../services/print-renderer.service';
import {
  DEFAULT_BODY_SECTION_ORDER,
  PrintBodySection,
  PrintDocumentType,
  PrintTemplateData,
  PRINT_DOCUMENT_TYPES,
  getDocumentTypeInfo,
  mergeWithDefaultTemplate,
} from '../../models/print-template.model';
import { PrintTemplatePreviewComponent } from './print-template-preview.component';

type EditorTab = 'header' | 'body' | 'footer' | 'signature' | 'style';

/**
 * Éditeur visuel d'un modèle d'impression : configuration à gauche,
 * aperçu du document à droite, mise à jour immédiate à chaque modification.
 */
@Component({
  selector: 'app-print-template-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PrintTemplatePreviewComponent],
  template: `
    <div class="space-y-6" *ngIf="form">
      <!-- En-tête de page -->
      <div class="md:flex md:items-center md:justify-between gap-4">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold text-gray-900 sm:text-3xl">
            Modèle d'impression - {{ documentLabel }}
          </h2>
          <p class="mt-1 text-sm text-gray-600">
            {{ documentDescription }}
          </p>
        </div>
        <div class="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button type="button" class="btn-secondary" (click)="goBack()">
            Retour
          </button>
          <button
            type="button"
            class="btn-secondary"
            (click)="previewOpen = true"
          >
            Aperçu
          </button>
          <button type="button" class="btn-secondary" (click)="testPrint()">
            Tester l'impression
          </button>
          <button
            type="button"
            class="btn-secondary"
            [disabled]="saving"
            (click)="resetTemplate()"
          >
            Restaurer le modèle par défaut
          </button>
          <button
            type="button"
            class="btn-primary"
            [disabled]="saving"
            (click)="save()"
          >
            {{ saving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <!-- Zone de configuration -->
        <div class="card">
          <div class="flex flex-wrap gap-2 border-b border-gray-200 pb-3 mb-4">
            <button
              *ngFor="let tab of tabs"
              type="button"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              [ngClass]="
                activeTab === tab.value
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              (click)="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>

          <form [formGroup]="form" class="space-y-5">
            <!-- Onglet : En-tête -->
            <div *ngIf="activeTab === 'header'" formGroupName="headerSettings" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="logoVisible" id="logoVisible" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="logoVisible" class="text-sm text-gray-700">Afficher le logo</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="borderBottom" id="borderBottom" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="borderBottom" class="text-sm text-gray-700">Bordure sous l'en-tête</label>
                </div>
                <div>
                  <label class="form-label">Position du logo</label>
                  <select formControlName="logoAlign" class="form-input">
                    <option value="left">Gauche</option>
                    <option value="right">Droite</option>
                    <option value="center">Centre</option>
                  </select>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Largeur logo (mm)</label>
                    <input type="number" formControlName="logoWidth" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Hauteur logo (mm)</label>
                    <input type="number" formControlName="logoHeight" class="form-input" />
                  </div>
                </div>
                <div>
                  <label class="form-label">Alignement du bloc entreprise</label>
                  <select formControlName="align" class="form-input">
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Alignement du titre</label>
                  <select formControlName="titleAlign" class="form-input">
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Couleur de la bordure</label>
                  <input type="color" formControlName="borderColor" class="form-input h-10" />
                </div>
              </div>

              <div>
                <p class="form-label">Informations affichées</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="flex items-center gap-2" *ngFor="let item of headerToggles">
                    <input type="checkbox" [formControlName]="item.control" [id]="item.control" class="h-4 w-4 text-primary-600 rounded" />
                    <label [for]="item.control" class="text-sm text-gray-700">{{ item.label }}</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Onglet : Contenu -->
            <div *ngIf="activeTab === 'body'" class="space-y-4">
              <div formGroupName="bodySettings" class="space-y-4">
                <div>
                  <p class="form-label">Ordre des sections</p>
                  <ul class="divide-y divide-gray-200 border rounded-lg">
                    <li
                      *ngFor="let section of sectionOrder; let i = index"
                      class="flex items-center justify-between px-3 py-2 text-sm"
                    >
                      <span>{{ bodySectionLabels[section] }}</span>
                      <span class="flex gap-1">
                        <button type="button" class="px-2 py-0.5 border rounded disabled:opacity-40" [disabled]="i === 0" (click)="moveSection(i, -1)">↑</button>
                        <button type="button" class="px-2 py-0.5 border rounded disabled:opacity-40" [disabled]="i === sectionOrder.length - 1" (click)="moveSection(i, 1)">↓</button>
                      </span>
                    </li>
                  </ul>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="flex items-center gap-2" *ngFor="let item of bodyToggles">
                    <input type="checkbox" [formControlName]="item.control" [id]="item.control" class="h-4 w-4 text-primary-600 rounded" />
                    <label [for]="item.control" class="text-sm text-gray-700">{{ item.label }}</label>
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label class="form-label">Taille du texte (px)</label>
                    <input type="number" formControlName="fontSize" class="form-input" />
                  </div>
                  <div>
                    <label class="form-label">Espacement sections (mm)</label>
                    <input type="number" formControlName="sectionSpacing" class="form-input" />
                  </div>
                  <div class="flex items-center gap-2 mt-6">
                    <input type="checkbox" formControlName="tableZebra" id="tableZebra" class="h-4 w-4 text-primary-600 rounded" />
                    <label for="tableZebra" class="text-sm text-gray-700">Lignes alternées</label>
                  </div>
                  <div>
                    <label class="form-label">Fond de l'en-tête de tableau</label>
                    <input type="color" formControlName="tableHeadColor" class="form-input h-10" />
                  </div>
                  <div>
                    <label class="form-label">Texte de l'en-tête de tableau</label>
                    <input type="color" formControlName="tableHeadTextColor" class="form-input h-10" />
                  </div>
                  <div>
                    <label class="form-label">Bordures du tableau</label>
                    <input type="color" formControlName="tableBorderColor" class="form-input h-10" />
                  </div>
                </div>

                <div>
                  <label class="form-label">Conditions générales</label>
                  <textarea formControlName="conditionsText" rows="3" class="form-input"></textarea>
                </div>
              </div>
            </div>

            <!-- Onglet : Pied de page -->
            <div *ngIf="activeTab === 'footer'" formGroupName="footerSettings" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="visible" id="footerVisible" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="footerVisible" class="text-sm text-gray-700">Afficher le pied de page</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="borderTop" id="footerBorder" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="footerBorder" class="text-sm text-gray-700">Bordure supérieure</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="showCompanyContacts" id="showCompanyContacts" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="showCompanyContacts" class="text-sm text-gray-700">Coordonnées du garage</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="showLegalMentions" id="showLegalMentions" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="showLegalMentions" class="text-sm text-gray-700">Mentions légales</label>
                </div>
                <div class="flex items-center gap-2">
                  <input type="checkbox" formControlName="showBankDetails" id="showBankDetails" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="showBankDetails" class="text-sm text-gray-700">Informations bancaires</label>
                </div>
                <div>
                  <label class="form-label">Alignement</label>
                  <select formControlName="align" class="form-input">
                    <option value="left">Gauche</option>
                    <option value="center">Centre</option>
                    <option value="right">Droite</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Couleur de la bordure</label>
                  <input type="color" formControlName="borderColor" class="form-input h-10" />
                </div>
                <div>
                  <label class="form-label">Slogan</label>
                  <input type="text" formControlName="slogan" class="form-input" />
                </div>
              </div>

              <div>
                <label class="form-label">Texte personnalisé</label>
                <input type="text" formControlName="text" class="form-input" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Banque</label>
                  <input type="text" formControlName="bankName" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Numéro de compte</label>
                  <input type="text" formControlName="bankAccount" class="form-input" />
                </div>
                <div>
                  <label class="form-label">IBAN</label>
                  <input type="text" formControlName="bankIban" class="form-input" />
                </div>
                <div>
                  <label class="form-label">SWIFT</label>
                  <input type="text" formControlName="bankSwift" class="form-input" />
                </div>
              </div>
            </div>

            <!-- Onglet : Signatures -->
            <div *ngIf="activeTab === 'signature'" formGroupName="signatureSettings" class="space-y-4">
              <div *ngFor="let zone of signatureZones" [formGroupName]="zone.key" class="border rounded-lg p-3">
                <div class="flex items-center gap-2 mb-3">
                  <input type="checkbox" formControlName="enabled" [id]="'sig-' + zone.key" class="h-4 w-4 text-primary-600 rounded" />
                  <label [for]="'sig-' + zone.key" class="text-sm font-medium text-gray-700">{{ zone.label }}</label>
                </div>
                <input type="text" formControlName="label" class="form-input" placeholder="Libellé affiché" />
              </div>
            </div>

            <!-- Onglet : Apparence -->
            <div *ngIf="activeTab === 'style'" class="space-y-4">
              <div formGroupName="pageSettings" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="form-label">Format</label>
                  <select formControlName="format" class="form-input">
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Orientation</label>
                  <select formControlName="orientation" class="form-input">
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Paysage</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Marge haute (mm)</label>
                  <input type="number" formControlName="marginTop" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Marge basse (mm)</label>
                  <input type="number" formControlName="marginBottom" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Marge gauche (mm)</label>
                  <input type="number" formControlName="marginLeft" class="form-input" />
                </div>
                <div>
                  <label class="form-label">Marge droite (mm)</label>
                  <input type="number" formControlName="marginRight" class="form-input" />
                </div>
              </div>

              <div formGroupName="styleSettings" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="sm:col-span-2">
                  <label class="form-label">Police</label>
                  <select formControlName="fontFamily" class="form-input">
                    <option value="Helvetica, Arial, sans-serif">Helvetica / Arial</option>
                    <option value="Georgia, 'Times New Roman', serif">Georgia / Times</option>
                    <option value="'Times New Roman', Times, serif">Times New Roman</option>
                    <option value="'Segoe UI', Tahoma, sans-serif">Segoe UI</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Taille de base (px)</label>
                  <input type="number" formControlName="baseFontSize" class="form-input" />
                </div>
                <div class="flex items-center gap-2 mt-6">
                  <input type="checkbox" formControlName="showSeparators" id="showSeparators" class="h-4 w-4 text-primary-600 rounded" />
                  <label for="showSeparators" class="text-sm text-gray-700">Séparateurs</label>
                </div>
                <div>
                  <label class="form-label">Couleur principale</label>
                  <input type="color" formControlName="primaryColor" class="form-input h-10" />
                </div>
                <div>
                  <label class="form-label">Couleur secondaire</label>
                  <input type="color" formControlName="secondaryColor" class="form-input h-10" />
                </div>
                <div>
                  <label class="form-label">Couleur des titres</label>
                  <input type="color" formControlName="titleColor" class="form-input h-10" />
                </div>
                <div>
                  <label class="form-label">Couleur du texte</label>
                  <input type="color" formControlName="textColor" class="form-input h-10" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Zone d'aperçu -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-semibold text-gray-900">Aperçu</h3>
            <span class="text-xs text-gray-500">
              Données fictives - mise à jour automatique
            </span>
          </div>
          <app-print-template-preview
            [html]="previewHtml"
            [pageWidthPx]="pageWidthPx"
            [pageHeightPx]="pageHeightPx"
          ></app-print-template-preview>
        </div>
      </div>
    </div>

    <!-- Aperçu plein écran -->
    <div
      *ngIf="previewOpen"
      class="fixed inset-0 z-50 bg-black/60 p-4 overflow-auto"
      (click)="previewOpen = false"
    >
      <div class="max-w-5xl mx-auto bg-white rounded-lg p-4" (click)="$event.stopPropagation()">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900">Aperçu - {{ documentLabel }}</h3>
          <button type="button" class="btn-secondary" (click)="previewOpen = false">Fermer</button>
        </div>
        <app-print-template-preview
          [html]="previewHtml"
          [pageWidthPx]="pageWidthPx"
          [pageHeightPx]="pageHeightPx"
        ></app-print-template-preview>
      </div>
    </div>
  `,
})
export class PrintTemplateEditorComponent implements OnInit, OnDestroy {
  form?: FormGroup;
  documentType: PrintDocumentType = 'quote';
  documentLabel = '';
  documentDescription = '';

  activeTab: EditorTab = 'header';
  previewHtml = '';
  pageWidthPx = 794;
  pageHeightPx = 1123;
  previewOpen = false;
  saving = false;

  readonly tabs: { value: EditorTab; label: string }[] = [
    { value: 'header', label: 'En-tête' },
    { value: 'body', label: 'Contenu' },
    { value: 'footer', label: 'Pied de page' },
    { value: 'signature', label: 'Signatures' },
    { value: 'style', label: 'Apparence' },
  ];

  readonly headerToggles = [
    { control: 'showCompanyName', label: "Nom de l'entreprise" },
    { control: 'showAddress', label: 'Adresse' },
    { control: 'showPhone', label: 'Téléphone' },
    { control: 'showEmail', label: 'E-mail' },
    { control: 'showWebsite', label: 'Site web' },
    { control: 'showLegalIds', label: 'NIF / RC / Agrément' },
  ];

  readonly bodyToggles = [
    { control: 'showDocumentInfo', label: 'Informations du document' },
    { control: 'showClientInfo', label: 'Informations du client' },
    { control: 'showVehicleInfo', label: 'Informations du véhicule' },
    { control: 'showItems', label: 'Tableau des prestations' },
    { control: 'showTotals', label: 'Totaux' },
    { control: 'showNotes', label: 'Observations' },
    { control: 'showConditions', label: 'Conditions générales' },
  ];

  readonly signatureZones = [
    { key: 'responsible', label: 'Signature du responsable' },
    { key: 'client', label: 'Signature du client' },
    { key: 'mechanic', label: 'Signature du mécanicien' },
    { key: 'stamp', label: "Cachet de l'entreprise" },
  ];

  readonly bodySectionLabels: Record<PrintBodySection, string> = {
    documentInfo: 'Informations du document',
    clientInfo: 'Informations du client',
    vehicleInfo: 'Informations du véhicule',
    itemsTable: 'Tableau des prestations',
    totals: 'Totaux',
    notes: 'Observations',
    conditions: 'Conditions générales',
  };

  private garageInfo: PrintGarageInfo | null = null;
  private sampleData!: PrintDocumentData;
  private formSub?: Subscription;
  private previewTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly notificationService: NotificationService,
    private readonly templateService: PrintTemplateService,
    private readonly renderer: PrintRendererService
  ) {}

  async ngOnInit(): Promise<void> {
    const param = this.route.snapshot.paramMap.get('documentType');
    const known = PRINT_DOCUMENT_TYPES.some((type) => type.value === param);
    if (!param || !known) {
      this.notificationService.showError('Type de document inconnu');
      this.router.navigate(['/print-templates']);
      return;
    }

    this.documentType = param as PrintDocumentType;
    const info = getDocumentTypeInfo(this.documentType);
    this.documentLabel = info?.label ?? 'Document';
    this.documentDescription = info?.description ?? '';

    this.garageInfo = await this.renderer.loadGarageInfo();
    this.sampleData = this.buildSampleData();

    await this.loadTemplate();
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
    if (this.previewTimer) clearTimeout(this.previewTimer);
  }

  get sectionOrder(): PrintBodySection[] {
    return (
      (this.form?.get('bodySettings.sectionOrder')?.value as PrintBodySection[]) ??
      []
    );
  }

  /** Déplace une section dans l'ordre d'affichage. */
  moveSection(index: number, direction: -1 | 1): void {
    const order = [...this.sectionOrder];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;

    [order[index], order[target]] = [order[target], order[index]];
    this.form?.get('bodySettings.sectionOrder')?.setValue(order);
    this.form?.markAsDirty();
  }

  /** Ouvre une fenêtre d'impression avec le modèle courant. */
  testPrint(): void {
    try {
      this.renderer.print(this.currentTemplate(), this.sampleData, this.garageInfo);
    } catch (error) {
      this.notificationService.showError(String(error));
    }
  }

  /** Enregistre le modèle personnalisé du garage. */
  async save(): Promise<void> {
    if (!this.form) return;
    this.saving = true;
    try {
      await this.templateService.saveTemplate(
        this.documentType,
        this.currentTemplate()
      );
      this.notificationService.showSuccess('Modèle enregistré avec succès');
    } catch (error) {
      this.notificationService.showError(
        "Échec de l'enregistrement du modèle : " + error
      );
    } finally {
      this.saving = false;
    }
  }

  /** Supprime le modèle personnalisé et revient au modèle par défaut. */
  async resetTemplate(): Promise<void> {
    if (!this.form) return;
    const confirmed = window.confirm(
      'Restaurer le modèle par défaut ? Les personnalisations de ce document seront perdues.'
    );
    if (!confirmed) return;

    try {
      await this.templateService.resetTemplate(this.documentType);
      this.applyTemplate(this.templateService.getDefaultTemplate(this.documentType));
      this.notificationService.showSuccess('Modèle par défaut restauré');
    } catch (error) {
      this.notificationService.showError(
        'Échec de la restauration du modèle : ' + error
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/print-templates']);
  }

  // ---------------------------------------------------------------------------
  // Interne
  // ---------------------------------------------------------------------------

  private async loadTemplate(): Promise<void> {
    try {
      const template = await this.templateService.getTemplate(this.documentType);
      this.applyTemplate(template);
    } catch (error) {
      this.notificationService.showError(
        'Échec du chargement du modèle : ' + error
      );
      this.applyTemplate(
        this.templateService.getDefaultTemplate(this.documentType)
      );
    }
  }

  private applyTemplate(template: PrintTemplateData): void {
    this.form = this.fb.group({
      documentType: [template.documentType],
      templateName: [template.templateName],
      pageSettings: this.fb.group({ ...template.pageSettings }),
      headerSettings: this.fb.group({ ...template.headerSettings }),
      bodySettings: this.fb.group({
        ...template.bodySettings,
        sectionOrder: [this.normalizeSectionOrder(template.bodySettings.sectionOrder)],
      }),
      footerSettings: this.fb.group({ ...template.footerSettings }),
      signatureSettings: this.fb.group({
        responsible: this.fb.group({ ...template.signatureSettings.responsible }),
        client: this.fb.group({ ...template.signatureSettings.client }),
        mechanic: this.fb.group({ ...template.signatureSettings.mechanic }),
        stamp: this.fb.group({ ...template.signatureSettings.stamp }),
      }),
      styleSettings: this.fb.group({ ...template.styleSettings }),
    });

    this.formSub?.unsubscribe();
    this.formSub = this.form.valueChanges.subscribe(() => this.schedulePreview());

    this.refreshPreview();
  }

  /** Garantit que toutes les sections connues sont présentes une seule fois. */
  private normalizeSectionOrder(order: PrintBodySection[]): PrintBodySection[] {
    const result = order.filter((section) =>
      DEFAULT_BODY_SECTION_ORDER.includes(section)
    );
    DEFAULT_BODY_SECTION_ORDER.forEach((section) => {
      if (!result.includes(section)) result.push(section);
    });
    return result;
  }

  private schedulePreview(): void {
    if (this.previewTimer) clearTimeout(this.previewTimer);
    this.previewTimer = setTimeout(() => this.refreshPreview(), 150);
  }

  private refreshPreview(): void {
    const template = this.currentTemplate();
    this.pageWidthPx = this.renderer.getPageWidthPx(template);
    this.pageHeightPx = this.renderer.getPageHeightPx(template);
    this.previewHtml = this.renderer.buildFullHtml(
      template,
      this.sampleData,
      this.garageInfo
    );
  }

  private currentTemplate(): PrintTemplateData {
    return mergeWithDefaultTemplate(
      this.documentType,
      (this.form?.value ?? {}) as Partial<PrintTemplateData>
    );
  }

  /** Données fictives réalistes utilisées pour l'aperçu et le test d'impression. */
  private buildSampleData(): PrintDocumentData {
    const info = getDocumentTypeInfo(this.documentType);
    const currency = this.garageInfo?.currency || 'GNF';
    const format = (value: number): string =>
      `${value.toLocaleString('fr-FR')} ${currency}`;

    return {
      documentType: this.documentType,
      title: info?.defaultTitle,
      documentNumber: 'DOC-2026-0042',
      documentDate: new Date().toLocaleDateString('fr-FR'),
      meta: [
        { label: 'Statut', value: 'Validé' },
        { label: 'Échéance', value: '30 jours' },
      ],
      clientName: 'Alpha Transport SARL',
      clientLines: [
        'Mamadou Diallo',
        'Tél. : +224 620 00 00 00',
        'contact@alpha-transport.gn',
        'Zone industrielle, Kaloum',
      ],
      vehicleLines: [
        'Toyota Hilux - AB 1234 CD',
        'Année : 2019',
        'Kilométrage : 128 400 km',
      ],
      items: [
        {
          designation: 'Vidange moteur et remplacement du filtre à huile',
          quantity: 1,
          unitPrice: 350000,
          total: 350000,
        },
        {
          designation: 'Plaquettes de frein avant (jeu complet)',
          quantity: 1,
          unitPrice: 620000,
          total: 620000,
        },
        {
          designation: "Main d'œuvre mécanique",
          quantity: 3.5,
          unitPrice: 80000,
          total: 280000,
        },
      ],
      totals: [
        { label: 'Sous-total', value: format(1250000) },
        { label: 'TVA (18 %)', value: format(225000) },
        { label: 'Total à payer', value: format(1475000), strong: true },
      ],
      notes: 'Véhicule à retirer avant 18h00. Pièces garanties 6 mois.',
      currency,
    };
  }
}
