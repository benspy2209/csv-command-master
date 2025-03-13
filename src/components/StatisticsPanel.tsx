
import { OrderData } from "@/pages/Index";

interface StatisticsPanelProps {
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
  };
}

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  // Fonction pour formater les montants en préservant toutes les décimales
  const formatCurrency = (amount: string) => {
    // Si le montant contient déjà une virgule, ne rien changer
    if (amount.includes(',')) {
      return `${amount} €`;
    }
    
    // Si le montant contient un point, le remplacer par une virgule
    if (amount.includes('.')) {
      return `${amount.replace('.', ',')} €`;
    }
    
    // Si le montant n'a pas de décimales, ajouter ",00"
    return `${amount},00 €`;
  };

  return (
    <div className="bg-muted/30 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-background p-4 rounded-md shadow-sm">
        <div className="text-sm text-muted-foreground">Nombre de commandes</div>
        <div className="text-2xl font-bold">{stats.orderCount}</div>
      </div>
      <div className="bg-background p-4 rounded-md shadow-sm">
        <div className="text-sm text-muted-foreground">Total HT</div>
        <div className="text-2xl font-bold">{formatCurrency(stats.totalExcludingVAT)}</div>
      </div>
      <div className="bg-background p-4 rounded-md shadow-sm">
        <div className="text-sm text-muted-foreground">Total TVA</div>
        <div className="text-2xl font-bold">{formatCurrency(stats.totalVAT)}</div>
      </div>
      <div className="bg-background p-4 rounded-md shadow-sm">
        <div className="text-sm text-muted-foreground">Total TTC</div>
        <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
      </div>
    </div>
  );
}
