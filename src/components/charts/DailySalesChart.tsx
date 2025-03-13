
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

interface DailySalesChartProps {
  data: OrderData[];
}

export function DailySalesChart({ data }: DailySalesChartProps) {
  // Regrouper les données par jour pour le graphique à barres
  const dailyData = useMemo(() => {
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

  // Formater les montants en euros
  const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

  // Vérifier si des données sont disponibles pour afficher les graphiques
  const hasVentesByDay = dailyData.length > 0 && dailyData[0].date !== "Aucune donnée";

  return (
    <div className="bg-background border rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Ventes par jour</h3>
      {hasVentesByDay ? (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dailyData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatCurrency} 
                tick={{ fill: '#666', fontSize: 12 }}
                width={80}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                labelFormatter={(label) => `Date: ${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  padding: '10px'
                }}
              />
              <Bar 
                dataKey="amount" 
                fill="#0088FE" 
                name="Montant" 
                radius={[4, 4, 0, 0]}
                barSize={30}
              >
                <LabelList 
                  dataKey="count" 
                  position="top" 
                  formatter={(value: number) => value > 0 ? `${value} cmd` : ""} 
                  fill="#666" 
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-72 flex items-center justify-center text-muted-foreground">
          Aucune donnée disponible pour la période sélectionnée
        </div>
      )}
    </div>
  );
}
