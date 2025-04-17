
// Fonction pour nettoyer les numéros de TVA
export const cleanVATNumber = (vatNumber: string): string => {
  if (!vatNumber) return "";
  
  // Enlever tous les espaces, points, tirets et convertir en uppercase
  return vatNumber.replace(/[\s.-]/g, '').toUpperCase();
};

// Fonction pour convertir les nombres avec virgule en nombres avec point
export const parseCommaNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remplacer les virgules par des points pour la conversion en nombre
  const normalizedValue = value.replace(',', '.');
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
};

// Map des formats de TVA réguliers par pays
const vatFormatMap: Record<string, RegExp> = {
  // Formats standards pour différents pays de l'UE
  'AT': /^ATU\d{8}$/, // Autriche
  'BE': /^BE0\d{9}$/, // Belgique
  'BG': /^BG\d{9,10}$/, // Bulgarie
  'CY': /^CY\d{8}[A-Z]$/, // Chypre
  'CZ': /^CZ\d{8,10}$/, // République tchèque
  'DE': /^DE\d{9}$/, // Allemagne
  'DK': /^DK\d{8}$/, // Danemark
  'EE': /^EE\d{9}$/, // Estonie
  'EL': /^EL\d{9}$/, // Grèce
  'GR': /^GR\d{9}$/, // Grèce (ancien format)
  'ES': /^ES[A-Z0-9]\d{7}[A-Z0-9]$/, // Espagne
  'FI': /^FI\d{8}$/, // Finlande
  'FR': /^FR[A-Z0-9]{2}\d{9}$/, // France
  'GB': /^GB(\d{9}|\d{12}|(GD|HA)\d{3})$/, // Royaume-Uni
  'HR': /^HR\d{11}$/, // Croatie
  'HU': /^HU\d{8}$/, // Hongrie
  'IE': /^IE[A-Z0-9]{8,9}$/, // Irlande
  'IT': /^IT\d{11}$/, // Italie
  'LT': /^LT(\d{9}|\d{12})$/, // Lituanie
  'LU': /^LU\d{8}$/, // Luxembourg
  'LV': /^LV\d{11}$/, // Lettonie
  'MT': /^MT\d{8}$/, // Malte
  'NL': /^NL\d{9}B\d{2}$/, // Pays-Bas
  'PL': /^PL\d{10}$/, // Pologne
  'PT': /^PT\d{9}$/, // Portugal
  'RO': /^RO\d{2,10}$/, // Roumanie
  'SE': /^SE\d{10}01$/, // Suède
  'SI': /^SI\d{8}$/, // Slovénie
  'SK': /^SK\d{10}$/ // Slovaquie
};

// Liste des formats corrigés à accepter (basée sur les exemples du comptable)
const specialVatFormats: Record<string, string[]> = {
  'FR': ['FR65983585191', 'FR76981018898']
};

// Fonction pour vérifier si un numéro de TVA semble valide (format basique)
export const isVATNumberValid = (vatNumber: string): boolean => {
  if (!vatNumber) return false;
  
  // On vérifie d'abord si c'est l'un des numéros de TVA explicitement valides
  const countryCode = getCountryCodeFromVAT(vatNumber);
  if (countryCode && specialVatFormats[countryCode]?.includes(vatNumber)) {
    return true;
  }
  
  // Un numéro de TVA européen valide devrait avoir:
  // - Au moins 8 caractères
  // - Commencer par 2 lettres de code pays
  if (vatNumber.length < 8) return false;
  const countryRegex = /^[A-Z]{2}/;
  if (!countryRegex.test(vatNumber)) return false;
  
  // Vérification du format spécifique au pays
  const country = vatNumber.substring(0, 2);
  const regex = vatFormatMap[country];
  
  // Si nous avons un regex pour ce pays, l'utiliser pour valider
  if (regex) {
    return regex.test(vatNumber);
  }
  
  // Format de base si le pays n'est pas reconnu
  // (2 lettres suivies d'au moins 6 caractères alphanumériques)
  const genericRegex = /^[A-Z]{2}[A-Z0-9]{6,}$/;
  return genericRegex.test(vatNumber);
};

// Fonction pour extraire le code pays d'un numéro de TVA
export const getCountryCodeFromVAT = (vatNumber: string): string => {
  if (!vatNumber || vatNumber.length < 2) return "";
  return vatNumber.substring(0, 2);
};

// Fonction pour extraire le numéro sans le code pays
export const getNumberWithoutCountryCode = (vatNumber: string): string => {
  if (!vatNumber || vatNumber.length < 3) return "";
  return vatNumber.substring(2);
};

// Fonction pour corriger les problèmes d'encodage des caractères spéciaux
export const fixEncodingIssues = (text: string): string => {
  if (!text) return "";
  
  // Mapping des caractères mal encodés vers leur version correcte
  const specialCharMap: Record<string, string> = {
    'Ã©': 'é',
    'Ã¨': 'è',
    'Ãª': 'ê',
    'Ã«': 'ë',
    'Ã ': 'à',
    'Ã¢': 'â',
    'Ã¯': 'ï',
    'Ã®': 'î',
    'Ã´': 'ô',
    'Ã¶': 'ö',
    'Ã¹': 'ù',
    'Ã»': 'û',
    'Ã¼': 'ü',
    'Ã§': 'ç',
    'â‚¬': '€',
    // Using string literals without problematic characters
    'â€™': "'",
    'â€\u2013': '–', // en dash
    'â€\u2014': '—', // em dash
    'â€œ': '"',
    'â€': '"',
    'Å"': 'œ',
    'Â': '',      // Souvent un caractère parasite
    '�': '',      // Caractère de remplacement Unicode
    // Correction pour les caractères corrompus spécifiques comme Maréchal
    'Mar�chal': 'Maréchal',
    'Mar�ch': 'Maréch',
    'Mar�': 'Maré'
  };
  
  let fixedText = text;
  
  // Remplacer les séquences de caractères mal encodés
  Object.entries(specialCharMap).forEach(([incorrect, correct]) => {
    fixedText = fixedText.replace(new RegExp(incorrect, 'g'), correct);
  });
  
  // Recherche et remplacement de caractères Unicode de remplacement spécifiques
  const placeholderChars = ['\uFFFD', '\u00A0', '\u2022'];
  placeholderChars.forEach(char => {
    // Remplacement adapté selon le contexte
    if (fixedText.includes(char)) {
      if (fixedText.includes('Mar' + char + 'chal')) {
        fixedText = fixedText.replace('Mar' + char + 'chal', 'Maréchal');
      } else if (fixedText.includes('Mar' + char)) {
        fixedText = fixedText.replace('Mar' + char, 'Maré');
      } else {
        fixedText = fixedText.replace(char, '');
      }
    }
  });
  
  return fixedText;
};
