
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OrderData } from "@/pages/Index";
import { FileSelector } from "@/components/FileSelector";
import { ErrorAlert } from "@/components/ErrorAlert";
import { parseCSVFile } from "@/utils/csvProcessingUtils";

interface CSVImporterProps {
  onCancel: () => void;
  onImportSuccess: (data: OrderData[]) => void;
}

export function CSVImporter({ onCancel, onImportSuccess }: CSVImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    setError(null);
  };

  const processCSV = () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier");
      return;
    }

    setIsProcessing(true);
    setError(null);

    parseCSVFile(
      file,
      (data) => {
        setIsProcessing(false);
        onImportSuccess(data);
      },
      (errorMessage) => {
        setIsProcessing(false);
        setError(errorMessage);
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Importer un fichier CSV</h2>
        
        <div className="space-y-4">
          {error && <ErrorAlert message={error} />}
          
          <FileSelector onFileChange={handleFileChange} file={file} />
          
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
