import { Injectable } from '@angular/core';
import {
    Firestore,
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
    QueryConstraint
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class FirestoreService {
    constructor(private readonly firestore: Firestore) { }

    // Méthodes génériques CRUD
    async create<T>(collectionName: string, data: T): Promise<string> {
        const collectionRef = collection(this.firestore, collectionName);
        const docRef = await addDoc(collectionRef, {
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        return docRef.id;
    }

    async getById<T>(collectionName: string, id: string): Promise<T | null> {
        const docRef = doc(this.firestore, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    }

    async getAll<T>(collectionName: string, constraints: QueryConstraint[] = []): Promise<T[]> {
        const collectionRef = collection(this.firestore, collectionName);
        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    }

    async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
        const docRef = doc(this.firestore, collectionName, id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: new Date()
        });
    }

    async delete(collectionName: string, id: string): Promise<void> {
        const docRef = doc(this.firestore, collectionName, id);
        await deleteDoc(docRef);
    }

    // Méthodes de requête avancées
    async getWhere<T>(
        collectionName: string,
        field: string,
        operator: any,
        value: any
    ): Promise<T[]> {
        const collectionRef = collection(this.firestore, collectionName);
        const q = query(collectionRef, where(field, operator, value));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    }

    async getOrderBy<T>(
        collectionName: string,
        field: string,
        direction: 'asc' | 'desc' = 'desc'
    ): Promise<T[]> {
        const collectionRef = collection(this.firestore, collectionName);
        const q = query(collectionRef, orderBy(field, direction));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    }
}