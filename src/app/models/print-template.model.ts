/**
 * Modèles de personnalisation des documents imprimables (CarGest).
 *
 * Cette couche est purement présentationnelle : elle ne contient aucune donnée
 * métier. Les documents (devis, factures, ...) continuent d'être lus depuis
 * leurs collections d'origine ; seules leur mise en page est configurable ici.
 */

/** Types de documents imprimables supportés. */
export type PrintDocumentType =
  | 'quote'
  | 'invoice'
  | 'repairOrder'
  | 'vehicleReception'
  | 'interventionSheet'
  | 'paymentReceipt'
  | 'deliveryNote'
  | 'report';

/** Alignement horizontal d'un bloc. */
export type PrintAlign = 'left' | 'center' | 'right';

/** Colonnes disponibles dans le tableau des prestations. */
export type PrintItemColumn = 'designation' | 'quantity' | 'unitPrice' | 'discount' | 'total';

/** Configuration d'une colonne du tableau des prestations. */
export interface PrintColumnConfig {
  key: PrintItemColumn;
  enabled: boolean;
  order: number;
}

/** Format papier. */
export type PrintPageFormat = 'A4' | 'A5' | 'Letter';

/** Orientation du document. */
export type PrintOrientation = 'portrait' | 'landscape';

/** Sections du corps du document, dans leur ordre d'affichage. */
export type PrintBodySection =
  | 'documentInfo'
  | 'clientInfo'
  | 'vehicleInfo'
  | 'itemsTable'
  | 'totals'
  | 'notes'
  | 'conditions';

/** Description d'un type de document (pour les listes et sélecteurs). */
export interface PrintDocumentTypeInfo {
  value: PrintDocumentType;
  label: string;
  description: string;
  /** Titre imprimé par défaut sur le document. */
  defaultTitle: string;
}

/** Mise en page générale. */
export interface PrintPageSettings {
  format: PrintPageFormat;
  orientation: PrintOrientation;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
}

/** En-tête du document. */
export interface PrintHeaderSettings {
  /** Titre imprimé sur le document. Vide = titre par défaut du type de document. */
  title: string;
  logoVisible: boolean;
  logoAlign: PrintAlign;
  logoWidth: number;
  logoHeight: number;
  showCompanyName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showLegalIds: boolean;
  align: PrintAlign;
  borderBottom: boolean;
  borderColor: string;
  titleAlign: PrintAlign;
}

/** Corps du document. */
export interface PrintBodySettings {
  sectionOrder: PrintBodySection[];
  showDocumentInfo: boolean;
  showClientInfo: boolean;
  showVehicleInfo: boolean;
  showItems: boolean;
  showTotals: boolean;
  showNotes: boolean;
  showConditions: boolean;
  fontSize: number;
  tableHeadColor: string;
  tableHeadTextColor: string;
  tableBorderColor: string;
  tableZebra: boolean;
  sectionSpacing: number;
  conditionsText: string;
  /** Visibilité des lignes financières dans la section des totaux. */
  financialDisplay: PrintFinancialDisplay;
  /** Configuration des colonnes du tableau des prestations. */
  tableColumns: PrintColumnConfig[];
}

/** Contrôle l'affichage de chaque ligne financière dans le document imprimé. */
export interface PrintFinancialDisplay {
  showDiscount: boolean;
  showPrecompte: boolean;
  showSubtotal: boolean;
  showVat: boolean;
  showTotal: boolean;
  showNetToPay: boolean;
}

/** Pied de page du document. */
export interface PrintFooterSettings {
  visible: boolean;
  text: string;
  slogan: string;
  showCompanyContacts: boolean;
  showLegalMentions: boolean;
  showBankDetails: boolean;
  bankName: string;
  bankAccount: string;
  bankIban: string;
  bankSwift: string;
  borderTop: boolean;
  borderColor: string;
  align: PrintAlign;
}

/** Une zone de signature. */
export interface PrintSignatureZone {
  enabled: boolean;
  label: string;
  /** Position de la signature sur le document (le responsable/DG est toujours à droite). */
  position?: PrintAlign;
}

/** Signatures et cachets. */
export interface PrintSignatureSettings {
  responsible: PrintSignatureZone;
  client: PrintSignatureZone;
  mechanic: PrintSignatureZone;
  stamp: PrintSignatureZone;
}

