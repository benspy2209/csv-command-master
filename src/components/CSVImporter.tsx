
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderData } from "@/pages/Index";
import Papa from "papaparse";
import { AlertCircle, FileWarning } from "lucide-react";
import { cleanVATNumber, parseCommaNumber } from "@/utils/dataProcessingUtils";

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

  // Fonction pour normaliser les caractères accentués et spéciaux
  const normalizeString = (str: string): string => {
    if (!str) return "";
    // Normalise la chaîne en décomposant les caractères accentués
    // puis en les recomposant avec la forme normalisée
    return str.normalize("NFD").normalize("NFC");
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
      encoding: "UTF-8", // Force UTF-8 encoding
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

          // Get all headers from the file and normalize them to fix encoding issues
          const headers = Object.keys(results.data[0] || {}).map(header => normalizeString(header));
          console.log("En-têtes détectés:", headers);
          
          // Define possible column mappings (multiple possible names for each required field)
          const columnMappings = {
            date: [
              "Facture.Date", "Date", "OrderDate", "InvoiceDate", "Date.Facture",
              "Commande.Date", "DateFacture", "Invoice.Date", "Order.Date"
            ],
            totalTaxes: [
              "Commande.TotalTaxes", "TotalTaxes", "OrderTaxes", "Taxes", 
              "MontantTaxes", "Commande.MontantTaxes", "Taxes.Total", "Montant.Taxes"
            ],
            shippingVAT: [
              "Livraison.MontantTVA", "ShippingVAT", "LivraisonTVA", "TVA.Livraison",
              "Livraison.TVA", "TVALivraison", "Shipping.VAT", "DeliveryVAT"
            ],
            totalAmount: [
              "Commande.MontantTotal", "MontantTotal", "TotalAmount", "OrderTotal",
              "Total", "Montant", "Commande.Total", "Order.Amount", "Total.Order"
            ],
            company: [
              "Facturation.Société", "Société", "Company", "CompanyName", "Entreprise",
              "Facturation.Entreprise", "Facturation.Company", "Client.Société",
              "Société", "Facturation.Société", "Client.Société", "Client.Company",
              // Inclure des variantes pour tenir compte des problèmes d'encodage
              "Societe", "Facturation.Societe", "Client.Societe"
            ],
            vatNumber: [
              "Société.NII", "NII", "VATNumber", "NumeroTVA", "TVA", "VAT",
              "NumTVA", "Société.NII", "Société.TVA", "Company.VAT", "Company.VATNumber",
              "NoTVA", "Numero.TVA", "Société.TVA", "Société.NumTVA", "TVA.Numero",
              // Inclure des variantes pour tenir compte des problèmes d'encodage
              "Societe.NII", "Societe.TVA", "Societe.NumTVA"
            ]
          };
          
          // Find the actual headers in the file that match our required fields
          const fieldMappings: Record<string, string> = {};
          let missingFields: string[] = [];
          
          // Pour chaque champ requis, normaliser tous les noms possibles
          const normalizedColumnMappings: Record<string, string[]> = {};
          Object.entries(columnMappings).forEach(([fieldName, possibleNames]) => {
            normalizedColumnMappings[fieldName] = possibleNames.map(name => normalizeString(name));
          });
          
          // For each of our required fields
          Object.entries(normalizedColumnMappings).forEach(([fieldName, normalizedPossibleNames]) => {
            // Check if any of the possible column names exist in the headers
            const normalizedHeaders = headers.map(header => normalizeString(header));
            
            // Essaie de trouver un match en utilisant une comparaison insensible à la casse
            const matchIndex = normalizedPossibleNames.findIndex(name => 
              normalizedHeaders.some(header => header.toLowerCase() === name.toLowerCase())
            );
            
            if (matchIndex !== -1) {
              // Trouver l'en-tête exact tel qu'il apparaît dans le fichier
              const matchedNormalizedName = normalizedPossibleNames[matchIndex];
              const headerIndex = normalizedHeaders.findIndex(
                header => header.toLowerCase() === matchedNormalizedName.toLowerCase()
              );
              
              if (headerIndex !== -1) {
                fieldMappings[fieldName] = Object.keys(results.data[0] || {})[headerIndex];
                console.log(`Mapping trouvé pour ${fieldName}: ${fieldMappings[fieldName]}`);
              }
            } else {
              missingFields.push(columnMappings[fieldName][0]); // Add the primary name of the missing field
            }
          });
          
          if (missingFields.length > 0) {
            console.error("Colonnes manquantes:", missingFields);
            setError(`Colonnes manquantes: ${missingFields.join(", ")}`);
            return;
          }

          // Process the data using the mapped field names and handle encoding issues
          const processedData = (results.data as any[]).map((row, index) => {
            // Normalize the company name and other text fields to fix encoding issues
            const companyName = normalizeString(row[fieldMappings.company] || "");
            
            const totalTaxes = parseCommaNumber(row[fieldMappings.totalTaxes] || "0");
            const shippingVAT = parseCommaNumber(row[fieldMappings.shippingVAT] || "0");
            const totalAmount = parseCommaNumber(row[fieldMappings.totalAmount] || "0");
            const totalVAT = totalTaxes + shippingVAT;
            
            // Clean VAT number - remove spaces and dots
            const cleanedVatNumber = cleanVATNumber(row[fieldMappings.vatNumber] || "");
            
            return {
              id: `order-${index}`,
              date: row[fieldMappings.date],
              totalTaxes: totalTaxes,
              shippingVAT: shippingVAT,
              totalAmount: totalAmount,
              company: companyName,
              vatNumber: cleanedVatNumber,
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
              Le fichier doit contenir les colonnes: Facture.Date, 
              Commande.TotalTaxes, Livraison.MontantTVA, Commande.MontantTotal, 
              Facturation.Société, Société.NII (ou des noms similaires pour ces données)
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
