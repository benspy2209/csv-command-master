
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";

interface DailySalesData {
  date: string;
  amount: number;
  count: number;
}

export function useDailySalesData(data: OrderData[]): DailySalesData[] {
  return useMemo(() => {
    if (data.length === 0) {
      return [{ date: "Aucune donnée", amount: 0, count: 0 }];
    }

    const dailyMap = new Map<string, { amount: number, count: number }>();
    
    // Format de date attendu: dd/MM/yyyy
    data.forEach(order => {
      if (!order.date) return;
      
      // Validez et normalisez le format de date
      const dateStr = order.date.trim();
      if (!dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        console.error("Format de date invalide:", dateStr);
        return;
      }
      
      try {
        const date = parse(dateStr, "dd/MM/yyyy", new Date());
        
        if (!isValid(date)) {
          console.error("Date invalide après analyse:", dateStr);
          return;
        }
        
        const day = format(date, "dd/MM", { locale: fr });
        const currentData = dailyMap.get(day) || { amount: 0, count: 0 };
        
        dailyMap.set(day, { 
          amount: currentData.amount + order.totalAmount,
          count: currentData.count + 1
        });
      } catch (e) {
        console.error("Erreur lors du traitement de la date:", dateStr, e);
      }
    });
    
    // Convertir en tableau
    const result = Array.from(dailyMap.entries())
      .map(([date, values]) => ({ 
        date, 
        amount: values.amount,
        count: values.count 
      }));
    
    // Tri par date (jour/mois)
    result.sort((a, b) => {
      // Extraire jour et mois
      const [dayA, monthA] = a.date.split('/').map(Number);
      const [dayB, monthB] = b.date.split('/').map(Number);
      
      // Comparer d'abord par mois puis par jour
      if (monthA !== monthB) return monthA - monthB;
      return dayA - dayB;
    });
    
    // Si aucune donnée après traitement
    if (result.length === 0) {
      return [{ date: "Aucune donnée", amount: 0, count: 0 }];
    }
    
    console.log("Données journalières:", result);
    return result;
  }, [data]);
}
