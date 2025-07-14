export interface Quote {
    id: string;
    garageId: string;
    diagnosticId: string;
    vehicleId: string;
    clientId: string;
    quoteNumber: string;
    items: QuoteItem[];
    subtotal: number;
    vatRate: number;
    vatAmount: number;
    total: number;
    status: 'Pending' | 'Accepted' | 'Rejected' | 'Expired';
    validUntil: Date;
    revisionHistory: QuoteRevision[];
    clientSignature?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface QuoteItem {
    id: string;
    designation: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    type: 'Part' | 'Labor' | 'Service';
  }

  export interface QuoteRevision {
    id: string;
    revisionNumber: number;
    changes: string;
    createdAt: Date;
    createdBy: string;
  }