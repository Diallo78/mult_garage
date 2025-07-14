export interface User {
    uid: string;
    email: string;
    displayName: string;
    garageId: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }

  export type UserRole = 'AdminGarage' | 'Technician' | 'Receptionist' | 'Accountant' | 'Manager';

  export interface Garage {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
  }