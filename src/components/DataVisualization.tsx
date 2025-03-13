
import { OrderData } from "@/pages/Index";
import { DailySalesChart } from "@/components/charts/DailySalesChart";
import { CompanyDistributionChart } from "@/components/charts/CompanyDistributionChart";
import { VATDistributionChart } from "@/components/charts/VATDistributionChart";

interface DataVisualizationProps {
  data: OrderData[];
}

export function DataVisualization({ data }: DataVisualizationProps) {
  return (
    <div className="space-y-8">
      <DailySalesChart data={data} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompanyDistributionChart data={data} />
        <VATDistributionChart data={data} />
      </div>
    </div>
  );
}
