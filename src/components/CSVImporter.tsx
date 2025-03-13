import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { OrderData } from "@/pages/Index";
import Papa from "papaparse";
import { AlertCircle, FileWarning } from "lucide-react";
import { 
  cleanVATNumber, 
  parseCommaNumber, 
  normalizeText,
  isCompanyRelatedColumn,
  isVATNumberRelatedColumn,
  isActualCompanyNameColumn,
  isPersonNameColumn
} from "@/utils/formatUtils";

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

    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        setIsProcessing(false);
        setError("Erreur lors de la lecture du fichier");
        return;
      }

      let csvContent = event.target.result as string;
      
      Papa.parse(csvContent, {
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

            const rawData = results.data as Record<string, any>[];
            
            const normalizedData = rawData.map(row => {
              const newRow: Record<string, any> = {};
              Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = normalizeText(key);
                const normalizedValue = typeof value === 'string' ? normalizeText(value) : value;
                newRow[normalizedKey] = normalizedValue;
              });
              return newRow;
            });
            
            const rawHeaders = Object.keys(normalizedData[0] || {});
            console.log("En-têtes détectés:", rawHeaders);
            
            const columnMappings = {
              date: [
                "Facture.Date", "Date", "OrderDate", "InvoiceDate", "Date.Facture",
                "Commande.Date", "DateFacture", "Invoice.Date", "Order.Date",
                "Date.Commande", "Date.Order", "Date.Invoice", "DateFacturation"
              ],
              totalTaxes: [
                "Commande.TotalTaxes", "TotalTaxes", "OrderTaxes", "Taxes", 
                "MontantTaxes", "Commande.MontantTaxes", "Taxes.Total", "Montant.Taxes",
                "Total.Taxes", "Taxes.Montant", "Montant.TVA", "TVA.Total"
              ],
              shippingVAT: [
                "Livraison.MontantTVA", "ShippingVAT", "LivraisonTVA", "TVA.Livraison",
                "Livraison.TVA", "TVALivraison", "Shipping.VAT", "DeliveryVAT",
                "Frais.Livraison.TVA", "Shipping.Tax", "Tax.Shipping"
              ],
              totalAmount: [
                "Commande.MontantTotal", "MontantTotal", "TotalAmount", "OrderTotal",
                "Total", "Montant", "Commande.Total", "Order.Amount", "Total.Order",
                "Montant.Commande", "Commande.Montant", "Total.Montant", "Amount.Total"
              ],
              company: [
                "Facturation.Société", "Société", "Company", "CompanyName", "Entreprise",
                "Facturation.Entreprise", "Facturation.Company", "Client.Société",
                "Société", "Facturation.Société", "Client.Société", "Client.Company",
                "Societe", "Facturation.Societe", "Client.Societe", "NomEntreprise",
                "Nom.Entreprise", "RaisonSociale", "Raison.Sociale", "Nom.Societe",
                "BusinessName", "Client.Name", "Customer.Company", "Client.BusinessName",
                "Nom.Commercial", "Etablissement", "Nom.Etablissement"
              ],
              firstName: [
                "Facturation.Prénom", "Facturation.Prenom", "Prénom", "Prenom", 
                "FirstName", "Client.Prénom", "Client.Prenom"
              ],
              lastName: [
                "Facturation.Nom", "Nom", "LastName", "Client.Nom", "Surname"
              ],
              vatNumber: [
                "Société.NII", "NII", "VATNumber", "NumeroTVA", "TVA", "VAT",
                "NumTVA", "Société.NII", "Société.TVA", "Company.VAT", "Company.VATNumber",
                "NoTVA", "Numero.TVA", "Société.TVA", "Société.NumTVA", "TVA.Numero",
                "Societe.NII", "Societe.TVA", "Societe.NumTVA", "NumeroTVA",
                "NumeroFiscal", "IdentifiantTVA", "Identifiant.TVA", "Identifiant.Fiscal",
                "SIRET", "SIREN", "Societe.SIRET", "Societe.SIREN", "Société.SIRET",
                "Company.TaxID", "TaxID", "Tax.Number", "Numero.Fiscal", "ID.Fiscal",
                "Client.TVA", "Client.NumTVA", "Customer.VATNumber"
              ]
            };
            
            const fieldMappings: Record<string, string> = {};
            let missingFields: string[] = [];
            
            const normalizedColumnMappings: Record<string, string[]> = {};
            Object.entries(columnMappings).forEach(([fieldName, possibleNames]) => {
              normalizedColumnMappings[fieldName] = possibleNames.map(name => normalizeText(name));
            });
            
            Object.entries(normalizedColumnMappings).forEach(([fieldName, normalizedPossibleNames]) => {
              if (fieldName === 'firstName' || fieldName === 'lastName') return;
              
              const matchIndex = normalizedPossibleNames.findIndex(name => 
                rawHeaders.some(header => normalizeText(header) === name || normalizeText(header).includes(name))
              );
              
              if (matchIndex !== -1) {
                const matchedNormalizedName = normalizedPossibleNames[matchIndex];
                const headerIndex = rawHeaders.findIndex(
                  header => normalizeText(header) === matchedNormalizedName || normalizeText(header).includes(matchedNormalizedName)
                );
                
                if (headerIndex !== -1) {
                  fieldMappings[fieldName] = rawHeaders[headerIndex];
                  console.log(`Mapping trouvé pour ${fieldName}: ${fieldMappings[fieldName]}`);
                }
              } 
              else if (fieldName === 'company' || fieldName === 'vatNumber') {
                if (fieldName === 'company') {
                  const companyNameIndex = rawHeaders.findIndex(header => 
                    isActualCompanyNameColumn(header)
                  );
                  
                  if (companyNameIndex !== -1) {
                    fieldMappings[fieldName] = rawHeaders[companyNameIndex];
                    console.log(`Mapping de nom réel d'entreprise trouvé: ${fieldMappings[fieldName]}`);
                  } else {
                    const companyRelatedIndex = rawHeaders.findIndex(header => 
                      isCompanyRelatedColumn(header)
                    );
                    
                    if (companyRelatedIndex !== -1) {
                      fieldMappings[fieldName] = rawHeaders[companyRelatedIndex];
                      console.log(`Mapping d'entreprise générique trouvé: ${fieldMappings[fieldName]}`);
                    } else {
                      const firstNameIndex = rawHeaders.findIndex(header => 
                        normalizedColumnMappings.firstName.some(name => 
                          normalizeText(header).includes(name)
                        )
                      );
                      
                      const lastNameIndex = rawHeaders.findIndex(header => 
                        normalizedColumnMappings.lastName.some(name => 
                          normalizeText(header).includes(name)
                        )
                      );
                      
                      if (firstNameIndex !== -1) {
                        fieldMappings['firstName'] = rawHeaders[firstNameIndex];
                        console.log(`Mapping pour prénom trouvé: ${fieldMappings['firstName']}`);
                      }
                      
                      if (lastNameIndex !== -1) {
                        fieldMappings['lastName'] = rawHeaders[lastNameIndex];
                        console.log(`Mapping pour nom trouvé: ${fieldMappings['lastName']}`);
                      }
                      
                      if (firstNameIndex !== -1 || lastNameIndex !== -1) {
                        fieldMappings[fieldName] = "__person_name__";
                        console.log(`Utilisation des champs de nom de personne pour l'entreprise`);
                      } else {
                        const clientIdIndex = rawHeaders.findIndex(header => 
                          normalizeText(header).includes("client.identifiant") ||
                          normalizeText(header).includes("client.id")
                        );
                        
                        if (clientIdIndex !== -1) {
                          fieldMappings[fieldName] = rawHeaders[clientIdIndex];
                          console.log(`Utilisation d'identifiant client comme nom: ${fieldMappings[fieldName]}`);
                        } else {
                          console.warn("Aucune colonne d'entreprise trouvée, utilisation de valeurs par défaut");
                          fieldMappings[fieldName] = "__company__";
                        }
                      }
                    }
                  }
                }
                else if (fieldName === 'vatNumber') {
                  const vatColumnIndex = rawHeaders.findIndex(header => 
                    isVATNumberRelatedColumn(header)
                  );
                  
                  if (vatColumnIndex !== -1) {
                    fieldMappings[fieldName] = rawHeaders[vatColumnIndex];
                    console.log(`Mapping pour TVA trouvé: ${fieldMappings[fieldName]}`);
                  } else {
                    console.warn("Aucune colonne de TVA trouvée, utilisation de valeurs par défaut");
                    fieldMappings[fieldName] = "__vatNumber__";
                  }
                }
              }
              
              if (!fieldMappings[fieldName] && fieldName !== 'company' && fieldName !== 'vatNumber') {
                missingFields.push(columnMappings[fieldName][0]);
              }
            });
            
            if (missingFields.length > 0) {
              console.error("Colonnes manquantes:", missingFields);
              setError(`Colonnes manquantes: ${missingFields.join(", ")}`);
              return;
            }

            const processedData = normalizedData.map((row, index) => {
              let companyName = "";
              
              if (fieldMappings.company === "__company__") {
                companyName = `Client ${index + 1}`;
              } else if (fieldMappings.company === "__person_name__") {
                const firstName = fieldMappings.firstName ? normalizeText(row[fieldMappings.firstName] || "") : "";
                const lastName = fieldMappings.lastName ? normalizeText(row[fieldMappings.lastName] || "") : "";
                
                if (firstName || lastName) {
                  companyName = `${firstName} ${lastName}`.trim();
                } else {
                  companyName = `Client ${index + 1}`;
                }
              } else {
                companyName = normalizeText(row[fieldMappings.company] || "");
                
                if (/^\d+$/.test(companyName)) {
                  const firstName = fieldMappings.firstName ? normalizeText(row[fieldMappings.firstName] || "") : "";
                  const lastName = fieldMappings.lastName ? normalizeText(row[fieldMappings.lastName] || "") : "";
                  
                  if (firstName || lastName) {
                    companyName = `${firstName} ${lastName}`.trim();
                  } else {
                    companyName = `Client ${companyName}`;
                  }
                }
              }
              
              const totalTaxes = parseCommaNumber(row[fieldMappings.totalTaxes] || "0");
              const shippingVAT = parseCommaNumber(row[fieldMappings.shippingVAT] || "0");
              const totalAmount = parseCommaNumber(row[fieldMappings.totalAmount] || "0");
              const totalVAT = totalTaxes + shippingVAT;
              
              let vatNumber = "";
              if (fieldMappings.vatNumber === "__vatNumber__") {
                vatNumber = `TVA${index + 1}`;
              } else {
                vatNumber = cleanVATNumber(row[fieldMappings.vatNumber] || "");
              }
              
              return {
                id: `order-${index}`,
                date: row[fieldMappings.date],
                totalTaxes: totalTaxes,
                shippingVAT: shippingVAT,
                totalAmount: totalAmount,
                company: companyName,
                vatNumber: vatNumber,
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
    
    reader.onerror = () => {
      setIsProcessing(false);
      setError("Erreur lors de la lecture du fichier");
    };
    
    reader.readAsText(file, 'ISO-8859-1');
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
