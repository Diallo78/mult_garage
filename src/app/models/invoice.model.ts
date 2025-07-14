export interface Invoice {
    id: string;
    garageId: string;
    interventionId: string;
    quoteId: string;
    clientId: string;
    vehicleId: string;
    invoiceNumber: string;
    items: InvoiceItem[];
    subtotal: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
    amountPaid: number;
    amountDue: number;
    status: 'Unpaid' | 'Partial' | 'Paid' | 'Overdue';
    dueDate: Date;
    payments: Payment[];
    clientSignature?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    type: 'Part' | 'Labor' | 'Service';
  }

  export interface Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    date: Date;
    notes?: string;
  }

  export type PaymentMethod = 'Cash' | 'MobileMoney' | 'Cheque' | 'BankTransfer' | 'Card';