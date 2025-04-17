
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterX, Filter, Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ViewMode = "all" | "intracom" | "consolidated";

interface DataFiltersProps {
  months: string[];
  selectedMonths: string[];
  onMonthsChange: (months: string[]) => void;
  showIntracomOnly: boolean;
  onIntracomChange: (show: boolean) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  companies: string[];
  onCompanyChange: (company: string | null) => void;
  selectedCompany: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  onAmountChange: (min: number | null, max: number | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dateRange: { start: Date | null; end: Date | null } | null;
  onDateRangeChange: (range: { start: Date | null; end: Date | null } | null) => void;
}

export function DataFilters({ 
  months, 
  selectedMonths, 
  onMonthsChange, 
  showIntracomOnly, 
  onIntracomChange,
  viewMode,
  onViewModeChange,
  companies,
  onCompanyChange,
  selectedCompany,
  minAmount,
  maxAmount,
  onAmountChange,
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange
}: DataFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMinAmount, setLocalMinAmount] = useState(minAmount?.toString() || "");
  const [localMaxAmount, setLocalMaxAmount] = useState(maxAmount?.toString() || "");
  
  useEffect(() => {
    setLocalMinAmount(minAmount?.toString() || "");
    setLocalMaxAmount(maxAmount?.toString() || "");
  }, [minAmount, maxAmount]);

