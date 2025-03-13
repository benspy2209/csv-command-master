
import Papa from "papaparse";
import { OrderData } from "@/pages/Index";
import { cleanVATNumber, parseCommaNumber, fixEncodingIssues } from "@/utils/formatUtils";

interface ColumnMapping {
  [key: string]: string[];
}

interface FieldMappings {
  [key: string]: string;
}

// Define possible column mappings (multiple possible names for each required field)
export const columnMappings: ColumnMapping = {
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
    "Société", "Facturation.Société", "Client.Société", "Client.Company"
  ],
  vatNumber: [
    "Société.NII", "NII", "VATNumber", "NumeroTVA", "TVA", "VAT",
    "NumTVA", "Société.NII", "Société.TVA", "Company.VAT", "Company.VATNumber",
    "NoTVA", "Numero.TVA", "Société.TVA", "Société.NumTVA", "TVA.Numero"
  ]
};

// Find field mappings from headers
export const findFieldMappings = (headers: string[]): { fieldMappings: FieldMappings, missingFields: string[] } => {
  const fieldMappings: FieldMappings = {};
  const missingFields: string[] = [];
  
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

  return { fieldMappings, missingFields };
};

// Process CSV data to OrderData format
export const processCSVData = (results: Papa.ParseResult<any>): OrderData[] => {
  // Get all headers from the file
  const headers = Object.keys(results.data[0] || {});
  console.log("En-têtes détectés:", headers);
  
  // Find mappings
  const { fieldMappings, missingFields } = findFieldMappings(headers);
  
  if (missingFields.length > 0) {
    console.error("Colonnes manquantes:", missingFields);
    throw new Error(`Colonnes manquantes: ${missingFields.join(", ")}`);
  }

  // Process the data using the mapped field names
  return (results.data as any[]).map((row, index) => {
    const totalTaxes = parseCommaNumber(row[fieldMappings.totalTaxes] || "0");
    const shippingVAT = parseCommaNumber(row[fieldMappings.shippingVAT] || "0");
    const totalAmount = parseCommaNumber(row[fieldMappings.totalAmount] || "0");
    const totalVAT = totalTaxes + shippingVAT;
    
    // Clean VAT number - remove spaces and dots
    const cleanedVatNumber = cleanVATNumber(row[fieldMappings.vatNumber] || "");
    
    // Fix encoding issues with company names
    const companyName = fixEncodingIssues(row[fieldMappings.company] || "");
    
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
};

// Parse CSV file
export const parseCSVFile = (
  file: File,
  onSuccess: (data: OrderData[]) => void,
  onError: (errorMessage: string) => void
): void => {
  console.log("Début du traitement du fichier:", file.name);

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      try {
        console.log("Résultats du parsing:", results);
        
        if (results.errors && results.errors.length > 0) {
          console.error("Erreurs de parsing:", results.errors);
          onError(`Erreur lors de l'analyse du CSV: ${results.errors[0].message}`);
          return;
        }

        if (!results.data || results.data.length === 0) {
          onError("Le fichier CSV ne contient pas de données valides");
          return;
        }

        const processedData = processCSVData(results);
        console.log("Données traitées:", processedData.slice(0, 2));
        onSuccess(processedData);
      } catch (err) {
        console.error("Erreur lors du traitement:", err);
        onError(`Erreur lors du traitement des données: ${(err as Error).message}`);
      }
    },
    error: (err) => {
      console.error("Erreur de parsing:", err);
      onError(`Erreur lors de l'analyse du fichier: ${err.message}`);
    }
  });
};
