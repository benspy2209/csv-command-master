
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LabelList
} from "recharts";

interface DataVisualizationProps {
  data: OrderData[];
}

// Couleurs pour les graphiques (palette améliorée)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57'];

export function DataVisualization({ data }: DataVisualizationProps) {
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

  // Données pour le graphique circulaire (par société)
  const companyData = useMemo(() => {
    // Si aucune donnée, créer une entrée par défaut
    if (data.length === 0) {
      return [{ name: "Aucune donnée", value: 100, percentage: "100%" }];
    }
    
    const companyMap = new Map<string, number>();
    
    data.forEach(order => {
      const company = order.company && order.company.trim() !== "" 
        ? order.company 
        : "Non spécifié";
      
      const currentTotal = companyMap.get(company) || 0;
      companyMap.set(company, currentTotal + order.totalAmount);
    });
    
    // Limiter à 5 sociétés + "Autres" pour éviter la surcharge du graphique
    const sortedEntries = Array.from(companyMap.entries())
      .sort((a, b) => b[1] - a[1]);
      
    const totalAmount = sortedEntries.reduce((sum, [_, value]) => sum + value, 0);
    
    if (sortedEntries.length <= 5) {
      return sortedEntries.map(([name, value]) => ({ 
        name, 
        value,
        percentage: `${Math.round((value / totalAmount) * 100)}%`
      }));
    }
    
    // Prendre les 4 premiers et regrouper le reste dans "Autres"
    const topEntries = sortedEntries.slice(0, 4);
    const othersValue = sortedEntries
      .slice(4)
      .reduce((sum, [, value]) => sum + value, 0);
      
    return [
      ...topEntries.map(([name, value]) => ({ 
        name, 
        value,
        percentage: `${Math.round((value / totalAmount) * 100)}%`
      })),
      { 
        name: "Autres", 
        value: othersValue,
        percentage: `${Math.round((othersValue / totalAmount) * 100)}%`
      }
    ];
  }, [data]);

  // Données pour analyser la répartition TVA / HT
  const vatData = useMemo(() => {
    // Si aucune donnée, créer une entrée par défaut
    if (data.length === 0) {
      return [
        { name: "Montant HT", value: 100, percentage: "100%" },
        { name: "TVA", value: 0, percentage: "0%" }
      ];
    }
    
    const totalAmount = data.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalVAT = data.reduce((sum, order) => sum + order.totalVAT, 0);
    const totalExcludingVAT = totalAmount - totalVAT;
    
    return [
      { 
        name: "Montant HT", 
        value: totalExcludingVAT,
        percentage: `${Math.round((totalExcludingVAT / totalAmount) * 100)}%`
      },
      { 
        name: "TVA", 
        value: totalVAT,
        percentage: `${Math.round((totalVAT / totalAmount) * 100)}%`
      }
    ];
  }, [data]);

  // Formater les montants en euros
  const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

  // Vérifier si des données sont disponibles pour afficher les graphiques
  const hasData = data.length > 0;
  const hasVentesByDay = dailyData.length > 0 && dailyData[0].date !== "Aucune donnée";

  return (
    <div className="space-y-8">
      <div className="bg-background border rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium mb-4">Ventes par jour</h3>
        {hasData && hasVentesByDay ? (
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Répartition par société</h3>
          {hasData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}`}
                  >
                    {companyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible pour la période sélectionnée
            </div>
          )}
        </div>
        
        <div className="bg-background border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium mb-4">Répartition HT / TVA</h3>
          {hasData ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vatData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percentage }) => `${name}: ${percentage}`}
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #f0f0f0',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center" 
                    formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground">
              Aucune donnée disponible pour la période sélectionnée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
