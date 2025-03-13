
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterX, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DataFiltersProps {
  months: string[];
  selectedMonth: string | null;
  onMonthChange: (month: string | null) => void;
  showIntracomOnly: boolean;
  onIntracomChange: (show: boolean) => void;
}

export function DataFilters({ 
  months, 
  selectedMonth, 
  onMonthChange, 
  showIntracomOnly, 
  onIntracomChange 
}: DataFiltersProps) {
  // Formater l'affichage du mois
  const formatMonth = (monthKey: string) => {
    try {
      const date = parse(monthKey, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy", { locale: fr });
    } catch {
      return monthKey;
    }
  };

  // Réinitialiser tous les filtres
  const resetFilters = () => {
    onMonthChange(null);
    onIntracomChange(false);
  };

  const hasActiveFilters = selectedMonth !== null || showIntracomOnly;

  return (
    <div className="bg-muted/30 p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filtres
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8">
            <FilterX className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Période</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {months.map(month => (
              <Button
                key={month}
                variant={selectedMonth === month ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => onMonthChange(month === selectedMonth ? null : month)}
              >
                {formatMonth(month)}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Options</Label>
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
          <p className="text-xs text-muted-foreground mt-1">
            Commandes avec TVA à 0€ et numéro de TVA renseigné
          </p>
        </div>
      </div>
    </div>
  );
}
