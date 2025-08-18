import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  QueryConstraint
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { db } from '../../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class GarageDataService {
  private readonly garageId: string | null = null;


  constructor() {
    // this.authService.currentUser$.subscribe(user => {
    //   this.garageId = user?.garageId || null;
    // });
    this.garageId = localStorage.getItem('garageId');
  }

  async create<T>(collectionName: string, data: Omit<T, 'id'>): Promise<string> {
    if (!this.garageId) throw new Error('No garage ID available');

    const docData = {
      ...data,
      garageId: this.garageId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, collectionName), docData);
    return docRef.id;
  }

  async update<T>(collectionName: string, id: string, updates: Partial<T>): Promise<void> {
    if (!this.garageId) throw new Error('No garage ID available');

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date()
    });
  }

  async delete(collectionName: string, id: string): Promise<void> {
    if (!this.garageId) throw new Error('No garage ID available');

    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  }

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    if (!this.garageId) throw new Error('No garage ID available');

    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  async getAll<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    if (!this.garageId) throw new Error('No garage ID available');

    const q = query(
      collection(db, collectionName),
      where('garageId', '==', this.garageId),

    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async getWithFilter<T>(
    collectionName: string,
    filters: { field: string; operator: any; value: any }[],
    orderByField: string = 'createdAt'
  ): Promise<T[]> {
    if (!this.garageId) throw new Error('No garage ID available');

    let q = query(
      collection(db, collectionName),
      where('garageId', '==', this.garageId)
    );

    // Apply additional filters
    filters.forEach(filter => {
      q = query(q, where(filter.field, filter.operator, filter.value));
    });

    q = query(q);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  async getPaginated<T>(
    collectionName: string,
    pageSize: number,
    lastDoc?: DocumentSnapshot,
    orderByField: string = 'createdAt'
  ): Promise<{ data: T[]; lastDoc: DocumentSnapshot | null }> {
    if (!this.garageId) throw new Error('No garage ID available');

    let q = query(
      collection(db, collectionName),
      where('garageId', '==', this.garageId),
      orderBy(orderByField, 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));

    const lastDocument = querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { data, lastDoc: lastDocument };
  }

  async search<T>(
    collectionName: string,
    searchField: string,
    searchTerm: string
  ): Promise<T[]> {
    if (!this.garageId) throw new Error('No garage ID available');

    const q = query(
      collection(db, collectionName),
      where('garageId', '==', this.garageId),
      where(searchField, '>=', searchTerm),
      where(searchField, '<=', searchTerm + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as T));
  }

  generateUniqueNumber(prefix: string): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }
}