/** Apparence générale. */
export interface PrintStyleSettings {
  fontFamily: string;
  baseFontSize: number;
  primaryColor: string;
  secondaryColor: string;
  titleColor: string;
  textColor: string;
  showSeparators: boolean;
}

/** Modèle d'impression enregistré en base (collection `garagePrintTemplates`). */
export interface PrintTemplate {
  id: string;
  garageId: string;
  documentType: PrintDocumentType;
  templateName: string;
  pageSettings: PrintPageSettings;
  headerSettings: PrintHeaderSettings;
  bodySettings: PrintBodySettings;
  footerSettings: PrintFooterSettings;
  signatureSettings: PrintSignatureSettings;
  styleSettings: PrintStyleSettings;
  createdAt: Date;
  updatedAt: Date;
}

/** Modèle sans les champs gérés par la couche de persistance. */
export type PrintTemplateData = Omit<
  PrintTemplate,
  'id' | 'garageId' | 'createdAt' | 'updatedAt'
>;

/** Catalogue des documents imprimables. */
export const PRINT_DOCUMENT_TYPES: PrintDocumentTypeInfo[] = [
  {
    value: 'quote',
    label: 'Devis',
    description: 'Proposition commerciale chiffrée remise au client.',
    defaultTitle: 'DEVIS',
  },
  {
    value: 'invoice',
    label: 'Facture',
    description: 'Document de facturation des prestations et pièces.',
    defaultTitle: 'FACTURE',
  },
  {
    value: 'repairOrder',
    label: 'Ordre de réparation',
    description: 'Autorisation de réparation signée par le client.',
    defaultTitle: 'ORDRE DE RÉPARATION',
  },
  {
    value: 'vehicleReception',
    label: 'Fiche de réception véhicule',
    description: 'État du véhicule à son entrée au garage.',
    defaultTitle: 'FICHE DE RÉCEPTION',
  },
  {
    value: 'interventionSheet',
    label: "Fiche d'intervention",
    description: 'Détail des travaux réalisés sur le véhicule.',
    defaultTitle: "FICHE D'INTERVENTION",
  },
  {
    value: 'paymentReceipt',
    label: 'Reçu de paiement',
    description: 'Justificatif de règlement remis au client.',
    defaultTitle: 'REÇU DE PAIEMENT',
  },
  {
    value: 'deliveryNote',
    label: 'Bon de livraison',
    description: 'Attestation de remise du véhicule au client.',
    defaultTitle: 'BON DE LIVRAISON',
  },
  {
    value: 'report',
    label: 'Rapport / état',
    description: 'Rapport de diagnostic ou état statistique.',
    defaultTitle: 'RAPPORT',
  },
];

/** Retourne les informations d'un type de document. */
export function getDocumentTypeInfo(
  documentType: PrintDocumentType
): PrintDocumentTypeInfo | undefined {
  return PRINT_DOCUMENT_TYPES.find((type) => type.value === documentType);
}

/** Ordre par défaut des sections du corps. */
export const DEFAULT_BODY_SECTION_ORDER: PrintBodySection[] = [
  'documentInfo',
  'clientInfo',
  'vehicleInfo',
  'itemsTable',
  'totals',
  'notes',
  'conditions',
];

/** Colonnes par défaut du tableau des prestations (dans l'ordre). */
export const DEFAULT_TABLE_COLUMNS: PrintColumnConfig[] = [
  { key: 'designation', enabled: true, order: 0 },
  { key: 'quantity', enabled: true, order: 1 },
  { key: 'unitPrice', enabled: true, order: 2 },
  { key: 'discount', enabled: false, order: 3 },
  { key: 'total', enabled: true, order: 4 },
];

/** Affichage financier par défaut (tout visible sauf précompte et remise, optionnels). */
export const DEFAULT_FINANCIAL_DISPLAY: PrintFinancialDisplay = {
  showDiscount: true,
  showPrecompte: true,
  showSubtotal: true,
  showVat: true,
  showTotal: true,
  showNetToPay: true,
};

