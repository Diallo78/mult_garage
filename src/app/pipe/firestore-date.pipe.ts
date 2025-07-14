import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'firestoreDate',
  standalone: true // Permet d'utiliser le pipe sans déclaration dans un module
})
export class FirestoreDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value.toDate) return value.toDate();
    return new Date(value);
  }
}

export class FirestoreDatePipeTS implements PipeTransform {
  transform(value: any): Date | string {
    if (!value) return '';
    let date: Date;
    // Firestore Timestamp object
    if (value.seconds !== undefined && value.nanoseconds !== undefined) {
      date = new Date(value.seconds * 1000);
    } else {
      date = new Date(value);
    }
    // Format to yyyy-MM-ddTHH:mm
    return date.toISOString().slice(0, 16);
  }
}