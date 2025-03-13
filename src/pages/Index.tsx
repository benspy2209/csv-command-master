
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { CSVImporter } from "@/components/CSVImporter";
import { DataDisplay } from "@/components/DataDisplay";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "@/components/ui/use-toast";

// Types for our data model - updated to use strings for all numeric values to preserve decimals
export interface OrderData {
  id: string;
  date: string;
  totalTaxes: string;
  shippingVAT: string;
  totalAmount: string;
  company: string;
  vatNumber: string;
  totalVAT: string;
}

const Index = () => {
  const [data, setData] = useLocalStorage<OrderData[]>("ecommerce-orders", []);
  const [isImporting, setIsImporting] = useState(false);

  const handleImportSuccess = (importedData: OrderData[]) => {
    setData(importedData);
    setIsImporting(false);
    toast({
      title: "Import réussi",
      description: `${importedData.length} commandes ont été importées avec succès.`,
    });
  };

  // Fonction pour effacer toutes les données
  const clearAllData = () => {
    setData([]);
    toast({
      title: "Données effacées",
      description: "Toutes les données ont été supprimées.",
    });
  };

  // Réinitialiser les données au chargement de la page
  useState(() => {
    clearAllData();
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col items-center gap-4">
          <img 
            src="/lovable-uploads/34efeec5-1973-4033-a624-e7cd9d290f53.png" 
            alt="Crème de Bronzage" 
            className="h-24 w-auto"
          />
          <div className="text-center">
            <h1 className="text-3xl font-bold">Gestionnaire de Commandes E-commerce</h1>
            <p className="text-muted-foreground">
              Importez, analysez et exportez vos données de commandes.
            </p>
          </div>
        </header>

        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-6 rounded-lg border border-dashed p-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Upload className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium">Aucune donnée importée</h3>
              <p className="text-sm text-muted-foreground">
                Commencez par importer votre fichier CSV contenant les données de commandes.
              </p>
            </div>
            <Button onClick={() => setIsImporting(true)}>Importer un fichier CSV</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Données importées ({data.length} commandes)</h2>
              <div className="space-x-2">
                <Button variant="outline" onClick={clearAllData}>Effacer les données</Button>
                <Button onClick={() => setIsImporting(true)}>Importer un nouveau fichier</Button>
              </div>
            </div>
            <DataDisplay data={data} />
          </div>
        )}

        {isImporting && (
          <CSVImporter 
            onCancel={() => setIsImporting(false)} 
            onImportSuccess={handleImportSuccess} 
          />
        )}
      </div>
    </div>
  );
};

export default Index;
