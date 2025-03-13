
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency, getTooltipStyle, CHART_COLORS } from "@/utils/chartUtils";

interface CompanyDistributionChartProps {
  data: OrderData[];
}

export function CompanyDistributionChart({ data }: CompanyDistributionChartProps) {
  // Préparer les données par société
  const companyData = useMemo(() => {
    if (data.length === 0) {
      return [{ name: "Aucune donnée", value: 100 }];
    }
    
    // Calculer le total par société
    const companyMap = new Map<string, number>();
    
    data.forEach(order => {
      const company = order.company 
        ? order.company 
        : "Non spécifié";
      
      // Convertir le montant en nombre avec précision maximale
      const orderAmount = parseFloat(String(order.totalAmount).replace(',', '.'));
      
      const currentTotal = companyMap.get(company) || 0;
      companyMap.set(company, currentTotal + orderAmount);
    });
    
    // Limiter à 5 sociétés + "Autres" pour éviter la surcharge du graphique
    const sortedCompanies = Array.from(companyMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    const topCompanies = sortedCompanies.slice(0, 5);
    
    // Regrouper les autres sociétés
    if (sortedCompanies.length > 5) {
      const othersTotal = sortedCompanies
        .slice(5)
        .reduce((sum, [_, amount]) => sum + amount, 0);
      
      if (othersTotal > 0) {
        topCompanies.push(["Autres", othersTotal]);
      }
    }
    
    // Formater pour le graphique
    return topCompanies.map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
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
                labelLine={false}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {companyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill || CHART_COLORS[index % CHART_COLORS.length]} />
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
