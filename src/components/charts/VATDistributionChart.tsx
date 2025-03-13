
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface VATDistributionChartProps {
  data: OrderData[];
}

export function VATDistributionChart({ data }: VATDistributionChartProps) {
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

  // Vérifier si des données sont disponibles
  const hasData = data.length > 0;

  return (
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
  );
}
