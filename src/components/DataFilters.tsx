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

interface DataFiltersProps {
  months: string[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
  showIntracomOnly: boolean;
  onIntracomChange: (show: boolean) => void;
  companies: string[];
  onCompanyChange: (company: string | null) => void;
  selectedCompany: string | null;
  minAmount: number | null;
  maxAmount: number | null;
  onAmountChange: (min: number | null, max: number | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function DataFilters({ 
  months, 
  selectedMonth, 
  onMonthChange, 
  showIntracomOnly, 
  onIntracomChange,
  companies,
  onCompanyChange,
  selectedCompany,
  minAmount,
  maxAmount,
  onAmountChange,
  searchTerm,
  onSearchChange
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
    onMonthChange(null);
    onIntracomChange(false);
    onCompanyChange(null);
    onAmountChange(null, null);
    onSearchChange("");
    setLocalMinAmount("");
    setLocalMaxAmount("");
  };

  const applyAmountFilter = () => {
    const min = localMinAmount ? parseFloat(localMinAmount) : null;
    const max = localMaxAmount ? parseFloat(localMaxAmount) : null;
    onAmountChange(min, max);
  };

  const hasActiveFilters = selectedMonth !== null || showIntracomOnly || 
    selectedCompany !== null || minAmount !== null || maxAmount !== null || searchTerm !== "";

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
            value={selectedMonth || "all"} 
            onValueChange={(value) => onMonthChange(value === "all" ? null : value)}
          >
            <SelectTrigger className="h-9 w-auto md:w-48">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Tous les mois" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les mois</SelectItem>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonth(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                {isOpen ? "Masquer les filtres" : "Plus de filtres"}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Période détaillée</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {months.map(month => (
                      <Button
                        key={month}
                        variant={selectedMonth === month ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => onMonthChange(selectedMonth === month ? null : month)}
                      >
                        {formatMonth(month)}
                      </Button>
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
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="intracom" 
                      checked={showIntracomOnly}
                      onCheckedChange={(checked) => onIntracomChange(checked === true)}
                    />
                    <label
                      htmlFor="intracom"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Afficher uniquement les commandes intracom
                    </label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Commandes avec TVA à 0€ et numéro de TVA renseigné
                  </p>
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
          {selectedMonth && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => onMonthChange(null)}
            >
              {formatMonth(selectedMonth)} ✕
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
              Intracom uniquement ✕
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
