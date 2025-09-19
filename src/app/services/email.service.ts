import { Injectable } from '@angular/core';
import { GarageDataService } from './garage-data.service';

export interface EmailTemplate {
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
}

export interface QuoteEmailData {
  clientName: string;
  quoteNumber: string;
  quoteId: string;
  total: number;
  validUntil: Date;
  items: any[];
}

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  constructor(private readonly garageDataService: GarageDataService) {}

  async sendQuoteEmail(emailData: QuoteEmailData): Promise<void> {
    try {
      const template = this.generateQuoteEmailTemplate(emailData);

      // Créer une notification email dans la base de données
      const emailNotification = {
        to: emailData.clientName,
        subject: template.subject,
        body: template.body,
        type: 'Quote',
        quoteId: emailData.quoteId,
        status: 'Pending',
        createdAt: new Date(),
      };

      await this.garageDataService.create('emailQueue', emailNotification);

      // Ici vous pouvez intégrer avec un service d'email comme SendGrid, Mailgun, etc.
      console.log("Email ajouté à la file d'attente:", template);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email:", error);
      throw error;
    }
  }

  private generateQuoteEmailTemplate(emailData: QuoteEmailData): EmailTemplate {
    const subject = `Votre devis N° ${emailData.quoteNumber} est prêt !`;

    const body = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Bonjour ${emailData.clientName},</h2>

            <p>Votre devis N° <strong>${
              emailData.quoteNumber
            }</strong> est prêt !</p>

            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">Détails du devis</h3>
              <p><strong>Numéro:</strong> ${emailData.quoteNumber}</p>
              <p><strong>Total:</strong> GNF ${emailData.total.toFixed(2)}</p>
              <p><strong>Valide jusqu'au:</strong> ${emailData.validUntil.toLocaleDateString(
                'fr-FR'
              )}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af;">Articles inclus:</h3>
              <ul>
                ${emailData.items
                  .map(
                    (item) =>
                      `<li><strong>${item.designation}</strong> - Quantité: ${
                        item.quantity
                      } - Prix: GNF ${(item.quantity * item.unitPrice).toFixed(
                        2
                      )}</li>`
                  )
                  .join('')}
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/client-portal/quotes/${
      emailData.quoteId
    }"
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Voir le devis complet
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              Merci de votre confiance !<br>
              L'équipe du garage
            </p>
          </div>
        </body>
      </html>
    `;

    return {
      to: emailData.clientName,
      subject,
      body,
    };
  }

  async sendWhatsAppMessage(
    phoneNumber: string,
    message: string
  ): Promise<void> {
    try {
      // Format du numéro pour WhatsApp
      const formattedPhone = this.formatPhoneForWhatsApp(phoneNumber);

      // Créer une notification WhatsApp
      const whatsappNotification = {
        phoneNumber: formattedPhone,
        message: message,
        type: 'WhatsApp',
        status: 'Pending',
        createdAt: new Date(),
      };

      await this.garageDataService.create(
        'whatsappQueue',
        whatsappNotification
      );

      // Ouvrir WhatsApp Web
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(
        message
      )}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      throw error;
    }
  }

  private formatPhoneForWhatsApp(phone: string): string {
    // Supprimer tous les espaces et caractères non numériques
    let cleanPhone = phone.replace(/\D/g, '');

    // Si le numéro commence par 0, le remplacer par l'indicatif du pays
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '224' + cleanPhone.substring(1); // 224 pour la Guinée
    }

    // Si le numéro ne commence pas par l'indicatif, l'ajouter
    if (!cleanPhone.startsWith('224')) {
      cleanPhone = '224' + cleanPhone;
    }

    return cleanPhone;
  }
}

