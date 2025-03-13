
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { OrderData } from "@/pages/Index";
import { exportToCSV, exportToPDF } from "@/utils/exportUtils";

interface ExportButtonsProps {
  filteredData: OrderData[];
  selectedMonth: string | null;
  showIntracomOnly: boolean;
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
  };
}

export function ExportButtons({ 
  filteredData, 
  selectedMonth, 
  showIntracomOnly, 
  stats 
}: ExportButtonsProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => exportToCSV(filteredData, selectedMonth, showIntracomOnly)}
      >
        <Download className="h-4 w-4 mr-2" />
        Exporter en CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => exportToPDF(filteredData, selectedMonth, showIntracomOnly, stats)}
      >
        <Printer className="h-4 w-4 mr-2" />
        Exporter en PDF
      </Button>
    </div>
  );
}
