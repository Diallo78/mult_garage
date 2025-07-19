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


}