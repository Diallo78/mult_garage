import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Quote } from '../models/quote.model';
import { Invoice } from '../models/invoice.model';
import { Diagnostic } from '../models/diagnostic.model';
import autoTable, { RowInput } from 'jspdf-autotable';
import { FirestoreDatePipeTS } from '../pipe/firestore-date.pipe';
import { GarageDtoModel } from '../models/garage-dto.model';
import { GarageDtoFunction } from './fonction/garageDto-function';

@Injectable({
  providedIn: 'root',
})
export class PDFService {

  garageInfo: GarageDtoModel | null = null;

  // Diagnostic
  async generateDiagnosticReportPDF(
    diagnostic: Diagnostic,
    clientName: string,
    vehicleInfo: string
  ): Promise<void> {
    this.garageInfo = GarageDtoFunction.garageDto();
    if (this.garageInfo) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // --- LOGO ---
      if (this.garageInfo?.logo) {
        const logoBase64 = this.garageInfo.logo;
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      } else {
        const logoBase64 = await this.getBase64FromUrl('/image/logo3.jpg');
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      }

      // --- INFO ENTREPRISE ---
      doc.setFont('times', 'normal');
      doc.setFontSize(12);

      const companyInfo = [
        this.garageInfo.name,
        // `Adresse : ${this.garageInfo.address}`,
        `Téléphone : ${this.garageInfo.phone}`,
        `E-mail : ${this.garageInfo.email}`,
        `Agrément : N°${this.garageInfo.agrement || 'N/A'}`,
      ];

      let y = 15;
      companyInfo.forEach((line) => {
        doc.text(line, 15, y);
        y += 6;
      });

      // --- TITRE ---
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text('RAPPORT DE DIAGNOSTIC', pageWidth / 2, 50, { align: 'center' });

      // --- INFOS CLIENT / DIAGNOSTIC ---
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      y = 65;
      doc.text(
        `Date : ${new Date(diagnostic.createdAt).toLocaleDateString()}`,
        15,
        y
      );
      doc.text(`Client : ${clientName}`, 15, y + 6);
      doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 12);
      doc.text(`Titre : ${diagnostic.title}`, 15, y + 18);

