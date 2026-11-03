import { Injectable } from '@angular/core';
import { GarageDataService } from './garage-data.service';
import {
  PrintDocumentType,
  PrintTemplate,
  PrintTemplateData,
  createDefaultPrintTemplate,
  mergeWithDefaultTemplate,
} from '../models/print-template.model';

/** Nom de la collection Firestore dédiée aux modèles d'impression. */
const COLLECTION = 'garagePrintTemplates';

/**
 * Gère le chargement, la sauvegarde et la réinitialisation des modèles
 * d'impression personnalisés d'un garage.
 *
 * L'isolation multi-entreprises est assurée par `GarageDataService` qui
 * injecte et filtre systématiquement sur le `garageId` courant.
 */
@Injectable({
  providedIn: 'root',
})
export class PrintTemplateService {
  /** Cache mémoire : type de document -> modèle enregistré (ou null). */
  private readonly cache = new Map<PrintDocumentType, PrintTemplate | null>();

  constructor(private readonly garageDataService: GarageDataService) {}

  /** Retourne tous les modèles enregistrés du garage courant. */
  async getAllSaved(): Promise<PrintTemplate[]> {
    const templates = await this.garageDataService.getAll<PrintTemplate>(
      COLLECTION
    );
    this.cache.clear();
    templates.forEach((template) => {
      this.cache.set(template.documentType, template);
    });
    return templates;
  }

  /** Retourne le modèle enregistré pour un type de document, ou null. */
  async getSavedTemplate(
    documentType: PrintDocumentType
  ): Promise<PrintTemplate | null> {
    if (this.cache.has(documentType)) {
      return this.cache.get(documentType) ?? null;
    }

    const templates = await this.garageDataService.getAll<PrintTemplate>(
      COLLECTION
    );
    templates.forEach((template) => {
      this.cache.set(template.documentType, template);
    });

    const found = templates.find((t) => t.documentType === documentType) ?? null;
    if (!this.cache.has(documentType)) {
      this.cache.set(documentType, found);
    }
    return found;
  }

  /**
   * Retourne le modèle effectif à utiliser : le modèle enregistré fusionné avec
   * les valeurs par défaut, ou un modèle par défaut si aucun n'a été personnalisé.
   */
  async getTemplate(
    documentType: PrintDocumentType
  ): Promise<PrintTemplateData> {
    const saved = await this.getSavedTemplate(documentType);
    return mergeWithDefaultTemplate(documentType, saved);
  }

  /** Indique si un modèle personnalisé existe pour ce type de document. */
  async isCustomized(documentType: PrintDocumentType): Promise<boolean> {
    return (await this.getSavedTemplate(documentType)) !== null;
  }

  /**
   * Enregistre (crée ou met à jour) le modèle d'un type de document.
   * Retourne l'identifiant du document Firestore.
   */
  async saveTemplate(
    documentType: PrintDocumentType,
    data: PrintTemplateData
  ): Promise<string> {
    const existing = await this.getSavedTemplate(documentType);
    const payload: PrintTemplateData = mergeWithDefaultTemplate(
      documentType,
      data
    );

    if (existing) {
      await this.garageDataService.update<PrintTemplate>(
        COLLECTION,
        existing.id,
        payload
      );
      this.cache.set(documentType, { ...existing, ...payload });
      return existing.id;
    }

    const newId = await this.garageDataService.create<PrintTemplate>(
      COLLECTION,
      {
        ...payload,
        // `GarageDataService.create` réinjecte le garageId courant et les
        // horodatages ; ces valeurs ne sont fournies que pour satisfaire le type.
        garageId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Omit<PrintTemplate, 'id'>
    );
    this.cache.set(documentType, {
      ...payload,
      id: newId,
      garageId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as PrintTemplate);
    return newId;
  }

  /** Supprime le modèle personnalisé (retour au modèle par défaut). */
  async resetTemplate(documentType: PrintDocumentType): Promise<void> {
    const existing = await this.getSavedTemplate(documentType);
    if (existing) {
      await this.garageDataService.delete(COLLECTION, existing.id);
    }
    this.cache.set(documentType, null);
  }

  /** Retourne le modèle par défaut (non persisté) d'un type de document. */
  getDefaultTemplate(documentType: PrintDocumentType): PrintTemplateData {
    return createDefaultPrintTemplate(documentType);
  }

  /** Vide le cache mémoire (à appeler après un changement de garage). */
  clearCache(): void {
    this.cache.clear();
  }
}
