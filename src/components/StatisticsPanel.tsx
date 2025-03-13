
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
    // Conserver précisément le montant à 2 décimales et utiliser la virgule
    return amount.replace('.', ',') + ' €';
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
