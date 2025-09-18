export interface Diagnostic {
  id: string;
  title: string;
  garageId: string;
  visitId: string;
  vehicleId: string;
  technicianId: string;
  checks: DiagnosticCheck[];
  summary: string;
  finalDecision: 'Repair' | 'Monitor' | 'NonRepairable';
  technicianSignature?: string;
  images?: string[];
  videos?: string[];
  createdAt: Date;
  updatedAt: Date;
}



export interface DiagnosticCheck {
  id: string;
  category: string;
  description: string;
  compliant: boolean;
  quantity?: number;
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  postRepairVerification?: boolean;
  comments?: string;
}

export interface DiagnosticCategory {
  id: string;
  name: string;
  categorie: string;
  description: string;
  garageId: string;
  createdAt: Date;
  updatedAt: Date;
  isGroupHeader?: boolean;
}

// si on creer un emun nameCategory de type 'Problèmes Mécaniques, Problèmes Électriques, Carrosserie, Pneumatique'
export enum NameCategory {
  PROBLEMES_MECANIQUES = 'Problèmes Mécaniques',
  PROBLEMES_ELECTRIQUES = 'Problèmes Électriques',
  CARROSSERIE = 'Carrosserie',
  PNEUMATIQUE = 'Pneumatique',
  SYSTEME_REFROIDISSEMENR = 'Système de Refroidissement',
  ENTRETIEN_GENERAL ='Entretien Général',
  AUTRE = 'Autre',
}
