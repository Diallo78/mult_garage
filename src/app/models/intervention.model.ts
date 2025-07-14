export interface Intervention {
    id: string;
    garageId: string;
    quoteId: string;
    diagnosticId: string;
    vehicleId: string;
    assignedTechnicianId: string;
    tasks: InterventionTask[];
    estimatedDuration: number; // in hours
    actualDuration?: number;
    usedParts: UsedPart[];
    extraCosts: ExtraCost[];
    status: 'Scheduled' | 'InProgress' | 'Completed' | 'OnHold';
    startDate: Date;
    endDate?: Date;
    finalReport?: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface InterventionTask {
    id: string;
    description: string;
    completed: boolean;
    estimatedTime: number;
    actualTime?: number;
    notes?: string;
  }

  export interface UsedPart {
    id: string;
    partName: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
    supplierPartNumber?: string;
  }

  export interface ExtraCost {
    id: string;
    description: string;
    amount: number;
    reason: string;
    approvedBy?: string;
  }