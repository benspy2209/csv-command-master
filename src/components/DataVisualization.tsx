
import { useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { format, parse, isValid } from "date-fns";
import { fr } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

interface DataVisualizationProps {
  data: OrderData[];
}

// Couleurs pour les graphiques
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function DataVisualization({ data }: DataVisualizationProps) {
  // Regrouper les données par jour pour le graphique à barres
  const dailyData = useMemo(() => {
    const dailyMap = new Map<string, number>();
    
    data.forEach(order => {
      try {
        const date = parse(order.date, "dd/MM/yyyy", new Date());
        if (isValid(date)) {
          const day = format(date, "dd/MM");
          const currentTotal = dailyMap.get(day) || 0;
          dailyMap.set(day, currentTotal + order.totalAmount);
        }
      } catch (e) {
        // Ignorer les dates invalides
      }
    });
    
    // Convertir en tableau et trier par date
    return Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => {
        try {
          const dateA = parse(a.date, "dd/MM", new Date());
          const dateB = parse(b.date, "dd/MM", new Date());
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      });
  }, [data]);

  // Données pour le graphique circulaire (par société)
  const companyData = useMemo(() => {
    const companyMap = new Map<string, number>();
    
    data.forEach(order => {
      const company = order.company || "Non spécifié";
      const currentTotal = companyMap.get(company) || 0;
      companyMap.set(company, currentTotal + order.totalAmount);
    });
    
    // Limiter à 6 sociétés + "Autres" pour éviter la surcharge du graphique
    const sortedEntries = Array.from(companyMap.entries())
      .sort((a, b) => b[1] - a[1]);
      
    if (sortedEntries.length <= 6) {
      return sortedEntries.map(([name, value]) => ({ name, value }));
    }
    
    // Prendre les 5 premiers et regrouper le reste
    const topEntries = sortedEntries.slice(0, 5);
    const othersValue = sortedEntries
      .slice(5)
      .reduce((sum, [, value]) => sum + value, 0);
      
    return [
      ...topEntries.map(([name, value]) => ({ name, value })),
      { name: "Autres", value: othersValue }
    ];
  }, [data]);

  // Données pour analyser la répartition TVA / HT
  const vatData = useMemo(() => {
    const totalAmount = data.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalVAT = data.reduce((sum, order) => sum + order.totalVAT, 0);
    const totalExcludingVAT = totalAmount - totalVAT;
    
    return [
      { name: "Montant HT", value: totalExcludingVAT },
      { name: "TVA", value: totalVAT }
    ];
  }, [data]);

  // Formateur personnalisé pour les montants
  const formatCurrency = (value: number) => `${value.toFixed(2)} €`;

  return (
    <div className="space-y-8">
      <div className="bg-background border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-4">Ventes par jour</h3>
        <div className="h-72">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="amount" fill="#8884d8" name="Montant" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Pas assez de données pour afficher ce graphique</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Répartition par société</h3>
          <div className="h-72">
            {companyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {companyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Pas assez de données pour afficher ce graphique</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-background border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">Répartition HT / TVA</h3>
          <div className="h-72">
            {vatData.length > 0 && vatData[0].value + vatData[1].value > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vatData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#00C49F" />
                    <Cell fill="#FF8042" />
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Pas assez de données pour afficher ce graphique</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
