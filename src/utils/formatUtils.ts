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
  
  // We need to use unique keys for each mapping
  // Using Unicode code points to differentiate identical-looking characters
  const replacements: Record<string, string> = {
    '\u00E9': 'é', // é
    '\u00E8': 'è', // è
    '\u00EA': 'ê', // ê
    '\u00EB': 'ë', // ë
    '\u00E0': 'à', // à
    '\u00E2': 'â', // â
    '\u00F4': 'ô', // ô
    '\u00EE': 'î', // î
    '\u00EF': 'ï', // ï
    '\u00FC': 'ü', // ü
    '\u00F9': 'ù', // ù
    '\u00E7': 'ç', // ç
    '\u00C9': 'É', // É
    '\u00C8': 'È', // È
    '\u00CA': 'Ê', // Ê
    '\u00CB': 'Ë', // Ë
    '\u00C0': 'À', // À
    '\u00C2': 'Â', // Â
    '\u00D4': 'Ô', // Ô
    '\u00CE': 'Î', // Î
    '\u00CF': 'Ï', // Ï
    '\u00DC': 'Ü', // Ü
    '\u00D9': 'Ù', // Ù
    '\u00C7': 'Ç'  // Ç
  };

  // Also handle specific character encoding issues seen in real data
  // Use numbered keys to avoid duplicate keys when rendered as � in editor
  const encodingIssueReplacements: Record<string, string> = {
    // Each key is a unique placeholder for different mis-encoded characters
    'char1': 'é',
    'char2': 'è',
    'char3': 'à',
    'char4': 'ç',
    'char5': 'ê',
    'char6': 'ë',
    'char7': 'î',
    'char8': 'ï',
    'char9': 'ô',
    'char10': 'ù',
    'char11': 'û',
    'char12': 'ü'
  };

  // Actual problematic characters to replace (in the correct order)
  const problematicChars = [
    '\uFFFD', // Replacement character (often shown as �)
    '\u00C3\u00A9', // é in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00A8', // è in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00A0', // à in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00A7', // ç in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00AA', // ê in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00AB', // ë in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00AE', // î in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00AF', // ï in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00B4', // ô in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00B9', // ù in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00BB', // û in UTF-8 interpreted as ISO-8859-1
    '\u00C3\u00BC'  // ü in UTF-8 interpreted as ISO-8859-1
  ];

  let result = text;
  
  // Replace encoding issues first
  problematicChars.forEach((badChar, index) => {
    const replacementKey = `char${index + 1}`;
    if (encodingIssueReplacements[replacementKey]) {
      result = result.replace(
        new RegExp(badChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
        encodingIssueReplacements[replacementKey]
      );
    }
  });
  
  // Then normalize Unicode characters
  Object.entries(replacements).forEach(([badChar, goodChar]) => {
    result = result.replace(
      new RegExp(badChar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), 
      goodChar
    );
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
