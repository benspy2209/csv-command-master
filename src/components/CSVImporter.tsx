
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderData } from "@/pages/Index";
import Papa from "papaparse";
import { AlertCircle, FileWarning } from "lucide-react";

interface CSVImporterProps {
  onCancel: () => void;
  onImportSuccess: (data: OrderData[]) => void;
}

export function CSVImporter({ onCancel, onImportSuccess }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
      console.log("Fichier sélectionné:", e.target.files[0].name);
    }
  };

  const processCSV = () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setIsProcessing(true);
    setError(null);
    console.log("Début du traitement du fichier:", file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsProcessing(false);
        try {
          console.log("Résultats du parsing:", results);
          
          if (results.errors && results.errors.length > 0) {
            console.error("Erreurs de parsing:", results.errors);
            setError(`Erreur lors de l'analyse du CSV: ${results.errors[0].message}`);
            return;
          }

          if (!results.data || results.data.length === 0) {
            setError("Le fichier CSV ne contient pas de données valides");
            return;
          }

          const requiredColumns = [
            "Facture.Date",
            "Commande.TotalTaxes",
            "Livraison.MontantTVA",
            "Commande.MontantTotal",
            "Facturation.Société",
            "Société.NII"
          ];

          // Vérifier que toutes les colonnes requises sont présentes
          const headers = Object.keys(results.data[0] || {});
          console.log("En-têtes détectés:", headers);
          
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            console.error("Colonnes manquantes:", missingColumns);
            setError(`Colonnes manquantes: ${missingColumns.join(", ")}`);
            return;
          }

          // Traiter les données
          const processedData = (results.data as any[]).map((row, index) => {
            const totalVAT = 
              (parseFloat(row["Commande.TotalTaxes"] || 0) + 
              parseFloat(row["Livraison.MontantTVA"] || 0));
            
            return {
              id: `order-${index}`,
              date: row["Facture.Date"],
              totalTaxes: parseFloat(row["Commande.TotalTaxes"] || 0),
              shippingVAT: parseFloat(row["Livraison.MontantTVA"] || 0),
              totalAmount: parseFloat(row["Commande.MontantTotal"] || 0),
              company: row["Facturation.Société"] || "",
              vatNumber: row["Société.NII"] || "",
              totalVAT: totalVAT
            };
          });

          console.log("Données traitées:", processedData.slice(0, 2));
          onImportSuccess(processedData);
        } catch (err) {
          console.error("Erreur lors du traitement:", err);
          setError(`Erreur lors du traitement des données: ${(err as Error).message}`);
        }
      },
      error: (err) => {
        console.error("Erreur de parsing:", err);
        setIsProcessing(false);
        setError(`Erreur lors de l'analyse du fichier: ${err.message}`);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Importer un fichier CSV</h2>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Sélectionnez un fichier CSV
            </label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              Le fichier doit contenir les colonnes: Facture.Date, Commande.TotalTaxes, 
              Livraison.MontantTVA, Commande.MontantTotal, Facturation.Société, Société.NII
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm">
              <FileWarning className="h-4 w-4 text-muted-foreground" />
              <span>{file.name} ({(file.size / 1024).toFixed(0)} Ko)</span>
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button 
              onClick={processCSV} 
              disabled={!file || isProcessing}
            >
              {isProcessing ? "Traitement en cours..." : "Importer"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
