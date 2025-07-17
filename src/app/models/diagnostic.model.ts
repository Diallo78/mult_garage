export interface Diagnostic {
    id: string;
    title: string;
    garageId: string;
    visitId: string;
    vehicleId: string;
    technicianId: string;
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
  | 'Freinage'         // Brakes
  | 'Moteur'           // Engine
  | 'Électricité'      // Electrical
  | 'Transmission'     // Transmission
  | 'Suspension'       // Suspension
  | 'Refroidissement'  // Cooling
  | 'Échappement'      // Exhaust
  | 'Carburant'        // Fuel
  | 'Direction'        // Steering
  | 'Autre'            // Other

  export interface DiagnosticCheck {
    id: string;
    category: DiagnosticCategory;
    description: string;
    compliant: boolean;
    quantity?: number;
    severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    postRepairVerification?: boolean;
    comments?: string;
  }