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

export interface Personnel {
  id: string;
  garageId: string;
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

export interface Permission {
  module: string;
  actions: string[]; // ['read', 'write', 'delete', 'export']
}

export type UserRole = 'AdminGarage' | 'Technician' | 'Receptionist' | 'Accountant' | 'Manager';