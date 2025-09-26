export interface GarageDtoModel {
    id: string,
    name: string,
    address: string,
    phone: string,
    email: string,
    logo: string,
    signature?: string,
    currency: string,
    website: string,
    siret?: string,
    vatNumber?: string,
    agrement?: string,       // Numéro d'agrément
    rc?: string,             // Registre de commerce
    nif?: string,            // Numéro d'identification fiscale
    capitalSocial?: number,  // Capital social en GNF
}