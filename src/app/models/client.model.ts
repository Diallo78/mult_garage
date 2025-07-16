export interface Client {
  id: string;
  garageId: string;
  userId?: string; // Référence vers User dans Firebase Auth
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
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
  driverId?: string;
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