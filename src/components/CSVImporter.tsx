
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

          // Get all headers from the file
          const headers = Object.keys(results.data[0] || {});
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
              "Soci�t�", "Facturation.Soci�t�", "Client.Soci�t�", "Client.Company"
            ],
            vatNumber: [
              "Société.NII", "NII", "VATNumber", "NumeroTVA", "TVA", "VAT",
              "NumTVA", "Soci�t�.NII", "Soci�t�.TVA", "Company.VAT", "Company.VATNumber",
              "NoTVA", "Numero.TVA", "Société.TVA", "Société.NumTVA", "TVA.Numero"
            ]
          };
          
          // Find the actual headers in the file that match our required fields
          const fieldMappings: Record<string, string> = {};
          let missingFields: string[] = [];
          
          // For each of our required fields
          Object.entries(columnMappings).forEach(([fieldName, possibleNames]) => {
            // Check if any of the possible column names exist in the headers
            const matchedHeader = possibleNames.find(name => 
              headers.some(header => header.toLowerCase() === name.toLowerCase())
            );
            
            if (matchedHeader) {
              // Find the exact case-sensitive header name as it appears in the file
              const exactHeader = headers.find(
                header => header.toLowerCase() === matchedHeader.toLowerCase()
              );
              if (exactHeader) {
                fieldMappings[fieldName] = exactHeader;
              }
            } else {
              missingFields.push(possibleNames[0]); // Add the primary name of the missing field
            }
          });
          
          if (missingFields.length > 0) {
            console.error("Colonnes manquantes:", missingFields);
            setError(`Colonnes manquantes: ${missingFields.join(", ")}`);
            return;
          }

          // Process the data using the mapped field names
          const processedData = (results.data as any[]).map((row, index) => {
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
              company: row[fieldMappings.company] || "",
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