/** Crée un modèle par défaut (aspect professionnel) pour un type de document. */
export function createDefaultPrintTemplate(
  documentType: PrintDocumentType
): PrintTemplateData {
  const info = getDocumentTypeInfo(documentType);

  return {
    documentType,
    templateName: info ? `Modèle par défaut - ${info.label}` : 'Modèle par défaut',

    pageSettings: {
      format: 'A4',
      orientation: 'portrait',
      marginTop: 12,
      marginRight: 12,
      marginBottom: 12,
      marginLeft: 12,
    },

    headerSettings: {
      title: '',
      logoVisible: true,
      logoAlign: 'right',
      logoWidth: 40,
      logoHeight: 20,
      showCompanyName: true,
      showAddress: true,
      showPhone: true,
      showEmail: true,
      showWebsite: false,
      showLegalIds: true,
      align: 'left',
      borderBottom: true,
      borderColor: '#16a34a',
      titleAlign: 'center',
    },

    bodySettings: {
      sectionOrder: [...DEFAULT_BODY_SECTION_ORDER],
      showDocumentInfo: true,
      showClientInfo: true,
      showVehicleInfo: true,
      showItems: true,
      showTotals: true,
      showNotes: true,
      showConditions: true,
      fontSize: 10,
      tableHeadColor: '#16a34a',
      tableHeadTextColor: '#ffffff',
      tableBorderColor: '#d1d5db',
      tableZebra: true,
      sectionSpacing: 6,
      conditionsText:
        'Les travaux supplémentaires éventuels feront l’objet d’un accord préalable. Le véhicule non retiré dans un délai de 30 jours pourra être mis en gage.',
      financialDisplay: { ...DEFAULT_FINANCIAL_DISPLAY },
      tableColumns: DEFAULT_TABLE_COLUMNS.map((c) => ({ ...c })),
    },

    footerSettings: {
      visible: true,
      text: 'Merci de votre confiance.',
      slogan: '',
      showCompanyContacts: true,
      showLegalMentions: true,
      showBankDetails: false,
      bankName: '',
      bankAccount: '',
      bankIban: '',
      bankSwift: '',
      borderTop: true,
      borderColor: '#d1d5db',
      align: 'center',
    },

    signatureSettings: {
      responsible: { enabled: true, label: 'Le responsable', position: 'right' },
      client: { enabled: true, label: 'Le client', position: 'left' },
      mechanic: { enabled: false, label: 'Le mécanicien', position: 'center' },
      stamp: { enabled: true, label: 'Cachet de l’entreprise', position: 'center' },
    },

    styleSettings: {
      fontFamily: 'Helvetica, Arial, sans-serif',
      baseFontSize: 11,
      primaryColor: '#16a34a',
      secondaryColor: '#2563eb',
      titleColor: '#111827',
      textColor: '#1f2937',
      showSeparators: true,
    },
  };
}

/**
 * Fusionne un modèle enregistré avec les valeurs par défaut.
 * Garantit la compatibilité ascendante : les modèles créés avant l'ajout
 * d'une nouvelle option restent utilisables sans migration.
 */
export function mergeWithDefaultTemplate(
  documentType: PrintDocumentType,
  saved: Partial<PrintTemplateData> | null | undefined
): PrintTemplateData {
  const base = createDefaultPrintTemplate(documentType);
  if (!saved) return base;

  return {
    ...base,
    ...saved,
    documentType,
    pageSettings: { ...base.pageSettings, ...(saved.pageSettings ?? {}) },
    headerSettings: { ...base.headerSettings, ...(saved.headerSettings ?? {}) },
    bodySettings: {
      ...base.bodySettings,
      ...(saved.bodySettings ?? {}),
      financialDisplay: {
        ...base.bodySettings.financialDisplay,
        ...((saved.bodySettings as any)?.financialDisplay ?? {}),
      },
      tableColumns: (saved.bodySettings as any)?.tableColumns?.length
        ? (saved.bodySettings as any).tableColumns
        : base.bodySettings.tableColumns,
    },
    footerSettings: { ...base.footerSettings, ...(saved.footerSettings ?? {}) },
    signatureSettings: {
      ...base.signatureSettings,
      ...(saved.signatureSettings ?? {}),
      responsible: {
        ...base.signatureSettings.responsible,
        ...(saved.signatureSettings?.responsible ?? {}),
      },
      client: {
        ...base.signatureSettings.client,
        ...(saved.signatureSettings?.client ?? {}),
      },
      mechanic: {
        ...base.signatureSettings.mechanic,
        ...(saved.signatureSettings?.mechanic ?? {}),
      },
      stamp: {
        ...base.signatureSettings.stamp,
        ...(saved.signatureSettings?.stamp ?? {}),
      },
    },
    styleSettings: { ...base.styleSettings, ...(saved.styleSettings ?? {}) },
  };
}
