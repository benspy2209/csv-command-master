
import { OrderData } from "@/pages/Index";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from "recharts";
import { useDailySalesData } from "@/hooks/useDailySalesData";
import { formatCurrency, getTooltipStyle, CHART_COLORS } from "@/utils/chartUtils";

interface DailySalesChartProps {
  data: OrderData[];
}

export function DailySalesChart({ data }: DailySalesChartProps) {
  // Use custom hook to get daily sales data
  const dailyData = useDailySalesData(data);

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
                contentStyle={getTooltipStyle()}
              />
              <Bar 
                dataKey="amount" 
                fill={CHART_COLORS[0]} 
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
