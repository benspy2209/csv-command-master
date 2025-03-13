
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface CompanyDistributionChartProps {
  data: OrderData[];
}

// Couleurs pour les graphiques (palette améliorée)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#d0ed57'];

export function CompanyDistributionChart({ data }: CompanyDistributionChartProps) {
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

  // Formater les montants en euros
  const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

  // Vérifier si des données sont disponibles
  const hasData = data.length > 0;

  return (
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
  );
}
