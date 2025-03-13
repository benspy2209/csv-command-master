
import { format, parse, isValid, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { OrderData } from "@/pages/Index";

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
