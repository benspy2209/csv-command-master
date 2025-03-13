
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { OrderData } from "@/pages/Index";
import { exportToCSV, exportToPDF, exportConsolidatedToCSV, exportConsolidatedToPDF } from "@/utils/exportUtils";
import { ViewMode } from "@/components/DataFilters";

interface ConsolidatedData {
  company: string;
  vatNumber: string;
  totalAmount: number;
  orderCount: number;
  originalOrders: OrderData[];
}

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
  viewMode?: ViewMode;
  consolidatedData?: ConsolidatedData[];
}

export function ExportButtons({ 
  filteredData, 
  selectedMonth, 
  showIntracomOnly, 
  stats,
  viewMode = "all",
  consolidatedData = []
}: ExportButtonsProps) {
  const handleCSVExport = () => {
    if (viewMode === "consolidated" && consolidatedData) {
      exportConsolidatedToCSV(consolidatedData, selectedMonth);
    } else {
      exportToCSV(filteredData, selectedMonth, showIntracomOnly);
    }
  };

  const handlePDFExport = () => {
    if (viewMode === "consolidated" && consolidatedData) {
      exportConsolidatedToPDF(consolidatedData, selectedMonth, stats);
    } else {
      exportToPDF(filteredData, selectedMonth, showIntracomOnly, stats);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleCSVExport}
      >
        <Download className="h-4 w-4 mr-2" />
        Exporter en CSV
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handlePDFExport}
      >
        <Printer className="h-4 w-4 mr-2" />
        Exporter en PDF
      </Button>
    </div>
  );
}
