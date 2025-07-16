import { Injectable } from '@angular/core';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { GarageDataService } from './garage-data.service';
import { NotificationService } from './notification.service';
import { User, UserRole } from '../models/user.model';
import { Client } from '../models/client.model';
import { Personnel } from '../models/garage.model';
import { firstValueFrom } from 'rxjs';
import { auth, db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {


  constructor(
    private readonly authService: AuthService,
    private readonly garageDataService: GarageDataService,
    private readonly notificationService: NotificationService
  ) {

  }

  async createClientAccount(clientData: Omit<Client, 'id'>): Promise<{ clientId: string; userId: string }> {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');

      const garageId = localStorage.getItem('garageId');
      if (!garageId) {
        throw new Error('ID du garage manquant');
      }

      // Sauvegarder les informations de l'utilisateur actuel
      const currentUserEmail = currentUser.email;
      const currentUserPassword = await this.promptForCurrentPassword();

      // Generate temporary password
      const tempPassword = this.generateTempPassword();

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, clientData.email, tempPassword);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${clientData.firstName} ${clientData.lastName}`
      });

      // Create user document
      const userData: User = {
        uid: firebaseUser.uid,
        email: clientData.email,
        displayName: `${clientData.firstName} ${clientData.lastName}`,
        garageId: garageId,
        role: 'Client' as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Create client document with user reference
      const clientId = await this.garageDataService.create('clients', {
        ...clientData,
        userId: firebaseUser.uid
      });

      // Send password reset email for client to set their own password
      await sendPasswordResetEmail(auth, clientData.email);

      // Déconnecter le nouveau client et reconnecter l'utilisateur original
      await signOut(auth);
      await signInWithEmailAndPassword(auth, currentUserEmail, currentUserPassword);

      this.notificationService.showSuccess(
        `Compte client créé. Email de réinitialisation envoyé à ${clientData.email}`
      );

      return { clientId, userId: firebaseUser.uid };
    } catch (error: any) {
      this.notificationService.showError(`Échec de création du compte client: ${error.message}`);
      console.log(`Échec de création du compte client: ${error.message}`);

      throw error;
    }
  }

  async createClientAccountv2(clientData: Omit<Client, 'id'>, _garageId: string): Promise<{ clientId: string; userId: string }> {
    try {
      // 🔐 Récupère et sauvegarde AVANT création du nouvel utilisateur
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');


      const currentUserEmail = currentUser.email!;
      const currentUserPassword = await this.promptForCurrentPassword();

      // 📦 Mot de passe temporaire pour le client
      const tempPassword = this.generateTempPassword();

      // 🔧 Créer compte client
      const userCredential = await createUserWithEmailAndPassword(auth, clientData.email, tempPassword);
      const firebaseUser = userCredential.user;

      // 👤 Mettre à jour le profil
      await updateProfile(firebaseUser, {
        displayName: `${clientData.firstName} ${clientData.lastName}`
      });

      // 🔐 Créer le document utilisateur
      const userData: User = {
        uid: firebaseUser.uid,
        email: clientData.email,
        displayName: `${clientData.firstName} ${clientData.lastName}`,
        garageId: _garageId,
        role: 'Client' as UserRole,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // 📁 Créer le document client
      const clientId = await this.garageDataService.create('clients', {
        ...clientData,
        userId: firebaseUser.uid
      });

      // 🔄 Renvoyer lien de mot de passe
      await sendPasswordResetEmail(auth, clientData.email);

      // 🧹 Reconnecter l’utilisateur d’origine
      await signOut(auth);
      await signInWithEmailAndPassword(auth, currentUserEmail, currentUserPassword);

      this.notificationService.showSuccess(
        `Compte client créé. Email de réinitialisation envoyé à ${clientData.email}`, 5000
      );

      return { clientId, userId: firebaseUser.uid };
    } catch (error: any) {
      this.notificationService.showError(`Échec de création du compte client: ${error.message}`);
      console.log(`Échec de création du compte client: ${error.message}`);
      throw error;
    }
  }


  async createPersonnelAccount(personnelData: Omit<Personnel, 'id'>): Promise<{ personnelId: string; userId: string }> {
    try {
      const currentUser = await firstValueFrom(this.authService.currentUser$);
      if (!currentUser) throw new Error('No user logged in');

      const garageId = localStorage.getItem('garageId');
      if (!garageId) {
        throw new Error('ID du garage manquant');
      }

      // Sauvegarder les informations de l'utilisateur actuel
      const currentUserEmail = currentUser.email;
      const currentUserPassword = await this.promptForCurrentPassword();

      // Generate temporary password
      const tempPassword = this.generateTempPassword();

      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, personnelData.email, tempPassword);
      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${personnelData.firstName} ${personnelData.lastName}`
      });

      // Create user document
      const userData: User = {
        uid: firebaseUser.uid,
        email: personnelData.email,
        displayName: `${personnelData.firstName} ${personnelData.lastName}`,
        garageId: garageId,
        role: personnelData.role,
        isActive: personnelData.isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Create personnel document with user reference
      const personnelId = await this.garageDataService.create('personnel', {
        ...personnelData,
        userId: firebaseUser.uid
      });

      // Send password reset email for personnel to set their own password
      await sendPasswordResetEmail(auth, personnelData.email);

      // Déconnecter le nouveau personnel et reconnecter l'utilisateur original
      await signOut(auth);
      await signInWithEmailAndPassword(auth, currentUserEmail, currentUserPassword);

      this.notificationService.showSuccess(
        `Compte employé créé. Email de réinitialisation envoyé à ${personnelData.email}`
      );

      return { personnelId, userId: firebaseUser.uid };
    } catch (error: any) {
      this.notificationService.showError(`Échec de création du compte employé: ${error.message}`);
      console.log(`Échec de création du compte employé: ${error.message}`);

      throw error;
    }
  }

  async createClientAccountWithoutAuth(clientData: Omit<Client, 'id'>): Promise<string> {
    try {
      // Créer seulement le document client sans compte utilisateur
      const clientId = await this.garageDataService.create('clients', clientData);
      this.notificationService.showSuccess('Client créé avec succès (sans compte utilisateur)');
      return clientId;
    } catch (error: any) {
      this.notificationService.showError(`Échec de création du client: ${error.message}`);
      throw error;
    }
  }

  // async createPersonnelAccountWithoutAuth(personnelData: Omit<Personnel, 'id'>): Promise<string> {
  //   try {
  //     // Créer seulement le document personnel sans compte utilisateur
  //     const personnelId = await this.garageDataService.create('personnel', personnelData);
  //     this.notificationService.showSuccess('Employé créé avec succès (sans compte utilisateur)');
  //     return personnelId;
  //   } catch (error: any) {
  //     this.notificationService.showError(`Échec de création de l'employé: ${error.message}`);
  //     throw error;
  //   }
  // }

  private async promptForCurrentPassword(): Promise<string> {
    return new Promise((resolve, reject) => {
      const password = prompt('Pour créer un nouveau compte, veuillez confirmer votre mot de passe actuel:');
      if (password) {
        resolve(password);
      } else {
        reject(new Error('Mot de passe requis pour continuer'));
      }
    });
  }

  async deactivateUserAccount(userId: string): Promise<void> {
    try {
      // Update user status in Firestore
      await updateDoc(doc(db, 'users', userId), {
        isActive: false,
        updatedAt: new Date()
      });

      // Note: Firebase Auth doesn't allow disabling users from client-side
      // This would need to be done via Admin SDK on the backend

      this.notificationService.showSuccess('Compte utilisateur désactivé');
    } catch (error: any) {
      this.notificationService.showError(`Échec de désactivation du compte: ${error.message}`);
      throw error;
    }
  }

  async resetUserPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      this.notificationService.showSuccess(`Email de réinitialisation envoyé à ${email}`);
    } catch (error: any) {
      this.notificationService.showError(`Échec d'envoi de réinitialisation: ${error.message}`);
      throw error;
    }
  }

  private generateTempPassword(): string {
    // const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    // let password = '';
    // for (let i = 0; i < 12; i++) {
    //   password += chars.charAt(Math.floor(Math.random() * chars.length));
    // }
    return 'password';
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return this.getRolePermissions(userData.role);
      }
      return [];
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }

  private getRolePermissions(role: UserRole): string[] {
    const permissions: { [key in UserRole]: string[] } = {
      'AdminGarage': [
        'clients:read', 'clients:write', 'clients:delete',
        'vehicles:read', 'vehicles:write', 'vehicles:delete',
        'visits:read', 'visits:write', 'visits:delete',
        'diagnostics:read', 'diagnostics:write', 'diagnostics:delete',
        'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:approve',
        'interventions:read', 'interventions:write', 'interventions:delete',
        'invoices:read', 'invoices:write', 'invoices:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'reports:read', 'reports:export',
        'personnel:read', 'personnel:write', 'personnel:delete',
        'settings:read', 'settings:write'
      ],
      'Manager': [
        'clients:read', 'clients:write',
        'vehicles:read', 'vehicles:write',
        'visits:read', 'visits:write',
        'diagnostics:read', 'diagnostics:write',
        'quotes:read', 'quotes:write', 'quotes:approve',
        'interventions:read', 'interventions:write',
        'invoices:read', 'invoices:write',
        'payments:read', 'payments:write',
        'reports:read', 'reports:export',
        'personnel:read', 'personnel:write'
      ],
      'Technician': [
        'clients:read',
        'vehicles:read',
        'visits:read', 'visits:write',
        'diagnostics:read', 'diagnostics:write',
        'interventions:read', 'interventions:write'
      ],
      'Receptionist': [
        'clients:read', 'clients:write',
        'vehicles:read', 'vehicles:write',
        'visits:read', 'visits:write',
        'quotes:read',
        'invoices:read',
        'payments:read', 'payments:write'
      ],
      'Accountant': [
        'clients:read',
        'vehicles:read',
        'visits:read',
        'quotes:read', 'quotes:write', 'quotes:approve',
        'invoices:read', 'invoices:write',
        'payments:read', 'payments:write',
        'reports:read', 'reports:export'
      ],
      'Client': [
        'own-data:read',
        'own-quotes:read', 'own-quotes:approve',
        'own-invoices:read',
        'own-vehicles:read',
        'own-visits:read'
      ],
      'SuperAdmin': [
        'clients:read', 'clients:write', 'clients:delete',
        'vehicles:read', 'vehicles:write', 'vehicles:delete',
        'visits:read', 'visits:write', 'visits:delete',
        'diagnostics:read', 'diagnostics:write', 'diagnostics:delete',
        'quotes:read', 'quotes:write', 'quotes:delete', 'quotes:approve',
        'interventions:read', 'interventions:write', 'interventions:delete',
        'invoices:read', 'invoices:write', 'invoices:delete',
        'payments:read', 'payments:write', 'payments:delete',
        'reports:read', 'reports:export',
        'personnel:read', 'personnel:write', 'personnel:delete',
        'settings:read', 'settings:write'
      ]
    };

    return permissions[role] || [];
  }

  hasPermission(userRole: UserRole, permission: string): boolean {
    const permissions = this.getRolePermissions(userRole);
    return permissions.includes(permission);
  }

  async getClientByUserId(userId: string): Promise<Client | null> {
    try {
      const clients = await this.garageDataService.getWithFilter<Client>('clients', [
        { field: 'userId', operator: '==', value: userId }
      ]);
      return clients.length > 0 ? clients[0] : null;
    } catch (error) {
      console.error('Error getting client by userId:', error);
      return null;
    }
  }

  async getPersonnelByUserId(userId: string): Promise<Personnel | null> {
    try {
      const personnel = await this.garageDataService.getWithFilter<Personnel>('personnel', [
        { field: 'userId', operator: '==', value: userId }
      ]);
      return personnel.length > 0 ? personnel[0] : null;
    } catch (error) {
      console.error('Error getting personnel by userId:', error);
      return null;
    }
  }
}