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
  
  useMemo(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  const handleAmountChange = (min: number | null, max: number | null) => {
    setMinAmount(min);
    setMaxAmount(max);
  };

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
      
      <div className="flex justify-between items-center">
        <StatisticsPanel stats={stats} />
        <ExportButtons 
          filteredData={filteredData}
          selectedMonth={selectedMonth}
          showIntracomOnly={showIntracomOnly}
          stats={stats}
        />
      </div>

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
    </div>
  );
}
