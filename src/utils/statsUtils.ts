
import { OrderData } from "@/pages/Index";
import { cleanVATNumber, isVATNumberValid } from "./formatUtils";
import { getCountryCodeFromVAT } from "./formatUtils";

// Calculer les statistiques avec précision absolue (sans aucun arrondi intermédiaire)
export const calculateStats = (filteredData: OrderData[]) => {
  // Variables pour stocker les sommes exactes
  let total = 0;
  let totalVAT = 0;
  let intracomSales = 0;
  let domesticSales = 0;
  let domesticVAT = 0;
  let exportSales = 0;
  
  for (const order of filteredData) {
    // Convertir en nombre
    total += order.totalAmount;
    totalVAT += order.totalVAT;
    
    // Identifier le type de vente
    const hasVAT = order.vatNumber && order.vatNumber.trim() !== "";
    const cleanedVAT = cleanVATNumber(order.vatNumber);
    const validVATFormat = isVATNumberValid(cleanedVAT);
    const countryCode = getCountryCodeFromVAT(cleanedVAT);
    
    // Ventes intracom (TVA à 0 et numéro de TVA valide)
    if (order.totalVAT === 0 && hasVAT && validVATFormat) {
      intracomSales += order.totalAmount;
    } 
    // Ventes domestiques (avec TVA)
    else if (order.totalVAT > 0) {
      domesticSales += order.totalAmount;
      domesticVAT += order.totalVAT;
    }
    // Exportations hors UE (Suisse, etc.)
    else if (order.totalVAT === 0) {
      exportSales += order.totalAmount;
    }
  }
  
  // Calculer HT en soustrayant la TVA du total
  const totalExcludingVAT = total - totalVAT;
  const domesticExcludingVAT = domesticSales - domesticVAT;
  
  // Retourner les valeurs avec 2 décimales pour l'affichage
  return {
    total: total.toFixed(2),
    totalVAT: totalVAT.toFixed(2),
    totalExcludingVAT: totalExcludingVAT.toFixed(2),
    orderCount: filteredData.length,
    intracomSales: intracomSales.toFixed(2),
    domesticSales: domesticSales.toFixed(2),
    domesticVAT: domesticVAT.toFixed(2),
    domesticExcludingVAT: domesticExcludingVAT.toFixed(2),
    exportSales: exportSales.toFixed(2)
  };
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

  // Grouper par numéro de TVA (version nettoyée)
  const groupedByVAT: Record<string, OrderData[]> = {};
  
  intracomOrders.forEach(order => {
    const cleanedVatNumber = cleanVATNumber(order.vatNumber);
    if (!cleanedVatNumber) return; // Ignorer les numéros de TVA vides
    
    if (!groupedByVAT[cleanedVatNumber]) {
      groupedByVAT[cleanedVatNumber] = [];
    }
    groupedByVAT[cleanedVatNumber].push(order);
  });

  // Créer une ligne consolidée pour chaque client (numéro de TVA)
  Object.entries(groupedByVAT).forEach(([vatNumber, orders]) => {
    const firstOrder = orders[0];
    const totalAmount = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    consolidatedData.push({
      company: firstOrder.company,
      vatNumber: vatNumber, // Using cleaned VAT number
      totalAmount: totalAmount,
      orderCount: orders.length,
      originalOrders: orders
    });
  });

  // Trier par numéro de TVA par ordre alphabétique (A-Z)
  return consolidatedData.sort((a, b) => a.vatNumber.localeCompare(b.vatNumber));
};
