
import { OrderData } from "@/pages/Index";
import { parseOrderDate } from "./dateUtils";
import { cleanVATNumber } from "./formatUtils";
import { format } from "date-fns";

// Fonction pour obtenir la liste des entreprises uniques
export const getUniqueCompanies = (data: OrderData[]) => {
  const companies = new Set<string>();
  
  data.forEach(order => {
    if (order.company && order.company.trim() !== "") {
      companies.add(order.company);
    }
  });
  
  return Array.from(companies).sort();
};

// Filtrer les données selon les critères
export const filterData = (
  data: OrderData[], 
  selectedMonth: string | null, 
  showIntracomOnly: boolean,
  selectedCompany: string | null,
  minAmount: number | null,
  maxAmount: number | null,
  searchTerm: string
) => {
  return data.filter(order => {
    let keepItem = true;
    
    // Filtre par mois
    if (selectedMonth) {
      const date = parseOrderDate(order.date);
      if (date) {
        const orderMonth = format(date, "yyyy-MM");
        if (orderMonth !== selectedMonth) {
          keepItem = false;
        }
      } else {
        keepItem = false;
      }
    }
    
    // Filtre intracom - une commande intracom a une TVA à 0€ ET un numéro de TVA valide
    if (showIntracomOnly) {
      // Vérifier que la TVA est à 0 et qu'un numéro de TVA est présent et non vide
      if (!(order.totalVAT === 0 && order.vatNumber && order.vatNumber.trim() !== "")) {
        keepItem = false;
      }
    }
    
    // Filtre par société
    if (selectedCompany && order.company !== selectedCompany) {
      keepItem = false;
    }
    
    // Filtre par montant
    if (minAmount !== null && order.totalAmount < minAmount) {
      keepItem = false;
    }
    
    if (maxAmount !== null && order.totalAmount > maxAmount) {
      keepItem = false;
    }
    
    // Filtre par recherche textuelle (sur société, numéro de commande ou numéro de TVA nettoyé)
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchesCompany = order.company && order.company.toLowerCase().includes(term);
      const matchesId = order.id && order.id.toLowerCase().includes(term);
      
      // Clean VAT number for comparison
      const cleanedVat = cleanVATNumber(order.vatNumber);
      const matchesVat = cleanedVat && cleanedVat.toLowerCase().includes(term);
      
      if (!(matchesCompany || matchesId || matchesVat)) {
        keepItem = false;
      }
    }
    
    return keepItem;
  });
};
