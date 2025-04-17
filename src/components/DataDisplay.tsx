
import { useState, useMemo } from "react";
import { OrderData } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataVisualization } from "@/components/DataVisualization";
import { DataFilters, ViewMode } from "@/components/DataFilters";
import { OrdersTable } from "@/components/OrdersTable";
import { ConsolidatedIntracomTable } from "@/components/ConsolidatedIntracomTable";
import { StatisticsPanel } from "@/components/StatisticsPanel";
import { ExportButtons } from "@/components/ExportButtons";
import { 
  getUniqueMonths, 
  getUniqueCompanies, 
  filterData, 
  calculateStats,
  consolidateIntracomData
} from "@/utils/dataProcessingUtils";

interface DataDisplayProps {
  data: OrderData[];
}

export function DataDisplay({ data }: DataDisplayProps) {
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [showIntracomOnly, setShowIntracomOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("table");
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null } | null>(null);
  
  const months = useMemo(() => getUniqueMonths(data), [data]);
  const companies = useMemo(() => getUniqueCompanies(data), [data]);

  const handleAmountChange = (min: number | null, max: number | null) => {
    setMinAmount(min);
    setMaxAmount(max);
  };

  // Determine if we should apply intracom filter based on view mode
  const effectiveIntracomFilter = viewMode === "intracom" || viewMode === "consolidated" || showIntracomOnly;

  const filteredData = useMemo(() => 
    filterData(
      data, 
      selectedMonths, 
      effectiveIntracomFilter,
      selectedCompany,
      minAmount,
      maxAmount,
      searchTerm,
      dateRange
    ), 
    [data, selectedMonths, effectiveIntracomFilter, selectedCompany, minAmount, maxAmount, searchTerm, dateRange]
  );

  const consolidatedData = useMemo(() => 
    consolidateIntracomData(filteredData),
    [filteredData]
  );

  const stats = useMemo(() => 
    calculateStats(filteredData), 
    [filteredData]
  );

  // Sync view mode and intracom filter
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === "intracom" || mode === "consolidated") {
      // If enabling intracom or consolidated view, disable the advanced intracom filter
      setShowIntracomOnly(false);
    }
  };

  return (
    <div className="space-y-6">
      <DataFilters 
        months={months}
        selectedMonths={selectedMonths}
        onMonthsChange={setSelectedMonths}
        showIntracomOnly={showIntracomOnly}
        onIntracomChange={setShowIntracomOnly}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        minAmount={minAmount}
        maxAmount={maxAmount}
        onAmountChange={handleAmountChange}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <div className="flex justify-between items-center">
        <StatisticsPanel stats={stats} />
        <ExportButtons 
          filteredData={filteredData}
          selectedMonths={selectedMonths}
          showIntracomOnly={effectiveIntracomFilter}
          stats={stats}
          viewMode={viewMode}
          consolidatedData={consolidatedData}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="table">Tableau</TabsTrigger>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
        </TabsList>
      
        <TabsContent value="table" className="mt-4">
          {viewMode === "consolidated" ? (
            <ConsolidatedIntracomTable consolidatedData={consolidatedData} />
          ) : (
            <OrdersTable filteredData={filteredData} />
          )}
        </TabsContent>
        
        <TabsContent value="charts" className="mt-4">
          <DataVisualization data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
