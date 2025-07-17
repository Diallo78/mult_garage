import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Quote } from '../models/quote.model';
import { Invoice } from '../models/invoice.model';
import { Diagnostic } from '../models/diagnostic.model';

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

  async generatePaymentReceiptPDF(payment: any, invoiceNumber: string, clientName: string): Promise<void> {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('PAYMENT RECEIPT', 20, 20);

    doc.setFontSize(12);
    doc.text(`Receipt Date: ${payment.date.toLocaleDateString()}`, 20, 35);
    doc.text(`Invoice #: ${invoiceNumber}`, 20, 45);
    doc.text(`Client: ${clientName}`, 20, 55);
    doc.text(`Payment Method: ${payment.method}`, 20, 65);
    doc.text(`Amount Paid: $${payment.amount.toFixed(2)}`, 20, 75);

    if (payment.reference) {
      doc.text(`Reference: ${payment.reference}`, 20, 85);
    }

    if (payment.notes) {
      doc.text(`Notes: ${payment.notes}`, 20, 95);
    }

    doc.save(`receipt-${payment.id}.pdf`);
  }
}