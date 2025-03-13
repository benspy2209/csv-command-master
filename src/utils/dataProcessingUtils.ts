
import { OrderData } from "@/pages/Index";
import { format, parse } from "date-fns";

// Fonction pour générer une liste unique de mois à partir des données
export const getUniqueMonths = (data: OrderData[]) => {
  const months = new Set<string>();
  
  data.forEach(order => {
    try {
      const date = parse(order.date, "dd/MM/yyyy", new Date());
      const monthKey = format(date, "yyyy-MM");
      months.add(monthKey);
    } catch (e) {
      // Ignorer les dates invalides
    }
  });
  
  return Array.from(months).sort().reverse();
};

// Filtrer les données selon les critères
export const filterData = (
  data: OrderData[], 
  selectedMonth: string | null, 
  showIntracomOnly: boolean
) => {
  return data.filter(order => {
    let keepItem = true;
    
    // Filtre par mois
    if (selectedMonth) {
      try {
        const date = parse(order.date, "dd/MM/yyyy", new Date());
        const orderMonth = format(date, "yyyy-MM");
        if (orderMonth !== selectedMonth) {
          keepItem = false;
        }
      } catch {
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
    
    return keepItem;
  });
};

// Calculer les statistiques
export const calculateStats = (filteredData: OrderData[]) => {
  const total = filteredData.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalVAT = filteredData.reduce((sum, order) => sum + order.totalVAT, 0);
  const totalExcludingVAT = total - totalVAT;
  const orderCount = filteredData.length;
  
  return {
    total: total.toFixed(2),
    totalVAT: totalVAT.toFixed(2),
    totalExcludingVAT: totalExcludingVAT.toFixed(2),
    orderCount
  };
};
