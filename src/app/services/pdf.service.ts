import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Quote } from '../models/quote.model';
import { Invoice } from '../models/invoice.model';
import { Diagnostic } from '../models/diagnostic.model';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  async generateDiagnosticReportPDF(
    diagnostic: Diagnostic,
    clientName: string,
    vehicleInfo: string
  ): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- LOGO ---
    const logoBase64 = await this.getBase64FromUrl('/image/logo1.png');
    doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);

    // --- INFO ENTREPRISE ---
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    const companyInfo = [
      "Garage AutoPro",
      "Adresse : Quartier XYZ, Conakry",
      "Téléphone : +224 620 00 00 00",
      "Email : contact@autopro.gn"
    ];
    let y = 15;
    companyInfo.forEach(line => {
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
    doc.text(`Date : ${new Date(diagnostic.createdAt).toLocaleDateString()}`, 15, y);
    doc.text(`Client : ${clientName}`, 15, y + 6);
    doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 12);
    // doc.text(`Catégorie : ${diagnostic.checks.at(0)?.category}`, 15, y + 18);
    doc.text(`Titre : ${diagnostic.title}`, 15, y + 18);

    // --- TABLEAU DES CONTRÔLES ---
    autoTable(doc, {
      startY: y + 27,
      head: [['Categorie', 'Description', 'Conformité', 'Gravité']],
      body: diagnostic.checks.map(check => [
        check.category,
        check.description,
        check.compliant ? 'Conforme' : 'Non-conforme',
        check.severityLevel,
      ]),
      styles: {
        font: 'times',
        fontSize: 10
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: 'center'
      },
      bodyStyles: {
        valign: 'top'
      }
    });

    // --- RÉSUMÉ ---
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text('Résumé du diagnostic :', 15, finalY);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text(doc.splitTextToSize(diagnostic.summary, pageWidth - 30), 15, finalY + 6);

    // --- DÉCISION FINALE ---
    const decisionY = finalY + 30;
    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text('Décision finale :', 15, decisionY);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.text(diagnostic.finalDecision, 15, decisionY + 6);

    doc.save(`rapport-diagnostic-${diagnostic.id}.pdf`);
  }

  async generateQuotePDFv1(quote: Quote, clientName: string, vehicleInfo: string): Promise<void> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('QUOTE', 20, 20);

    doc.setFontSize(12);
    doc.text(`Quote #: ${quote.quoteNumber}`, 20, 35);
    doc.text(`Date: ${quote.createdAt.toLocaleDateString()}`, 20, 45);
    doc.text(`Valid Until: ${quote.validUntil.toLocaleDateString()}`, 20, 55);

    // Client Info
    doc.text(`Client: ${clientName}`, 20, 75);
    doc.text(`Vehicle: ${vehicleInfo}`, 20, 85);

    // Items table
    let yPosition = 105;
    doc.text('Description', 20, yPosition);
    doc.text('Qty', 120, yPosition);
    doc.text('Unit Price', 140, yPosition);
    doc.text('Total', 170, yPosition);

    yPosition += 10;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    quote.items.forEach(item => {
      doc.text(item.designation, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 140, yPosition);
      doc.text(`$${item.subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });

    // Totals
    yPosition += 10;
    doc.text(`Subtotal: $${quote.subtotal.toFixed(2)}`, 140, yPosition);
    yPosition += 8;
    doc.text(`VAT (${quote.vatRate}%): $${quote.vatAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 8;
    doc.setFontSize(14);
    doc.text(`Total: $${quote.total.toFixed(2)}`, 140, yPosition);

    doc.save(`quote-${quote.quoteNumber}.pdf`);
  }


  async generateQuotePDF(quote: Quote, clientName: string, vehicleInfo: string): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- LOGO ---
    const logoBase64 = await this.getBase64FromUrl('/image/logo1.png');
    doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);

    // --- ENTREPRISE ---
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    const companyInfo = [
      'Garage AutoPro',
      'Adresse : Quartier XYZ, Conakry',
      'Tél : +224 620 00 00 00',
      'Email : contact@autopro.gn'
    ];
    let y = 15;
    companyInfo.forEach(line => {
      doc.text(line, 15, y);
      y += 6;
    });

    // --- TITRE ---
    doc.setFont('times', 'bold');
    doc.setFontSize(18);
    doc.text('DEVIS', pageWidth / 2, 50, { align: 'center' });

    // --- INFOS CLIENT ---
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    y = 65;
    doc.text(`Devis N° : ${quote.quoteNumber}`, 15, y);
    doc.text(`Date : ${new Date(quote.createdAt).toLocaleDateString()}`, 15, y + 6);
    doc.text(`Valide jusqu'au : ${new Date(quote.validUntil).toLocaleDateString()}`, 15, y + 12);
    doc.text(`Client : ${clientName}`, 15, y + 18);
    doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 24);

    // --- TABLEAU ITEMS ---
    autoTable(doc, {
      startY: y + 35,
      head: [['Désignation', 'Quantité', 'Prix unitaire (GNF)', 'Total (GNF)']],
      body: quote.items.map(item => [
        item.designation,
        item.quantity.toString(),
        this.formatAmount(item.unitPrice),
        this.formatAmount(item.subtotal)
      ]),
      styles: {
        font: 'Cambria, Georgia',
        fontSize: 10
      },
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255
      },
      bodyStyles: {
        valign: 'top'
      }
    });

    // --- TOTAUX ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    doc.text(`Sous-total : ${this.formatAmount(quote.subtotal)}`, 140, finalY);
    doc.text(`TVA (${quote.vatRate}%) : ${this.formatAmount(quote.vatAmount)}`, 140, finalY + 6);

    doc.setFont('times', 'bold');
    doc.setFontSize(13);
    doc.text(`Total à payer : ${this.formatAmount(quote.total)}`, 140, finalY + 14);

    doc.save(`devis-${quote.quoteNumber}.pdf`);
  }

  async generateInvoicePDF(invoice: Invoice, clientName: string, vehicleInfo: string): Promise<void> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- LOGO ---
    const logoBase64 = await this.getBase64FromUrl('/image/logo.png'); // Assure-toi que cette fonction existe
    doc.addImage(logoBase64, 'PNG', pageWidth - 50, 10, 40, 20);

    // --- ENTREPRISE INFO ---
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    const entrepriseInfo = [
      "Garage AutoPro",
      "Adresse : Quartier XYZ, Conakry",
      "Téléphone : +224 620 00 00 00",
      "Email : contact@autopro.gn"
    ];
    let y = 15;
    entrepriseInfo.forEach(line => {
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
    doc.text(`Date : ${new Date(invoice.createdAt).toLocaleDateString()}`, 15, y + 6);
    doc.text(`Échéance : ${new Date(invoice.dueDate).toLocaleDateString()}`, 15, y + 12);

    // --- INFOS CLIENT ---
    y += 24;
    doc.text(`Client : ${clientName}`, 15, y);
    doc.text(`Véhicule : ${vehicleInfo}`, 15, y + 6);

    // --- TABLEAU DES ARTICLES ---
    const tableData = invoice.items.map(item => ([
      item.description,
      item.quantity,
      this.formatAmount(item.unitPrice),
      this.formatAmount(item.subtotal)
    ]));

    autoTable(doc, {
      startY: y + 20,
      head: [['Description', 'Quantité', 'Prix unitaire', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [22, 160, 133],
        textColor: 255,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center'
      },
      styles: {
        font: 'times,',
      }
    });

    // --- TOTAUX ---
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.text(`Sous-total : ${this.formatAmount(invoice.subtotal)}`, 140, finalY);
    if (invoice.discountAmount > 0) {
      finalY += 6;
      doc.text(`Remise : -${this.formatAmount(invoice.discountAmount)}`, 140, finalY);
    }
    finalY += 6;
    doc.text(`Montant TVA : ${this.formatAmount(invoice.vatAmount)}`, 140, finalY);
    finalY += 6;
    doc.setFont('times', 'bold');
    doc.text(`Total TTC : ${this.formatAmount(invoice.totalAmount)}`, 140, finalY);
    finalY += 6;
    doc.text(`Montant dû : ${this.formatAmount(invoice.amountDue)}`, 140, finalY);

    doc.save(`facture-${invoice.invoiceNumber}.pdf`);
  }

  async generatePaymentReceiptPDF(payment: any, invoiceNumber: string, clientName: string): Promise<void> {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();

    // ✅ Logo à droite
    const logoBase64 = await this.getBase64FromUrl('/image/logo.png');
    const logoWidth = 35;
    const logoHeight = 20;
    doc.addImage(logoBase64, 'PNG', pageWidth - logoWidth - 20, 10, logoWidth, logoHeight);

    // ✅ Coordonnées entreprise
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    const companyInfo = [
      'Garage Expert Auto',
      'Adresse : Conakry - Matoto',
      'Téléphone : +224 621 00 00 00',
      'Email : contact@garage-expert.com'
    ];
    let y = 15;
    companyInfo.forEach(line => {
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

    // const formattedAmount = payment.amount + ' GNF';
    const formattedAmount = new Intl.NumberFormat('en-US').format(payment.amount) + ' GNF';

    const tableRows: [string, string][] = [
      ['Client', clientName],
      ['Facture n°', invoiceNumber],
      ['Méthode de paiement', payment.method],
      ['Montant payé', formattedAmount],
      payment.reference ? ['Référence', payment.reference] : null,
      payment.notes ? ['Notes', payment.notes] : null
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
    const montantEnLettres = this.nombreEnLettres(payment.amount) + ' francs guinéens';

    doc.setFont('times', 'italic');
    doc.text(`Montant en lettres : ${montantEnLettres}`, 20, textY, { maxWidth: pageWidth - 40 });

    // ✅ Signature
    const signY = textY + 25;
    doc.setFont('times', 'normal');
    doc.text('Signature autorisée', pageWidth - 60, signY + 10);
    doc.line(pageWidth - 80, signY + 8, pageWidth - 20, signY + 8);

    doc.save(`recu-${payment.id}.pdf`);
  }

  // Fonction utilitaire pour charger une image en base64
  getBase64FromUrl(url: string): Promise<string> {
    return fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));
  }

  private nombreEnLettres(nombre: number): string {
  if (nombre === 0) return 'zéro';

  const unites = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
  const dizaines = ['', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante'];
  const teens = ['dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];

  const convertMoinsDeCent = (n: number): string => {
    if (n < 10) return unites[n];
    if (n < 20) return teens[n - 10];
    if (n < 70) {
      const dizaine = Math.floor(n / 10);
      const unite = n % 10;
      return dizaines[dizaine] + (unite === 1 ? ' et un' : (unite > 0 ? '-' + unites[unite] : ''));
    }
    if (n < 80) {
      return 'soixante' + (n === 71 ? ' et onze' : '-' + convertMoinsDeCent(n - 60));
    }
    if (n < 100) {
      return 'quatre-vingt' + (n === 80 ? 's' : (n % 10 === 1 ? '-un' : '-' + convertMoinsDeCent(n - 80)));
    }
    return '';
  };

  const convertMoinsDeMille = (n: number): string => {
    const centaine = Math.floor(n / 100);
    const reste = n % 100;
    let result = '';

    if (centaine > 0) {
      result += (centaine === 1 ? 'cent' : unites[centaine] + ' cent');
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
    result += (million === 1 ? 'un million' : this.nombreEnLettres(million) + ' millions') + ' ';
  }

  if (mille > 0) {
    result += (mille === 1 ? 'mille' : this.nombreEnLettres(mille) + ' mille') + ' ';
  }

  if (reste > 0) {
    result += convertMoinsDeMille(reste);
  }

  return result.trim();
  }

  private formatAmount(amount: number): string {
    // return new Intl.NumberFormat('en-US', {
    //   style: 'currency',
    //   currency: 'GNF',
    //   minimumFractionDigits: 0
    // }).format(amount);
    return new Intl.NumberFormat('en-US').format(amount) + ' GNF'
  }


}