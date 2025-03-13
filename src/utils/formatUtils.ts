
// Fonction pour nettoyer les numéros de TVA
export const cleanVATNumber = (vatNumber: string): string => {
  if (!vatNumber) return "";
  
  // Enlever tous les espaces, points, tirets
  return vatNumber.replace(/[\s.-]/g, '');
};

// Fonction pour convertir les nombres avec virgule en nombres avec point
export const parseCommaNumber = (value: string): number => {
  if (!value) return 0;
  
  // Remplacer les virgules par des points pour la conversion en nombre
  const normalizedValue = value.replace(',', '.');
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
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
    'â€™': ''',
    'â€"': '–',
    'â€"': '—',
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
