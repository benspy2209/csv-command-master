import { OrderData } from "@/pages/Index";
import { format, parse, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Fonction pour analyser différents formats de date possibles
export const parseOrderDate = (dateString: string) => {
  if (!dateString) return null;
  
  // Nettoyer la chaîne de date
  const trimmedDate = dateString.trim();
  
  try {
    // Pour le format "dd/MM/yyyy HH:mm:ss"
    if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/)) {
      const parsedDate = parse(trimmedDate, "dd/MM/yyyy HH:mm:ss", new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
    
    // Pour le format "dd/MM/yyyy"
    if (trimmedDate.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const parsedDate = parse(trimmedDate, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) return parsedDate;
    }
    
    // Essayer de parser comme ISO si les autres formats échouent
    const isoDate = parseISO(trimmedDate);
    if (isValid(isoDate)) return isoDate;
    
    console.error("Format de date non reconnu:", trimmedDate);
    return null;
  } catch (e) {
    console.error("Erreur d'analyse de date:", e, trimmedDate);
    return null;
  }
};

// Fonction pour générer une liste unique de mois à partir des données
export const getUniqueMonths = (data: OrderData[]) => {
  const months = new Set<string>();
  
  data.forEach(order => {
    if (!order.date) return;
    
    const date = parseOrderDate(order.date);
    if (date) {
      const monthKey = format(date, "yyyy-MM");
      const monthName = format(date, "MMMM yyyy", { locale: fr });
      months.add(monthKey);
    }
  });
  
  return Array.from(months).sort().reverse();
};

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

// Fonction pour convertir une chaîne avec virgule en nombre
const parseCommaNumber = (value: string | number): number => {
  if (typeof value === 'number') return value;
  if (!value || value.trim() === "") return 0;
  // Remplacer la virgule par un point pour l'analyse numérique correcte
  return parseFloat(value.replace(",", "."));
};

// Consolider les données intracom par client
export const consolidateIntracomData = (filteredData: OrderData[]) => {
  const consolidatedData: {
    company: string;
    vatNumber: string;
    totalAmount: number;
    orderCount: number;
    originalOrders: OrderData[];
  }[] = [];

  // Filtrer uniquement les commandes intracom (TVA à 0 et numéro de TVA présent)
  const intracomOrders = filteredData.filter(order => 
    order.totalVAT === 0 && 
    order.vatNumber && 
    order.vatNumber.trim() !== ""
  );

  // Grouper par numéro de TVA
  const groupedByVAT: Record<string, OrderData[]> = {};
  
  intracomOrders.forEach(order => {
    const vatKey = order.vatNumber;
    if (!groupedByVAT[vatKey]) {
      groupedByVAT[vatKey] = [];
    }
    groupedByVAT[vatKey].push(order);
  });

  // Créer une ligne consolidée pour chaque client (numéro de TVA)
  Object.entries(groupedByVAT).forEach(([vatNumber, orders]) => {
    const firstOrder = orders[0];
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    consolidatedData.push({
      company: firstOrder.company,
      vatNumber: vatNumber,
      totalAmount: totalAmount,
      orderCount: orders.length,
      originalOrders: orders
    });
  });

  // Trier par montant total décroissant
  return consolidatedData.sort((a, b) => b.totalAmount - a.totalAmount);
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
    
    // Filtre par recherche textuelle (sur société, numéro de commande ou numéro de TVA)
    if (searchTerm && searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      const matchesCompany = order.company && order.company.toLowerCase().includes(term);
      const matchesId = order.id && order.id.toLowerCase().includes(term);
      const matchesVat = order.vatNumber && order.vatNumber.toLowerCase().includes(term);
      
      if (!(matchesCompany || matchesId || matchesVat)) {
        keepItem = false;
      }
    }
    
    return keepItem;
  });
};

// Calculer les statistiques avec précision absolue (sans aucun arrondi intermédiaire)
export const calculateStats = (filteredData: OrderData[]) => {
  // Variables pour stocker les sommes exactes
  let total = 0;
  let totalVAT = 0;
  
  for (const order of filteredData) {
    // Convertir en nombre
    total += order.totalAmount;
    totalVAT += order.totalVAT;
  }
  
  // Calculer HT en soustrayant la TVA du total
  const totalExcludingVAT = total - totalVAT;
  
  // Retourner les valeurs avec 2 décimales pour l'affichage
  return {
    total: total.toFixed(2),
    totalVAT: totalVAT.toFixed(2),
    totalExcludingVAT: totalExcludingVAT.toFixed(2),
    orderCount: filteredData.length
  };
};
