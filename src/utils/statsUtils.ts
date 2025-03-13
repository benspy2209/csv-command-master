
import { OrderData } from "@/pages/Index";
import { cleanVATNumber } from "./formatUtils";

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
