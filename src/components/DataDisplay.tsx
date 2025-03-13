
import { useState, useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataVisualization } from "@/components/DataVisualization";
import { DataFilters } from "@/components/DataFilters";
import { OrdersTable } from "@/components/OrdersTable";
import { StatisticsPanel } from "@/components/StatisticsPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { 
  getUniqueMonths, 
  getUniqueCompanies, 
  filterData, 
  calculateStats 
} from "@/utils/dataProcessingUtils";

interface DataDisplayProps {
  data: OrderData[];
}

export function DataDisplay({ data }: DataDisplayProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showIntracomOnly, setShowIntracomOnly] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  
  const months = useMemo(() => getUniqueMonths(data), [data]);
  const companies = useMemo(() => getUniqueCompanies(data), [data]);
  
  // Sélectionner le mois le plus récent par défaut
  useMemo(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Gérer les changements de montant
  const handleAmountChange = (min: number | null, max: number | null) => {
    setMinAmount(min);
    setMaxAmount(max);
  };

  // Filtrer les données selon les critères
  const filteredData = useMemo(() => 
    filterData(
      data, 
      selectedMonth, 
      showIntracomOnly,
      selectedCompany,
      minAmount,
      maxAmount,
      searchTerm
    ), 
    [data, selectedMonth, showIntracomOnly, selectedCompany, minAmount, maxAmount, searchTerm]
  );

  // Calculer les statistiques
  const stats = useMemo(() => 
    calculateStats(filteredData), 
    [filteredData]
  );

  return (
    <div className="space-y-6">
      <DataFilters 
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        showIntracomOnly={showIntracomOnly}
        onIntracomChange={setShowIntracomOnly}
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onAmountChange={handleAmountChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <StatisticsPanel stats={stats} />

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="table">Tableau</TabsTrigger>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
          </TabsList>
        
          <TabsContent value="table" className="mt-4">
            <OrdersTable filteredData={filteredData} />
          </TabsContent>
          
          <TabsContent value="charts" className="mt-4">
            <DataVisualization data={filteredData} />
          </TabsContent>
        </Tabs>
        
        <ExportButtons 
          filteredData={filteredData}
          selectedMonth={selectedMonth}
          showIntracomOnly={showIntracomOnly}
          stats={stats}
        />
      </div>
    </div>
  );
}
