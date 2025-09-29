export class DateFonction{

    static formatFirebaseDate(timestamp: any): string {
        const date = timestamp?.toDate?.() ?? new Date(timestamp);
        return date.toLocaleDateString('fr-FR');
    }

    static formatFirebaseDateToFrenchLong(timestamp: any): string {
        console.log('dans la fonction ' + timestamp);

        try {
            const date: Date = timestamp?.toDate?.() instanceof Function
            ? timestamp.toDate()
            : new Date(timestamp);

            if (isNaN(date.getTime())) throw new Error('Invalid Date');

            return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
            });
        } catch (error) {
            console.warn('Erreur de format de date :', error);
            return 'Date invalide';
        }
    }


    // Utilitaire générique
    static sortByCreatedAtDesc<T extends { createdAt: any }>(array: T[]): T[] {
        return array.sort((a, b) => {
            const dateA = this.normalizeDate(a.createdAt);
            const dateB = this.normalizeDate(b.createdAt);
            return dateB - dateA; // tri décroissant
        });
    }

    static normalizeDate(date: any): number {
        if (!date) return 0;

        // Si c'est un Firestore Timestamp
        if (typeof date.toDate === 'function') {
            return date.toDate().getTime();
        }

        // Si c'est une vraie Date
        if (date instanceof Date) {
            return date.getTime();
        }

        // Si c'est une string
        if (typeof date === 'string') {
            return new Date(date).getTime();
        }

        return 0; // fallback
    }



}