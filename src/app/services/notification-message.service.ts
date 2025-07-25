import { Injectable } from '@angular/core';
import { collection, query, where, orderBy, limit, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { NotificationModel } from '../models/notification';


@Injectable({ providedIn: 'root' })
export class NotificationMessageService {

    async getLatestNotifications(count: number = 5): Promise<NotificationModel[]> {
        const _garageId = localStorage.getItem('garageId');
        if(!_garageId){throw new Error('No garage ID available');}
        const q = query(
        collection(db, 'notifications'),
        where('garageId', '==', _garageId),
        orderBy('createdAt', 'desc'),
        limit(count)
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        })) as NotificationModel[];
    }

    async getAllLatestNotificationsv1(emailClient: string, garageId: string, count = 100): Promise<NotificationModel[]> {
    const conditions = [where('garageId', '==', garageId)];
    if (emailClient) conditions.push(where('emailDesitnateur', '==', emailClient));

    const q = query(
        collection(db, 'notifications'),
        ...conditions,
        orderBy('createdAt', 'desc'),
        limit(count)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as NotificationModel[];
    }

    async getAllLatestNotifications(userEmail: string, garageId: string, role: 'Client' | 'Garage', count = 100): Promise<NotificationModel[]> {
    let q;

    if (role === 'Client') {
        q = query(
        collection(db, 'notifications'),
        where('emailDesitnateur', '==', userEmail),
        orderBy('createdAt', 'desc'),
        limit(count)
        );
    } else {
        q = query(
        collection(db, 'notifications'),
        where('garageId', '==', garageId),
        where('emailDesitnateur', '==', null), // notification destinée au garage
        orderBy('createdAt', 'desc'),
        limit(count)
        );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as NotificationModel[];
    }



  async markAllAsRead(notifications: NotificationModel[]): Promise<void> {
    const updates = notifications.map(n =>
      updateDoc(doc(db, 'notifications', n.id), { read: true })
    );
    await Promise.all(updates);
  }

  async markAsRead(notificationId: string): Promise<void> {
    const notifRef = doc(db, 'notifications', notificationId);
    await updateDoc(notifRef, { read: true });
  }
}
