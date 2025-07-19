import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quote } from '../models/quote.model';
import { Invoice } from '../models/invoice.model';
import { Diagnostic } from '../models/diagnostic.model';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PDFService {

  async generateQuotePDF(quote: Quote, clientName: string, vehicleInfo: string): Promise<void> {
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

  async generateInvoicePDF(invoice: Invoice, clientName: string, vehicleInfo: string): Promise<void> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('INVOICE', 20, 20);

    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 35);
    doc.text(`Date: ${invoice.createdAt.toLocaleDateString()}`, 20, 45);
    doc.text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 20, 55);

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

    invoice.items.forEach(item => {
      doc.text(item.description, 20, yPosition);
      doc.text(item.quantity.toString(), 120, yPosition);
      doc.text(`$${item.unitPrice.toFixed(2)}`, 140, yPosition);
      doc.text(`$${item.subtotal.toFixed(2)}`, 170, yPosition);
      yPosition += 10;
    });

    // Totals
    yPosition += 10;
    doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, yPosition);
    yPosition += 8;
    if (invoice.discountAmount > 0) {
      doc.text(`Discount: -$${invoice.discountAmount.toFixed(2)}`, 140, yPosition);
      yPosition += 8;
    }
    doc.text(`VAT: $${invoice.vatAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 8;
    doc.setFontSize(14);
    doc.text(`Total: $${invoice.totalAmount.toFixed(2)}`, 140, yPosition);
    yPosition += 8;
    doc.text(`Amount Due: $${invoice.amountDue.toFixed(2)}`, 140, yPosition);

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  }

  async generateDiagnosticReportPDF(diagnostic: Diagnostic, clientName: string, vehicleInfo: string): Promise<void> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('DIAGNOSTIC REPORT', 20, 20);

    doc.setFontSize(12);
    doc.text(`Date: ${diagnostic.createdAt.toLocaleDateString()}`, 20, 35);
    doc.text(`Client: ${clientName}`, 20, 45);
    doc.text(`Vehicle: ${vehicleInfo}`, 20, 55);
    doc.text(`Category: ${diagnostic.title}`, 20, 65);

    // Checks
    let yPosition = 85;
    doc.setFontSize(14);
    doc.text('Diagnostic Checks:', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    diagnostic.checks.forEach(check => {
      doc.text(`• ${check.description}`, 25, yPosition);
      yPosition += 6;
      doc.text(`  Status: ${check.compliant ? 'Compliant' : 'Non-Compliant'}`, 30, yPosition);
      yPosition += 6;
      doc.text(`  Severity: ${check.severityLevel}`, 30, yPosition);
      yPosition += 6;
      if (check.comments) {
        doc.text(`  Comments: ${check.comments}`, 30, yPosition);
        yPosition += 6;
      }
      yPosition += 4;
    });

    // Summary
    yPosition += 10;
    doc.setFontSize(14);
    doc.text('Summary:', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    doc.text(diagnostic.summary, 20, yPosition);

    // Final Decision
    yPosition += 20;
    doc.setFontSize(14);
    doc.text(`Final Decision: ${diagnostic.finalDecision}`, 20, yPosition);

    doc.save(`diagnostic-report-${diagnostic.id}.pdf`);
  }

  // async generatePaymentReceiptPDF(payment: any, invoiceNumber: string, clientName: string): Promise<void> {
  //   const doc = new jsPDF();
  //   const pageWidth = doc.internal.pageSize.getWidth();

  //   // --- LOGO ENTREPRISE ---
  //   const logoBase64 = await this.getBase64FromUrl('/image/logo.png');
  //   const logoWidth = 40;
  //   const logoHeight = 20;
  //   doc.addImage(logoBase64, 'PNG', (pageWidth - logoWidth) / 2, 10, logoWidth, logoHeight);

  //   // --- COORDONNÉES ENTREPRISE ---
  //   doc.setFontSize(12);
  //   const companyInfo = [
  //     "Nom de l'Entreprise",
  //     "Adresse de l'entreprise",
  //     "Téléphone : 01 23 45 67 89",
  //     "Email : contact@entreprise.com"
  //   ];
  //   let y = 32;
  //   companyInfo.forEach(line => {
  //     doc.text(line, pageWidth / 2, y, { align: 'center' });
  //     y += 6;
  //   });

  //   // --- TITRE ---
  //   doc.setFontSize(20);
  //   doc.text('REÇU DE PAIEMENT', pageWidth / 2, y + 10, { align: 'center' });

  //   // --- INFOS CLIENT & PAIEMENT CENTRÉES ---
  //   doc.setFontSize(12);

  //   const tableStartY = y + 25;
  //   const rowHeight = 10;
  //   const col1X = pageWidth / 2 - 50;
  //   const col2X = pageWidth / 2 + 10;
  //   const tableWidth = 100;
  //   const tableRows = [
  //     ["Date du reçu", payment.date.toLocaleDateString()],
  //     ["Facture n°", invoiceNumber],
  //     ["Client", clientName],
  //     ["Méthode de paiement", payment.method],
  //     ["Montant payé", `$${payment.amount.toFixed(2)}`],
  //     payment.reference ? ["Référence", payment.reference] : null,
  //     payment.notes ? ["Notes", payment.notes] : null
  //   ].filter(Boolean) as [string, string][];

  //   doc.setDrawColor(200, 200, 200);
  //   doc.setLineWidth(0.2);
  //   doc.rect(col1X - 10, tableStartY - 5, tableWidth, rowHeight * tableRows.length + 2, 'S');

  //   tableRows.forEach(([label, value], i) => {
  //     const yPos = tableStartY + i * rowHeight;
  //     doc.text(label + " :", col1X, yPos);
  //     doc.text(value, col2X, yPos);
  //     // Ligne horizontale
  //     if (i < tableRows.length - 1) {
  //       doc.setDrawColor(230, 230, 230);
  //       doc.line(col1X - 10, yPos + 4, col1X - 10 + tableWidth, yPos + 4);
  //     }
  //   });

  //   doc.save(`receipt-${payment.id}.pdf`);
  // }

async generatePaymentReceiptPDF(payment: any, invoiceNumber: string, clientName: string): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();

  // ✅ Charger le logo
  const logoBase64 = await this.getBase64FromUrl('/image/logo.png');
  const logoWidth = 35;
  const logoHeight = 20;
  doc.addImage(logoBase64, 'PNG', pageWidth - logoWidth - 20, 10, logoWidth, logoHeight);

  // ✅ Coordonnées de l’entreprise à gauche
  doc.setFont('times', 'normal'); // Cambria n'existe pas nativement, 'times' est le plus proche
  doc.setFontSize(11);
  const companyLines = [
    'Garage Expert Auto',
    'Adresse : Conakry - Matoto',
    'Téléphone : +224 621 00 00 00',
    'Email : contact@garage-expert.com'
  ];
  let y = 15;
  companyLines.forEach(line => {
    doc.text(line, 20, y);
    y += 6;
  });

  // ✅ Titre centré
  doc.setFontSize(16);
  doc.setFont('times', 'bold');
  doc.text('REÇU DE PAIEMENT', pageWidth / 2, y + 10, { align: 'center' });

  // ✅ Infos générales (Reçu N°, Date)
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

  const tableRows: [string, string][] = [
    ['Client', clientName],
    ['Facture n°', invoiceNumber],
    ['Méthode de paiement', payment.method],
    ['Montant payé', `${payment.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'GNF' })}`],
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

  // ✅ Signature
  const signY = rowStartY + tableRows.length * rowHeight + 20;
  doc.text('Signature autorisée', pageWidth - 60, signY + 20);
  doc.line(pageWidth - 80, signY + 18, pageWidth - 20, signY + 18);

  // ✅ Télécharger le fichier
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
}