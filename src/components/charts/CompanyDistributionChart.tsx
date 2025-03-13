
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, getTooltipStyle, CHART_COLORS } from "@/utils/chartUtils";
import { normalizeText } from "@/utils/dataProcessingUtils";

interface CompanyDistributionChartProps {
  data: OrderData[];
}

export function CompanyDistributionChart({ data }: CompanyDistributionChartProps) {
  // Données pour le graphique circulaire (par société)
  const companyData = useMemo(() => {
    // Si aucune donnée, créer une entrée par défaut
    if (data.length === 0) {
      return [{ name: "Aucune donnée", value: 100, percentage: "100%" }];
    }
    
    const companyMap = new Map<string, number>();
    
    data.forEach(order => {
      // Ensure company name is properly normalized
      const company = order.company && order.company.trim() !== "" 
        ? normalizeText(order.company) 
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
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => formatCurrency(value as number)}
                contentStyle={getTooltipStyle()}
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
