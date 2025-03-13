
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FileWarning } from "lucide-react";

interface FileSelectorProps {
  onFileChange: (file: File | null) => void;
  file: File | null;
}

export function FileSelector({ onFileChange, file }: FileSelectorProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0]);
      console.log("Fichier sélectionné:", e.target.files[0].name);
    }
  };

  return (
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
      
      {file && (
        <div className="flex items-center gap-2 text-sm">
          <FileWarning className="h-4 w-4 text-muted-foreground" />
          <span>{file.name} ({(file.size / 1024).toFixed(0)} Ko)</span>
        </div>
      )}
    </div>
  );
}
