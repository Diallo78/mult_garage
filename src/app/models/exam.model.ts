export type ExamDecision = 'Conforme' | 'NonConforme' | 'PartiellementConforme';

export interface VehicleExam {
  id: string;
  examNumber: string;
  date: Date;
  clientId: string;
  vehicleId: string;
  garageId: string;

  // Informations du client
  clientName: string;
  clientPhone: string;

  // Informations du véhicule
  vehicleMake: string;
  vehicleRegistration: string;

  // Vérifications techniques
  technicalChecks: TechnicalCheck[];

  // Informations du chauffeur (optionnel)
  driver?: {
    name: string;
    phone: string;
    account: string;
  };

  // Résumé et décision
  summary: string;
  finalDecision: ExamDecision;
  technicianSignature?: string;

  // Métadonnées
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnicalCheck {
  id: string;
  category: ExamCategoryKey;
  categoryName: string;
  itemName: string;
  verificationRequired: string;
  compliance: boolean;
  quantity?: number;
  postRepairVerification?: boolean;
  comments?: string;
}

export type ExamCategoryKey = 'A' | 'B' | 'C' | 'D';

export interface ExamCategory {
  key: ExamCategoryKey;
  name: string;
  items: ExamItem[];
}

export interface ExamItem {
  id: string;
  name: string;
  verificationRequired: string;
  category: ExamCategoryKey;
}

// Catégories prédéfinies basées sur l'image
export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    key: 'A',
    name: 'Dans le véhicule',
    items: [
      {
        id: 'pare-brise',
        name: 'pare-brise',
        verificationRequired: 'Vérifier les fissures',
        category: 'A',
      },
      {
        id: 'vitre-portiere-droite',
        name: 'vitre portière droite R',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'vitre-portiere-gauche',
        name: 'vitre portière gauche L',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'ceinture-securite',
        name: 'ceinture de sécurité',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'frein-main',
        name: 'frein à main',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'klaxon',
        name: 'Avertisseur sonore (klaxon)',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'commande-embrayage',
        name: "Commande d'embrayage",
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'commande-frein',
        name: 'Commande de frein',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'commande-accelerateur',
        name: 'Commande Accélérateur',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'commodo-clignotant',
        name: 'commodo de clignotant',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'eclairage-tableau',
        name: 'Éclairage tableau de bord',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
      {
        id: 'climatisation',
        name: 'climatisation',
        verificationRequired: 'État, fonctionnement',
        category: 'A',
      },
    ],
  },
  {
    key: 'B',
    name: 'Autour du véhicule',
    items: [
      {
        id: 'feu-route',
        name: 'feu de route',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'feu-croisement',
        name: 'feu de croisement',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'feu-direction',
        name: 'feu de direction (clignotant)',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'feu-arret',
        name: "feu d'arrêt",
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'feu-recul',
        name: 'feu de recul',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'gyrophare',
        name: 'Gyrophare',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'obc',
        name: 'OBC',
        verificationRequired: 'État, fonctionnement',
        category: 'B',
      },
      {
        id: 'etat-carrosserie',
        name: 'État général de la carrosserie',
        verificationRequired: 'État général',
        category: 'B',
      },
    ],
  },
  {
    key: 'C',
    name: 'Carrosserie',
    items: [
      {
        id: 'portiere',
        name: 'portière',
        verificationRequired: 'État',
        category: 'C',
      },
      {
        id: 'retroviseur-gauche',
        name: 'rétroviseur L',
        verificationRequired: 'État, présence',
        category: 'C',
      },
      {
        id: 'retroviseur-droite',
        name: 'Rétroviseur R',
        verificationRequired: 'État, présence',
        category: 'C',
      },
      {
        id: 'essuie-glace',
        name: 'essuie glace (balais)',
        verificationRequired: 'État et fonctionnement',
        category: 'C',
      },
    ],
  },
  {
    key: 'D',
    name: 'Roues et pneumatiques',
    items: [
      {
        id: 'pneus',
        name: 'pneus',
        verificationRequired: 'État',
        category: 'D',
      },
      {
        id: 'goujon-roue',
        name: 'Goujon de Roue',
        verificationRequired: 'Limite de serrage',
        category: 'D',
      },
      {
        id: 'garde-boue',
        name: 'garde boue',
        verificationRequired: 'État et présence',
        category: 'D',
      },
      {
        id: 'roue-secours',
        name: 'Roues secours',
        verificationRequired: 'État et présence',
        category: 'D',
      },
    ],
  },
];
