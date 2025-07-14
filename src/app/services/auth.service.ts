import { Injectable } from '@angular/core';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private  currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuthListener();
  }

  private initializeAuthListener(): void {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        this.currentUserSubject.next(userData);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  }

  async signUp(email: string, password: string, displayName: string, garageId: string, role: UserRole): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userData: User = {
        uid: user.uid,
        email: user.email!,
        displayName,
        garageId,
        role,
        createdAt: new Date(),
        updatedAt: new Date()
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
        updatedAt: new Date()
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
}