
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { format, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { parseOrderDate } from "@/utils/dataProcessingUtils";

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
    
    data.forEach(order => {
      if (!order.date) return;
      
      const date = parseOrderDate(order.date);
      if (!date || !isValid(date)) {
        console.error("Date invalide après analyse:", order.date);
        return;
      }
      
      const day = format(date, "dd/MM", { locale: fr });
      const currentData = dailyMap.get(day) || { amount: 0, count: 0 };
      
      // S'assurer d'utiliser des valeurs numériques précises
      const orderAmount = parseFloat(order.totalAmount.toFixed(2));
      
      dailyMap.set(day, { 
        amount: parseFloat((currentData.amount + orderAmount).toFixed(2)),
        count: currentData.count + 1
      });
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
    
    return result;
  }, [data]);
}