  const formatMonth = (monthKey: string) => {
    try {
      const date = parse(monthKey, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy", { locale: fr });
    } catch {
      return monthKey;
    }
  };

  const resetFilters = () => {
    onMonthsChange([]);
    onViewModeChange("all");
    onIntracomChange(false);
    onCompanyChange(null);
    onAmountChange(null, null);
    onSearchChange("");
    onDateRangeChange(null);
    setLocalMinAmount("");
    setLocalMaxAmount("");
  };

  const applyAmountFilter = () => {
    const min = localMinAmount ? parseFloat(localMinAmount) : null;
    const max = localMaxAmount ? parseFloat(localMaxAmount) : null;
    onAmountChange(min, max);
  };

  const hasActiveFilters = selectedMonths.length > 0 || viewMode !== "all" || 
    selectedCompany !== null || minAmount !== null || maxAmount !== null || 
    searchTerm !== "" || (dateRange && (dateRange.start || dateRange.end));

  const toggleMonth = (month: string) => {
    if (selectedMonths.includes(month)) {
      onMonthsChange(selectedMonths.filter(m => m !== month));
    } else {
      onMonthsChange([...selectedMonths, month]);
    }
  };

  // Sélecteurs de trimestres
  const selectQuarter = (quarter: number, year: string) => {
    const yearPrefix = year;
    const quarterMonths = [];
    
    // Déterminer quels mois appartiennent au trimestre sélectionné
    for (let i = 0; i < 3; i++) {
      const monthNum = (quarter - 1) * 3 + i + 1;
      const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
      const monthKey = `${yearPrefix}-${monthStr}`;
      
      // Vérifier si ce mois existe dans nos données
      if (months.includes(monthKey)) {
        quarterMonths.push(monthKey);
      }
    }
    
    // Ajouter ces mois à la sélection, en évitant les doublons
    const newSelection = [...selectedMonths];
    quarterMonths.forEach(month => {
      if (!newSelection.includes(month)) {
        newSelection.push(month);
      }
    });
    
    onMonthsChange(newSelection);
  };

  // Grouper les mois par année
  const monthsByYear: Record<string, string[]> = {};
  months.forEach(month => {
    const year = month.split('-')[0];
    if (!monthsByYear[year]) {
      monthsByYear[year] = [];
    }
    monthsByYear[year].push(month);
  });

  // Trier les années par ordre décroissant
  const years = Object.keys(monthsByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </h3>
        
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 h-9 md:w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          <Select 
            value={selectedMonths.length === 1 ? selectedMonths[0] : selectedMonths.length > 1 ? "multiple" : "all"} 
            onValueChange={(value) => {
              if (value === "all") {
                onMonthsChange([]);
              } else if (value !== "multiple" && !selectedMonths.includes(value)) {
                onMonthsChange([value]);
              }
            }}
          >
            <SelectTrigger className="h-9 w-auto md:w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder={
                selectedMonths.length === 0 ? "Tous les mois" :
                selectedMonths.length === 1 ? formatMonth(selectedMonths[0]) :
                `${selectedMonths.length} mois sélectionnés`
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              <SelectItem value="multiple" disabled={selectedMonths.length <= 1}>
                Sélection multiple ({selectedMonths.length})
              </SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <ToggleGroup 
            type="single" 
            value={viewMode}
            onValueChange={(value) => {
              if (value) onViewModeChange(value as ViewMode);
            }}
            className="border rounded-md h-9"
          >
            <ToggleGroupItem value="all" className="h-9">
              Toutes les ventes
            </ToggleGroupItem>
            <ToggleGroupItem value="intracom" className="h-9">
              Intracom
            </ToggleGroupItem>
            <ToggleGroupItem value="consolidated" className="h-9">
              Intracom consolidée
            </ToggleGroupItem>
          </ToggleGroup>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                {isOpen ? "Masquer les filtres" : "Plus de filtres"}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-4">
                  <div>
                    <Label className="flex justify-between">
                      <span>Périodes</span>
                      {selectedMonths.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 text-xs"
                          onClick={() => onMonthsChange([])}
                        >
                          Effacer la sélection
                        </Button>
                      )}
                    </Label>
                    
                    {years.map(year => (
                      <div key={year} className="mb-4">
                        <h4 className="text-sm font-medium mb-1">{year}</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => selectQuarter(1, year)}
                          >
                            T1 {year}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => selectQuarter(2, year)}
                          >
                            T2 {year}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => selectQuarter(3, year)}
                          >
                            T3 {year}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => selectQuarter(4, year)}
                          >
                            T4 {year}
                          </Button>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {monthsByYear[year].map(month => (
                            <div key={month} className="flex items-center space-x-2 rounded-md px-2 py-1">
                              <Checkbox 
                                id={`month-${month}`}
                                checked={selectedMonths.includes(month)}
                                onCheckedChange={() => toggleMonth(month)}
                              />
                              <label
                                htmlFor={`month-${month}`}
                                className="text-sm cursor-pointer"
                              >
                                {formatMonth(month).split(' ')[0]}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Société</Label>
                    <Select 
                      value={selectedCompany || "all"} 
                      onValueChange={(value) => onCompanyChange(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Toutes les sociétés" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les sociétés</SelectItem>
                        {companies.map(company => (
                          <SelectItem key={company} value={company}>{company}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Montant (€)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localMinAmount}
                        onChange={(e) => setLocalMinAmount(e.target.value)}
                        className="w-24"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localMaxAmount}
                        onChange={(e) => setLocalMaxAmount(e.target.value)}
                        className="w-24"
                      />
                      <Button 
                        size="sm" 
                        onClick={applyAmountFilter}
                        variant="outline"
                      >
                        Appliquer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label>Options avancées</Label>
                    <div className="flex items-center space-x-2 rounded-md px-3 py-1">
                      <Checkbox 
                        id="intracom-advanced" 
                        checked={showIntracomOnly}
                        onCheckedChange={(checked) => {
                          onIntracomChange(checked === true);
                          // Si on active l'intracom dans les filtres avancés, on désactive la vue consolidée
                          if (checked === true) {
                            onViewModeChange("intracom");
                          }
                        }}
                      />
                      <label
                        htmlFor="intracom-advanced"
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        Afficher uniquement les ventes intracom
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Commandes intracom : TVA à 0€ et numéro de TVA renseigné
                    </p>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="h-9">
              <FilterX className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-3 border-t">
          <h4 className="text-sm font-medium mr-2">Filtres actifs:</h4>
          {selectedMonths.length > 0 && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onMonthsChange([])}
            >
              {selectedMonths.length === 1 
                ? formatMonth(selectedMonths[0]) 
                : `${selectedMonths.length} mois sélectionnés`} ✕
            </Button>
          )}
          {viewMode !== "all" && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onViewModeChange("all")}
            >
              {viewMode === "intracom" ? "Intracom" : "Intracom consolidée"} ✕
            </Button>
          )}
          {selectedCompany && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onCompanyChange(null)}
            >
              {selectedCompany} ✕
            </Button>
          )}
          {(minAmount !== null || maxAmount !== null) && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onAmountChange(null, null)}
            >
              {minAmount !== null ? minAmount + "€" : "0€"} - {maxAmount !== null ? maxAmount + "€" : "∞"} ✕
            </Button>
          )}
          {showIntracomOnly && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onIntracomChange(false)}
            >
              Ventes intracom (filtre avancé) ✕
            </Button>
          )}
          {searchTerm && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onSearchChange("")}
            >
              "{searchTerm}" ✕
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
