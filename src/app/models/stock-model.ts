export interface StockModel {
  id: string;
  designation: string;
  fournisseur: string;
  quantite: number;
  prixUnitaire: number;
  prixUnitaireHT: number;
  status: 'entre' | 'sortie'
  prixTotal: number;
  createdAt: Date;
  updatedAt: Date;
  garageId: string;
}
