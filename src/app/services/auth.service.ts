import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updatePassword
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../models/user.model';
import { auth, db } from '../../../firebase.config';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly router: Router) {
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        if (userData?.garageId) {
          localStorage.setItem('garageId', userData.garageId);
        }
        this.currentUserSubject.next(userData);
      } else {
        localStorage.removeItem('garageId');
        this.currentUserSubject.next(null);
      }
    });
  }

  async signInv1(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await this.getUserData(userCredential.user.uid);

      if (userData?.garageId) {
        localStorage.setItem('garageId', userData.garageId);
      }

      this.currentUserSubject.next(userData);
    } catch (error: any) {
      let errorMessage = 'Une erreur est survenue lors de la connexion';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "L'adresse email est invalide";
          break;
        case 'auth/user-disabled':
          errorMessage = 'Ce compte utilisateur a été désactivé';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Aucun compte ne correspond à cet email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mot de passe incorrect';
          break;
        case 'auth/too-many-requests':
          errorMessage =
            'Trop de tentatives de connexion. Veuillez réessayer plus tard';
          break;
        case 'auth/network-request-failed':
          errorMessage =
            'Erreur de connexion réseau. Vérifiez votre connexion internet';
          break;
      }

      throw new Error(errorMessage);
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userData = await this.getUserData(userCredential.user.uid);

      if (userData?.garageId) {
        localStorage.setItem('garageId', userData.garageId);
      }

      this.currentUserSubject.next(userData);
    } catch (error: any) {
      // Ne pas gérer les messages ici, juste transmettre l'erreur
      throw error;
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    garageId: string,
    role: UserRole
  ): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName,
        garageId,
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
      this.currentUserSubject.next(userData);
    } catch (error) {
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
      this.currentUserSubject.next(null);

      localStorage.removeItem('garageId');

      this.router.navigate(['/login']);
    } catch (error) {
      throw error;
    }
  }

  private async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) throw new Error('No user logged in');

    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: new Date(),
      });

      this.currentUserSubject.next({ ...currentUser, ...updates });
    } catch (error) {
      throw error;
    }
  }

  hasRole(role: UserRole): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const user = this.currentUserSubject.value;
    return user ? roles.includes(user.role) : false;
  }

  public getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // UPD
  async updateUserPassword(newPassword: string): Promise<void> {
    const _user = auth.currentUser;

    if (!_user) {
      throw new Error('Utilisateur non connecté');
    }

    try {
      // 2. Mise à jour du mot de passe dans Firebase Auth
      await updatePassword(_user, newPassword);

      // 3. Mise à jour de la date dans Firestore (/users/:uid)
      const userRef = doc(db, 'users', _user.uid);
      await updateDoc(userRef, {
        updatedAt: new Date(),
      });

      console.log('✅ Mot de passe et données utilisateur mis à jour');
    } catch (error: any) {
      let message = 'Erreur lors de la mise à jour du mot de passe ' + error;

      switch (error.code) {
        case 'auth/wrong-password':
          message = 'Mot de passe actuel incorrect';
          break;
        case 'auth/weak-password':
          message = 'Le nouveau mot de passe est trop faible';
          break;
        case 'auth/requires-recent-login':
          message =
            'Veuillez vous reconnecter pour modifier votre mot de passe';
          break;
      }

      throw new Error(message);
    }
  }

  public get canAccessDiagnostics(): boolean {
    return this.hasAnyRole(['AdminGarage', 'Technician', 'SuperAdmin']);
  }

  public get canAccessInterventions(): boolean {
    return this.hasAnyRole(['AdminGarage', 'Technician', 'SuperAdmin']);
  }

  public get canAccessPayments(): boolean {
    return this.hasAnyRole([
      'AdminGarage',
      'Accountant',
      'Receptionist',
      'SuperAdmin',
    ]);
  }

  public get canAccessReports(): boolean {
    return this.hasAnyRole(['AdminGarage', 'Accountant', 'SuperAdmin']);
  }

  public get canAccessPersonnel(): boolean {
    return this.hasAnyRole(['AdminGarage', 'Manager', 'SuperAdmin']);
  }

  public get canAccessSuperAdmin(): boolean {
    return this.hasAnyRole(['SuperAdmin']);
  }

  public get isClient(): boolean {
    return this.hasRole('Client');
  }

  public get canBtnAccessInterventions(): boolean {
    return this.hasAnyRole([
      'AdminGarage',
      'Technician',
      'SuperAdmin',
      'Manager',
      'Receptionist',
    ]);
  }

  public get canAccessBtnDelete(): boolean {
    return this.hasAnyRole(['SuperAdmin', 'AdminGarage', 'Manager']);
  }

  public get canAccessBtnEdit(): boolean {
    return this.hasAnyRole([
      'SuperAdmin',
      'AdminGarage',
      'Manager',
      'Receptionist',
    ]);
  }

  public get canBtnAccessInov(): boolean {
    return this.hasAnyRole([
      'AdminGarage',
      'SuperAdmin',
      'Manager',
      'Accountant',
    ]);
  }

  public get canccessDashboard(): boolean {
    return this.hasAnyRole([
      'AdminGarage',
      'Accountant',
      'SuperAdmin',
      'Manager',
      'Receptionist',
    ]);
  }
}