      // --- TABLEAU DES CONTRÔLES ---
      autoTable(doc, {
        startY: y + 27,
        head: [['Catégorie', 'Description', 'Conformité', 'Gravité']],
        body: diagnostic.checks.map((check) => [
          check.category,
          check.description,
          {
            content: check.compliant ? 'Conforme' : 'Non-conforme',
            styles: {
              textColor: check.compliant ? [0, 128, 0] : [255, 0, 0],
            },
          },
          {
            content: check.severityLevel,
            styles: {
              fontStyle: 'bold',
              textColor:
                check.severityLevel === 'Critical'
                  ? [255, 0, 0]
                  : check.severityLevel === 'Low'
                    ? [255, 165, 0]
                    : [0, 0, 255],
            },
          },
        ]),
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 6,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' },
          1: { cellWidth: 'auto', halign: 'left' },
          2: { cellWidth: 'auto', halign: 'center' },
          3: { cellWidth: 'auto', halign: 'center' },
        },
      });

      // --- RÉSUMÉ ---
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(13);
      doc.setFont('times', 'bold');
      doc.text('Résumé du diagnostic :', 15, finalY);
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(
        doc.splitTextToSize(diagnostic.summary, pageWidth - 30),
        15,
        finalY + 6
      );

      // --- DÉCISION FINALE ---
      const decisionY = finalY + 30;
      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.text('Décision finale :', 15, decisionY);
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      doc.text(diagnostic.finalDecision, 15, decisionY + 6);

      // --- PIED DE PAGE ---
      const footerY = pageHeight - 25;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100);
      doc.text(
        `Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(0);
      doc.text(
        `${this.garageInfo.name} - Capital social : ${this.formatAmount(this.garageInfo.capitalSocial || 0)}  - RC : ${this.garageInfo.rc || this.garageInfo.siret}`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
      doc.text(
        'Siège social : ' + this.garageInfo.address,
        pageWidth / 2,
        footerY + 10,
        { align: 'center' }
      );
      doc.text(
        `Tél : ${this.garageInfo.phone} - Email : ${this.garageInfo.email}`,
        pageWidth / 2,
        footerY + 15,
        { align: 'center' }
      );
      doc.text(
        `Site web : ${this.garageInfo.website} - SIRET : ${this.garageInfo.siret || 'N/A'}`,
        pageWidth / 2,
        footerY + 20,
        { align: 'center' }
      );

      doc.save(`rapport-diagnostic-${diagnostic.id}.pdf`);
    }
  }

  // Devis
  async generateQuotePDF(
    quote: Quote,
    clientName: string,
    vehicleInfo: string
  ): Promise<void> {
    this.garageInfo = GarageDtoFunction.garageDto();
    if (this.garageInfo) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- LOGO ---
      if (this.garageInfo.logo) {
        const logoBase64 = this.garageInfo.logo;
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      }
      else {
        const logoBase64 = await this.getBase64FromUrl('/image/logo3.jpg');
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      }
      // --- ENTREPRISE ---
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const companyInfo = [
        this.garageInfo.name,
        `Adresse : ${this.garageInfo.address}`,
        `Téléphone : ${this.garageInfo.phone}`,
        `Email : ${this.garageInfo.email}`,
        `Agrément : N°${this.garageInfo.agrement || 'N/A'}`,
      ];
      let y = 15;
      companyInfo.forEach((line) => {
        doc.text(line, 15, y);
        y += 6;
      });

      // --- TITRE ---
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text('DEVIS', pageWidth / 2, 50, { align: 'center' });
      const pipeDate = new FirestoreDatePipeTS();

      // --- INFOS CLIENT ---
      doc.setFontSize(12);
      doc.setFont('times', 'normal');
      y = 65;
      doc.text(`Devis N° : ${quote.quoteNumber}`, 15, y);
      doc.text(
        `Date : ${new Date(quote.createdAt).toLocaleDateString()}`,
        15,
        y + 6
      );
      doc.text(
        `Valide jusqu'au : ${pipeDate.transform(quote.validUntil)}`,
        15,
        y + 12
      );
      doc.text(`Client : ${clientName}`, 15, y + 18);
      doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 24);
      doc.text(`Kilométrage : ${quote.kilometrage} km/h`, 15, y + 30);

      // --- TABLEAU ITEMS ---
      autoTable(doc, {
        startY: y + 35,
        head: [['Désignation', 'Quantité', `Prix unitaire (${this.garageInfo.currency}), Total (${this.garageInfo.currency})`]],
        body: quote.items.map((item) => [
          item.designation,
          item.quantity.toString(),
          {
            content: this.formatAmount(item.unitPrice),
            styles: { halign: 'right' },
          },
          {
            content: this.formatAmount(item.subtotal),
            styles: {
              halign: 'right',
              fontStyle: 'bold',
            },
          },
        ]),
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 6,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' },
          1: { cellWidth: 'auto', halign: 'center' },
          2: { cellWidth: 'auto', halign: 'right' },
          3: { cellWidth: 'auto', halign: 'right' },
        },
      });

      // --- TOTAUX ---
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      doc.text(`Sous-total : ${this.formatAmount(quote.subtotal)}`, 140, finalY);
      doc.text(
        `TVA (${quote.vatRate}%) : ${this.formatAmount(quote.vatAmount)}`,
        140,
        finalY + 6
      );

      doc.setFont('times', 'bold');
      doc.setFontSize(13);
      doc.text(
        `Total à payer : ${this.formatAmount(quote.total)}`,
        140,
        finalY + 14
      );

      /// --- PIED DE PAGE ---
      // Calcul des positions
      const footerYY = doc.internal.pageSize.getHeight() - 20;
      const signaturesY = footerYY - 60;

      // Section signatures
      doc.setFontSize(10);
      doc.setTextColor(0);


      doc.text(`Signature ${this.garageInfo.name} :`, pageWidth - 70, signaturesY);

      // Ajouter l'image de la signature (juste en dessous du texte)
      const signatureBase64 = this.garageInfo.signature || await this.getBase64FromUrl('/image/signature.png');
      doc.addImage(
        signatureBase64,
        'PNG',
        pageWidth - 65, // defult 70
        signaturesY + 5,
        45, // defult 40
        22 // deful 20
      );

      // Pied de page remonté
      const footerY = doc.internal.pageSize.getHeight() - 25;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100);
      doc.text(
        `Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(0);
      doc.text(
        `${this.garageInfo.name} - Capital social : ${this.formatAmount(this.garageInfo.capitalSocial || 0)}  - RC : ${this.garageInfo.rc || this.garageInfo.siret}`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
      doc.text(
        'Siège social : ' + this.garageInfo.address,
        pageWidth / 2,
        footerY + 10,
        { align: 'center' }
      );
      doc.text(
        `Tél : ${this.garageInfo.phone} - Email : ${this.garageInfo.email}`,
        pageWidth / 2,
        footerY + 15,
        { align: 'center' }
      );
      doc.text(
        `Site web : ${this.garageInfo.website} - SIRET : ${this.garageInfo.siret || 'N/A'}`,
        pageWidth / 2,
        footerY + 20,
        { align: 'center' }
      );
      doc.save(`devis-${quote.quoteNumber}.pdf`);
    }
  }

  // Facture
  async generateInvoicePDF(
    invoice: Invoice,
    clientName: string,
    vehicleInfo: string
  ): Promise<void> {
    this.garageInfo = GarageDtoFunction.garageDto();
    if (this.garageInfo) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // --- LOGO ---
      if (this.garageInfo.logo) {
        const logoBase64 = this.garageInfo.logo;
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      }
      else {
        const logoBase64 = await this.getBase64FromUrl('/image/logo3.jpg');
        doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);
      }

      // --- ENTREPRISE INFO ---
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      const entrepriseInfo = [
        this.garageInfo.name,
        `Adresse : ${this.garageInfo.address}`,
        `Téléphone : ${this.garageInfo.phone}`,
        `Email : ${this.garageInfo.email}`,
        `Agrément : N°${this.garageInfo.agrement || 'N/A'}`,
      ];
      let y = 15;
      entrepriseInfo.forEach((line) => {
        doc.text(line, 15, y);
        y += 6;
      });

      // --- TITRE ---
      doc.setFontSize(18);
      doc.setFont('times', 'bold');
      doc.text('FACTURE', pageWidth / 2, 50, { align: 'center' });

      // --- INFOS FACTURE ---
      doc.setFontSize(12);
      y = 65;
      doc.setFont('times', 'normal');
      doc.text(`N° Facture : ${invoice.invoiceNumber}`, 15, y);
      doc.text(
        `Date : ${new Date(invoice.createdAt).toLocaleDateString()}`,
        15,
        y + 6
      );
      doc.text(
        `Échéance : ${new Date(invoice.dueDate).toLocaleDateString()}`,
        15,
        y + 12
      );

      // --- INFOS CLIENT ---
      y += 24;
      doc.text(`Client : ${clientName}`, 15, y);
      doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 6);

      // --- TABLEAU DES ARTICLES ---
      const tableData: RowInput[] = invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: {
          content: this.formatAmount(item.unitPrice),
          styles: { halign: 'right' as const },
        },
        total: {
          content: this.formatAmount(item.subtotal),
          styles: {
            halign: 'right' as const,
            fontStyle: 'bold' as const,
          },
        },
      }));

      const columns = [
        { header: 'Description', dataKey: 'description' },
        { header: 'Quantité', dataKey: 'quantity' },
        { header: 'Prix unitaire', dataKey: 'unitPrice' },
        { header: 'Total', dataKey: 'total' },
      ];

      autoTable(doc, {
        startY: y + 20,
        columns: columns,
        body: tableData,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          cellPadding: 4,
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [22, 160, 133],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          cellPadding: 6,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 'auto', halign: 'left' },
          1: { cellWidth: 'auto', halign: 'center' },
          2: { cellWidth: 'auto', halign: 'right' },
          3: { cellWidth: 'auto', halign: 'right' },
        },
      });

      // --- TOTAUX ---
      let finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(
        `Sous-total : ${this.formatAmount(invoice.subtotal)}`,
        140,
        finalY
      );
      if (invoice.discountAmount > 0) {
        finalY += 6;
        doc.text(
          `Remise : -${this.formatAmount(invoice.discountAmount)}`,
          140,
          finalY
        );
      }
      finalY += 6;
      doc.text(
        `Montant TVA : ${this.formatAmount(invoice.vatAmount)}`,
        140,
        finalY
      );
      finalY += 6;
      doc.setFont('times', 'bold');
      doc.text(
        `Total TTC : ${this.formatAmount(invoice.totalAmount)}`,
        140,
        finalY
      );
      finalY += 6;
      doc.text(
        `Montant dû : ${this.formatAmount(invoice.amountDue)}`,
        140,
        finalY
      );

      // --- PIED DE PAGE ---
      // Calcul des positions
      const footerYY = doc.internal.pageSize.getHeight() - 15;
      const signaturesY = footerYY - 60;

      // Section signatures
      doc.setFontSize(10);
      doc.setTextColor(0);

      // Signature client (gauche)
      doc.text('Signature client :', 20, signaturesY);
      // Signature garage (droite)
      doc.text(`Signature ${this.garageInfo.name} :`, pageWidth - 70, signaturesY);
      // Ajouter l'image de la signature (juste en dessous du texte)
      const signatureBase64 = this.garageInfo.signature || await this.getBase64FromUrl('/image/signature.png');
      doc.addImage(
        signatureBase64,
        'PNG',
        pageWidth - 65, // defult 70
        signaturesY + 5,
        45, // defult 40
        22 // deful 20
      );
      // Pied de page remonté
      const footerY = doc.internal.pageSize.getHeight() - 25;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100);
      doc.text(
        `Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(0);
      doc.text(
        `${this.garageInfo.name} - Capital social : ${this.formatAmount(this.garageInfo.capitalSocial || 0)}  - RC : ${this.garageInfo.rc || this.garageInfo.siret}`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
      doc.text(
        'Siège social : ' + this.garageInfo.address,
        pageWidth / 2,
        footerY + 10,
        { align: 'center' }
      );
      doc.text(
        `Tél : ${this.garageInfo.phone} - Email : ${this.garageInfo.email}`,
        pageWidth / 2,
        footerY + 15,
        { align: 'center' }
      );
      doc.text(
        `Site web : ${this.garageInfo.website} - SIRET : ${this.garageInfo.siret || 'N/A'}`,
        pageWidth / 2,
        footerY + 20,
        { align: 'center' }
      );

      doc.save(`facture-${invoice.invoiceNumber}.pdf`);
    }
  }

  // Reçu de paiement
  async generatePaymentReceiptPDF(
    payment: any,
    invoiceNumber: string,
    clientName: string
  ): Promise<void> {
    this.garageInfo = GarageDtoFunction.garageDto();
    if (this.garageInfo) {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();

      // ✅ Logo à droite
      if (this.garageInfo.logo) {

        const logoBase64 = this.garageInfo.logo || await this.getBase64FromUrl('/image/logo3.jpg');;
        const logoWidth = 35;
        const logoHeight = 20;

        doc.addImage(
          logoBase64,
          'PNG',
          pageWidth - logoWidth - 20,
          10,
          logoWidth,
          logoHeight
        );
      }

      // ✅ Coordonnées entreprise
      doc.setFont('times', 'normal');
      doc.setFontSize(11);
      const companyInfo = [
        this.garageInfo.name,
        `Adresse : ${this.garageInfo.address}`,
        `Téléphone : ${this.garageInfo.phone}`,
        `Email : ${this.garageInfo.email}`,
        `Agrément : N°${this.garageInfo.agrement || 'N/A'}`,
      ];
      let y = 15;
      companyInfo.forEach((line) => {
        doc.text(line, 20, y);
        y += 6;
      });

      // ✅ Titre centré
      doc.setFontSize(16);
      doc.setFont('times', 'bold');
      doc.text('REÇU DE PAIEMENT', pageWidth / 2, y + 10, { align: 'center' });

      // ✅ Infos de base
      doc.setFontSize(11);
      doc.setFont('times', 'normal');
      const date =
        payment.date instanceof Date
          ? payment.date
          : new Date(payment.date?.seconds * 1000 || payment.date);
      const formattedDate = date.toLocaleDateString('fr-FR');

      doc.text(`Reçu N° : ${payment.id}`, 20, y + 25);
      doc.text(`Date : ${formattedDate}`, pageWidth - 60, y + 25);

      // ✅ Détails du paiement
      const rowStartY = y + 35;
      const rowHeight = 10;
      const col1X = 20;
      const col2X = 70;

      const formattedAmount =
        new Intl.NumberFormat('en-US').format(payment.amount) + ' GNF';

      const tableRows: [string, string][] = [
        ['Client', clientName],
        ['Facture n°', invoiceNumber],
        ['Méthode de paiement', payment.method],
        ['Montant payé', formattedAmount],
        payment.reference ? ['Référence', payment.reference] : null,
        payment.notes ? ['Notes', payment.notes] : null,
      ].filter(Boolean) as [string, string][];

      tableRows.forEach(([label, value], i) => {
        const yPos = rowStartY + i * rowHeight;
        doc.text(`${label} :`, col1X, yPos);
        doc.text(value, col2X, yPos);
        doc.setDrawColor(220);
        doc.line(col1X, yPos + 2, pageWidth - 20, yPos + 2);
      });

      // ✅ Montant en lettres
      const textY = rowStartY + tableRows.length * rowHeight + 15;
      const montantEnLettres =
        this.nombreEnLettres(payment.amount) + ' francs guinéens';

      doc.setFont('times', 'italic');
      doc.text(`Montant en lettres : ${montantEnLettres}`, 20, textY, {
        maxWidth: pageWidth - 40,
      });

      // ✅ Signatures
      const signY = textY + 25;
      doc.setFont('times', 'normal');

      doc.text('Signature autorisée', pageWidth - 60, signY + 10);
      doc.line(pageWidth - 80, signY + 15, pageWidth - 20, signY + 15);

      // ✅ Pied de page
      const footerY = doc.internal.pageSize.getHeight() - 25;
      doc.setFontSize(8);
      doc.setFont('times', 'italic');
      doc.setTextColor(100);
      doc.text(
        `Document généré le ${new Date().toLocaleDateString()} à ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      doc.setFontSize(9);
      doc.setFont('times', 'normal');
      doc.setTextColor(0);
      doc.text(
        `${this.garageInfo.name} - Capital social : ${this.formatAmount(this.garageInfo.capitalSocial || 0)}  - RC : ${this.garageInfo.rc || this.garageInfo.siret}`,
        pageWidth / 2,
        footerY + 5,
        { align: 'center' }
      );
      doc.text(
        'Siège social : ' + this.garageInfo.address,
        pageWidth / 2,
        footerY + 10,
        { align: 'center' }
      );
      doc.text(
        `Tél : ${this.garageInfo.phone} - Email : ${this.garageInfo.email}`,
        pageWidth / 2,
        footerY + 15,
        { align: 'center' }
      );
      doc.text(
        `Site web : ${this.garageInfo.website} - SIRET : ${this.garageInfo.siret || 'N/A'}`,
        pageWidth / 2,
        footerY + 20,
        { align: 'center' }
      );

      doc.save(`recu-${payment.id}.pdf`);
    }
  }

  // Fonction utilitaire pour charger une image en base64
  getBase64FromUrl(url: string): Promise<string> {
    return fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );
  }

  private nombreEnLettres(nombre: number): string {
    if (nombre === 0) return 'zéro';

    const unites = [
      '',
      'un',
      'deux',
      'trois',
      'quatre',
      'cinq',
      'six',
      'sept',
      'huit',
      'neuf',
    ];
    const dizaines = [
      '',
      'dix',
      'vingt',
      'trente',
      'quarante',
      'cinquante',
      'soixante',
    ];
    const teens = [
      'dix',
      'onze',
      'douze',
      'treize',
      'quatorze',
      'quinze',
      'seize',
      'dix-sept',
      'dix-huit',
      'dix-neuf',
    ];

    const convertMoinsDeCent = (n: number): string => {
      if (n < 10) return unites[n];
      if (n < 20) return teens[n - 10];
      if (n < 70) {
        const dizaine = Math.floor(n / 10);
        const unite = n % 10;
        return (
          dizaines[dizaine] +
          (unite === 1 ? ' et un' : unite > 0 ? '-' + unites[unite] : '')
        );
      }
      if (n < 80) {
        return (
          'soixante' +
          (n === 71 ? ' et onze' : '-' + convertMoinsDeCent(n - 60))
        );
      }
      if (n < 100) {
        return (
          'quatre-vingt' +
          (n === 80
            ? 's'
            : n % 10 === 1
              ? '-un'
              : '-' + convertMoinsDeCent(n - 80))
        );
      }
      return '';
    };

    const convertMoinsDeMille = (n: number): string => {
      const centaine = Math.floor(n / 100);
      const reste = n % 100;
      let result = '';

      if (centaine > 0) {
        result += centaine === 1 ? 'cent' : unites[centaine] + ' cent';
        if (reste === 0 && centaine > 1) result += 's';
        if (reste > 0) result += ' ';
      }

      if (reste > 0) {
        result += convertMoinsDeCent(reste);
      }

      return result.trim();
    };

    let result = '';
    const million = Math.floor(nombre / 1_000_000);
    const mille = Math.floor((nombre % 1_000_000) / 1000);
    const reste = nombre % 1000;

    if (million > 0) {
      result +=
        (million === 1
          ? 'un million'
          : this.nombreEnLettres(million) + ' millions') + ' ';
    }

    if (mille > 0) {
      result +=
        (mille === 1 ? 'mille' : this.nombreEnLettres(mille) + ' mille') + ' ';
    }

    if (reste > 0) {
      result += convertMoinsDeMille(reste);
    }

    return result.trim();
  }

  private formatAmount(amount: number): string {
    this.garageInfo = GarageDtoFunction.garageDto();
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.garageInfo?.currency || 'GNF',
      minimumFractionDigits: 2
    }).format(amount);
    //return new Intl.NumberFormat('en-US').format(amount) + ' ' + (this.garageInfo?.currency || 'GNF');
  }
}
