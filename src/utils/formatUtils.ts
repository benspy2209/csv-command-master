// Clean VAT number by removing spaces and dots, keeping only letters and numbers
export const cleanVATNumber = (vatNumber: string | null | undefined): string => {
  if (!vatNumber) return "";
  // Remove spaces, dots and keep only letters and numbers
  return vatNumber.replace(/[^a-zA-Z0-9]/g, "");
};

// Fonction pour convertir une chaîne avec virgule en nombre
export const parseCommaNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || value.trim() === "") return 0;
  // Remplacer la virgule par un point pour l'analyse numérique correcte
  return parseFloat(value.replace(",", "."));
};

// Fonction pour normaliser les caractères accentués et spéciaux
export const normalizeText = (text: string): string => {
  if (!text) return "";
  // Normalise la chaîne en décomposant les caractères accentués
  // puis en les recomposant avec la forme normalisée
  return text.normalize("NFD").normalize("NFC");
};

// Fonction pour détecter les colonnes liées aux entreprises
export const isCompanyRelatedColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Liste de termes liés aux noms d'entreprise en français et en anglais
  const companyTerms = [
    "societe", "société", "company", "entreprise", "organisation", "organization",
    "client", "customer", "business", "firme", "corporation", "raison sociale",
    "nom commercial", "établissement", "etablissement"
  ];
  
  return companyTerms.some(term => normalizedColumn.includes(term));
};

// Fonction pour détecter les colonnes liées aux numéros de TVA/NII
export const isVATNumberRelatedColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Liste de termes liés aux numéros de TVA en français et en anglais
  const vatTerms = [
    "tva", "vat", "nii", "numero tva", "numéro tva", "tax number", "tax id",
    "numero fiscal", "numéro fiscal", "id fiscal", "identifiant fiscal",
    "siret", "siren", "no tva", "n° tva", "no vat", "n° vat"
  ];
  
  return vatTerms.some(term => normalizedColumn.includes(term));
};
