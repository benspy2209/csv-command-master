import { useState, useMemo } from "react";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { OrderData } from "@/pages/Index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DataVisualization } from "@/components/DataVisualization";
import { DataFilters } from "@/components/DataFilters";
import { Download, Printer } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface DataDisplayProps {
  data: OrderData[];
}

// Fonction pour générer une liste unique de mois à partir des données
const getUniqueMonths = (data: OrderData[]) => {
  const months = new Set<string>();
  
  data.forEach(order => {
    try {
      const date = parse(order.date, "dd/MM/yyyy", new Date());
      const monthKey = format(date, "yyyy-MM");
      months.add(monthKey);
    } catch (e) {
      // Ignorer les dates invalides
    }
  });
  
  return Array.from(months).sort().reverse();
};

export function DataDisplay({ data }: DataDisplayProps) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showIntracomOnly, setShowIntracomOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("table");
  
  const months = useMemo(() => getUniqueMonths(data), [data]);
  
  // Sélectionner le mois le plus récent par défaut
  useMemo(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Filtrer les données selon les critères
  const filteredData = useMemo(() => {
    return data.filter(order => {
      let keepItem = true;
      
      // Filtre par mois
      if (selectedMonth) {
        try {
          const date = parse(order.date, "dd/MM/yyyy", new Date());
          const orderMonth = format(date, "yyyy-MM");
          if (orderMonth !== selectedMonth) {
            keepItem = false;
          }
        } catch {
          keepItem = false;
        }
      }
      
      // Filtre intracom
      if (showIntracomOnly) {
        if (order.totalVAT !== 0 || !order.vatNumber) {
          keepItem = false;
        }
      }
      
      return keepItem;
    });
  }, [data, selectedMonth, showIntracomOnly]);

  // Calculer les statistiques
  const stats = useMemo(() => {
    const total = filteredData.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalVAT = filteredData.reduce((sum, order) => sum + order.totalVAT, 0);
    const totalExcludingVAT = total - totalVAT;
    const orderCount = filteredData.length;
    
    return {
      total: total.toFixed(2),
      totalVAT: totalVAT.toFixed(2),
      totalExcludingVAT: totalExcludingVAT.toFixed(2),
      orderCount
    };
  }, [filteredData]);

  // Export en CSV
  const exportCSV = () => {
    const headers = ['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Montant Total'];
    
    const csvData = filteredData.map(order => [
      order.date,
      order.company,
      order.vatNumber,
      (order.totalAmount - order.totalVAT).toFixed(2),
      order.totalVAT.toFixed(2),
      order.totalAmount.toFixed(2)
    ]);
    
    csvData.unshift(headers);
    
    const csvContent = csvData.map(row => row.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const monthLabel = selectedMonth 
      ? format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM_yyyy", { locale: fr })
      : "toutes_commandes";
    const intracomLabel = showIntracomOnly ? "_intracom" : "";
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `commandes_${monthLabel}${intracomLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export en PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Titre
    const monthLabel = selectedMonth 
      ? format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: fr })
      : "Toutes les commandes";
    const intracomLabel = showIntracomOnly ? " (Intracom uniquement)" : "";
    
    doc.setFontSize(16);
    doc.text(`Rapport des commandes: ${monthLabel}${intracomLabel}`, 14, 20);
    
    // Statistiques
    doc.setFontSize(12);
    doc.text(`Nombre de commandes: ${stats.orderCount}`, 14, 30);
    doc.text(`Montant total HT: ${stats.totalExcludingVAT} €`, 14, 38);
    doc.text(`TVA totale: ${stats.totalVAT} €`, 14, 46);
    doc.text(`Montant total TTC: ${stats.total} €`, 14, 54);
    
    // Tableau
    // @ts-ignore
    doc.autoTable({
      startY: 65,
      head: [['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Total']],
      body: filteredData.map(order => [
        order.date,
        order.company,
        order.vatNumber,
        `${(order.totalAmount - order.totalVAT).toFixed(2)} €`,
        `${order.totalVAT.toFixed(2)} €`,
        `${order.totalAmount.toFixed(2)} €`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`commandes_${monthLabel.replace(/ /g, '_')}${intracomLabel ? '_intracom' : ''}.pdf`);
  };

  return (
    <div className="space-y-6">
      <DataFilters 
        months={months}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        showIntracomOnly={showIntracomOnly}
        onIntracomChange={setShowIntracomOnly}
      />
      
      <div className="bg-muted/30 p-4 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background p-4 rounded-md shadow-sm">
          <div className="text-sm text-muted-foreground">Nombre de commandes</div>
          <div className="text-2xl font-bold">{stats.orderCount}</div>
        </div>
        <div className="bg-background p-4 rounded-md shadow-sm">
          <div className="text-sm text-muted-foreground">Total HT</div>
          <div className="text-2xl font-bold">{stats.totalExcludingVAT} €</div>
        </div>
        <div className="bg-background p-4 rounded-md shadow-sm">
          <div className="text-sm text-muted-foreground">Total TVA</div>
          <div className="text-2xl font-bold">{stats.totalVAT} €</div>
        </div>
        <div className="bg-background p-4 rounded-md shadow-sm">
          <div className="text-sm text-muted-foreground">Total TTC</div>
          <div className="text-2xl font-bold">{stats.total} €</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="table">Tableau</TabsTrigger>
            <TabsTrigger value="charts">Graphiques</TabsTrigger>
          </TabsList>
        
          <TabsContent value="table" className="mt-4">
            {filteredData.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Société</TableHead>
                      <TableHead>N° TVA</TableHead>
                      <TableHead className="text-right">Montant HT</TableHead>
                      <TableHead className="text-right">TVA</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>{order.company}</TableCell>
                        <TableCell>{order.vatNumber || "-"}</TableCell>
                        <TableCell className="text-right">
                          {(order.totalAmount - order.totalVAT).toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-right">{order.totalVAT.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{order.totalAmount.toFixed(2)} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center p-8 border rounded-md">
                <p className="text-muted-foreground">Aucune donnée pour la période sélectionnée</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="charts" className="mt-4">
            <DataVisualization data={filteredData} />
          </TabsContent>
        </Tabs>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Printer className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
