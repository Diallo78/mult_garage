import { UserRole, Permission } from './user.model';

export interface Personnel {
  id: string;
  garageId: string;
  userId?: string; // Référence vers User dans Firebase Auth
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  specializations?: string[];
  hireDate: Date;
  salary?: number;
  isActive: boolean;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Garage {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  siret?: string;
  vatNumber?: string;
  logo?: string;
  ownerId: string;
  description?: string;
  businessHours?: BusinessHours;
  createdAt: Date;
  updatedAt: Date;
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface GarageStatistics {
  revenue: number;
  expenses: number;
  profit: number;
  quotesIssued: number;
  paidInvoices: number;
  unpaidInvoices: number;
  registeredClients: number;
  staffCount: number;
  totalCars: number;
  carsInService: number;
}