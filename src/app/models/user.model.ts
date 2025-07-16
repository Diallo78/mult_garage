export interface User {
  uid: string;
  email: string;
  displayName: string;
  garageId: string;
  role: UserRole;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'AdminGarage' | 'Manager' | 'Technician' | 'Receptionist' | 'Accountant' | 'Client' | 'SuperAdmin';

export interface UserProfile {
  userId: string;
  profileType: 'Client' | 'Personnel';
  // Informations communes
  firstName: string;
  lastName: string;
  phone: string;
  address?: string;
  // Informations spécifiques au personnel
  specializations?: string[];
  hireDate?: Date;
  salary?: number;
  permissions?: Permission[];
  // Informations spécifiques au client
  clientSince?: Date;
  // Métadonnées
  garageId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  module: string;
  actions: string[]; // ['read', 'write', 'delete', 'export', 'approve']
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
  settings: GarageSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface GarageSettings {
  currency: string;
  defaultVatRate: number;
  invoicePrefix: string;
  quotePrefix: string;
  workingHours: WorkingHours;
  notifications: NotificationSettings;
}

export interface WorkingHours {
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
  breakStart?: string;
  breakEnd?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  paymentReminders: boolean;
}