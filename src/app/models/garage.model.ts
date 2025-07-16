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