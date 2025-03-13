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

// Fonction pour corriger les problèmes d'encodage avec les caractères accentués
export const normalizeText = (text: string): string => {
  if (!text) return "";
  
  // Remplacer les caractères mal encodés les plus courants
  const replacements: Record<string, string> = {
    '�': 'é',
    '�': 'è',
    '�': 'ê',
    '�': 'ë',
    '�': 'à',
    '�': 'â',
    '�': 'ô',
    '�': 'î',
    '�': 'ï',
    '�': 'ü',
    '�': 'ù',
    '�': 'ç',
    '�': 'É',
    '�': 'È',
    '�': 'Ê',
    '�': 'Ë',
    '�': 'À',
    '�': 'Â',
    '�': 'Ô',
    '�': 'Î',
    '�': 'Ï',
    '�': 'Ü',
    '�': 'Ù',
    '�': 'Ç'
  };

  let result = text;
  // Remplacer les caractères problématiques
  Object.entries(replacements).forEach(([badChar, goodChar]) => {
    result = result.replace(new RegExp(badChar, 'g'), goodChar);
  });
  
  return result;
};

// Fonction pour détecter les colonnes liées aux entreprises
export const isCompanyRelatedColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Liste de termes liés aux noms d'entreprise en français et en anglais
  const companyTerms = [
    "societe", "société", "company", "entreprise", "organisation", "organization",
    "firme", "corporation", "raison sociale", "nom commercial", "établissement", 
    "etablissement", "facturation.societe", "facturation.société"
  ];
  
  // Éviter d'utiliser des colonnes d'identifiants comme noms d'entreprise
  const excludeTerms = ["identifiant", "id", "code", "numero", "numéro", "oxatis"];
  
  // Vérifier si le nom de colonne contient des termes d'entreprise mais pas des termes d'exclusion
  const containsCompanyTerm = companyTerms.some(term => normalizedColumn.includes(term));
  const containsExcludeTerm = excludeTerms.some(term => normalizedColumn.includes(term));
  
  return containsCompanyTerm && !containsExcludeTerm;
};

// Fonction pour détecter les colonnes liées aux noms des clients/entreprises réels (pas des identifiants)
export const isActualCompanyNameColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Termes plus spécifiques pour les noms réels d'entreprises
  const nameTerms = [
    "nom société", "nom societe", "nom entreprise", "company name", 
    "raison sociale", "nom commercial", "dénomination sociale", "denomination sociale",
    "nom client", "facturation.nom", "facturation.société", "facturation.societe",
    "client.nom", "société.nom", "societe.nom"
  ];
  
  return nameTerms.some(term => normalizedColumn.includes(term));
};

// Fonction pour détecter s'il s'agit d'un nom de personne et non d'une entreprise
export const isPersonNameColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Termes spécifiques pour les noms de personnes
  const personTerms = [
    ".prenom", ".prénom", ".nom", "firstname", "lastname", 
    "first name", "last name", "nom client", "nom du client", 
    "prénom client", "prenom client"
  ];
  
  return personTerms.some(term => normalizedColumn.includes(term));
};

// Fonction pour détecter les colonnes liées aux numéros de TVA/NII
export const isVATNumberRelatedColumn = (columnName: string): boolean => {
  if (!columnName) return false;
  
  const normalizedColumn = normalizeText(columnName.toLowerCase());
  
  // Liste de termes liés aux numéros de TVA en français et en anglais
  const vatTerms = [
    "tva", "vat", "nii", "numero tva", "numéro tva", "tax number", "tax id",
    "numero fiscal", "numéro fiscal", "id fiscal", "identifiant fiscal",
    "siret", "siren", "no tva", "n° tva", "no vat", "n° vat", "société.nii", 
    "societe.nii", "société.tva", "societe.tva"
  ];
  
  return vatTerms.some(term => normalizedColumn.includes(term));
};
