export interface NotificationModel{
    id: string;
    title: string;
    message: string;
    createdAt: Date;
    read: boolean;
    quoteId: string;
    garageId: string; // Garagiste
    emailDesitnateur?: string; // clien
}