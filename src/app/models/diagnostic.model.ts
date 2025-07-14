export interface Diagnostic {
    id: string;
    garageId: string;
    visitId: string;
    vehicleId: string;
    technicianId: string;
    category: DiagnosticCategory;
    checks: DiagnosticCheck[];
    summary: string;
    finalDecision: 'Repair' | 'Monitor' | 'NonRepairable';
    technicianSignature?: string;
    images?: string[];
    videos?: string[];
    createdAt: Date;
    updatedAt: Date;
  }

  export type DiagnosticCategory =
    | 'Brakes'
    | 'Engine'
    | 'Electrical'
    | 'Transmission'
    | 'Suspension'
    | 'Cooling'
    | 'Exhaust'
    | 'Fuel'
    | 'Steering'
    | 'Other';

  export interface DiagnosticCheck {
    id: string;
    description: string;
    compliant: boolean;
    quantity?: number;
    severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    postRepairVerification?: boolean;
    comments?: string;
  }