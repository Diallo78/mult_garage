export type ClientType = 'individual' | 'company';

export interface Client {
  id: string;
  garageId: string;
  userId?: string; // Référence vers User dans Firebase Auth
  /**
   * Discriminant du type de client.
   * Absent sur les anciens enregistrements => considéré comme 'individual'.
   */
  clientType?: ClientType;

  // --- Personne physique ---
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  address?: string;

  // --- Entreprise ---
  companyName?: string;
  companyAddress?: string;
  nif?: string; // Numéro d'identification fiscale
  vatKey?: string; // Clé TVA
  contactName?: string; // Logisticien / personne à contacter
  contactPhone?: string;
  contactEmail?: string;

  createdAt: Date;
  updatedAt: Date;
}

/** Retourne true si le client est une entreprise (les anciens clients sans clientType sont des personnes physiques). */
export function isCompanyClient(client: Client): boolean {
  return client.clientType === 'company';
}

/** Nom d'affichage d'un client : nom de l'entreprise ou Prénom + Nom. */
export function getClientDisplayName(client: Client): string {
  if (isCompanyClient(client)) {
    return client.companyName || 'Entreprise';
  }
  const name = `${client.firstName ?? ''} ${client.lastName ?? ''}`.trim();
  return name || 'Client';
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber?: string;
}

export interface Vehicle {
  id: string;
  garageId: string;
  clientId: string;
  brand: string;
  model: string;
  licensePlate: string;
  year: number;
  color?: string;
  vin?: string;
  mileage?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Visit {
  id: string;
  garageId: string;
  clientId: string;
  vehicleId: string;
  driverId?: Driver;
  visitDate: Date;
  reportedIssues: string[];
  documents?: VisitDocument[];
  declarationMethod?: 'manual' | 'document';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface VisitDocument {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}