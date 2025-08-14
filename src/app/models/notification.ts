export interface NotificationModel{
    id: string;
    title: string;
    message: string;
    createdAt: Date | any; // Pour supporter à la fois Date et Timestamp de Firebase
    read: boolean;
    quoteId?: string;
    garageId: string; // Garagiste
    emailDesitnateur?: string; // client
    type?: 'Devis' | 'Facture' | 'Paiement' | 'Intervation';
}