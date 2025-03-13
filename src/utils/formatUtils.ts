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
