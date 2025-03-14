
import { OrderData } from "@/pages/Index";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Interface pour les données consolidées
interface ConsolidatedData {
  company: string;
  vatNumber: string;
  totalAmount: number;
  orderCount: number;
  originalOrders: OrderData[];
}

// Export en CSV
export const exportToCSV = (filteredData: OrderData[], selectedMonth: string | null, showIntracomOnly: boolean) => {
  const headers = ['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Montant Total'];
  
  const csvData = filteredData.map(order => [
    order.date,
    order.company,
    order.vatNumber,
    (order.totalAmount - order.totalVAT).toFixed(2).replace('.', ','),
    order.totalVAT.toFixed(2).replace('.', ','),
    order.totalAmount.toFixed(2).replace('.', ',')
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

// Export des données consolidées en CSV
export const exportConsolidatedToCSV = (consolidatedData: ConsolidatedData[], selectedMonth: string | null) => {
  const headers = ['Société', 'N° TVA', 'Nombre de commandes', 'Montant Total'];
  
  const csvData = consolidatedData.map(client => [
    client.company,
    client.vatNumber,
    client.orderCount.toString(),
    client.totalAmount.toFixed(2).replace('.', ',')
  ]);
  
  csvData.unshift(headers);
  
  const csvContent = csvData.map(row => row.join(';')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const monthLabel = selectedMonth 
    ? format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM_yyyy", { locale: fr })
    : "toutes_commandes";
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `intracom_consolidee_${monthLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export en PDF
export const exportToPDF = (
  filteredData: OrderData[], 
  selectedMonth: string | null, 
  showIntracomOnly: boolean,
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
  }
) => {
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
  doc.text(`Montant total HT: ${stats.totalExcludingVAT.replace('.', ',')} €`, 14, 38);
  doc.text(`TVA totale: ${stats.totalVAT.replace('.', ',')} €`, 14, 46);
  doc.text(`Montant total TTC: ${stats.total.replace('.', ',')} €`, 14, 54);
  
  // Tableau
  autoTable(doc, {
    startY: 65,
    head: [['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Total']],
    body: filteredData.map(order => [
      order.date,
      order.company,
      order.vatNumber,
      `${(order.totalAmount - order.totalVAT).toFixed(2).replace('.', ',')} €`,
      `${order.totalVAT.toFixed(2).replace('.', ',')} €`,
      `${order.totalAmount.toFixed(2).replace('.', ',')} €`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  doc.save(`commandes_${monthLabel.replace(/ /g, '_')}${intracomLabel ? '_intracom' : ''}.pdf`);
};

// Export des données consolidées en PDF
export const exportConsolidatedToPDF = (
  consolidatedData: ConsolidatedData[], 
  selectedMonth: string | null,
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
  }
) => {
  const doc = new jsPDF();
  
  // Titre
  const monthLabel = selectedMonth 
    ? format(parse(selectedMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: fr })
    : "Toutes les périodes";
  
  doc.setFontSize(16);
  doc.text(`Rapport intracom consolidé: ${monthLabel}`, 14, 20);
  
  // Statistiques
  doc.setFontSize(12);
  doc.text(`Nombre total de clients: ${consolidatedData.length}`, 14, 30);
  doc.text(`Nombre total de commandes intracom: ${stats.orderCount}`, 14, 38);
  doc.text(`Montant total: ${stats.total.replace('.', ',')} €`, 14, 46);
  
  // Tableau
  autoTable(doc, {
    startY: 55,
    head: [['Société', 'N° TVA', 'Nb commandes', 'Montant total']],
    body: consolidatedData.map(client => [
      client.company,
      client.vatNumber,
      client.orderCount,
      `${client.totalAmount.toFixed(2).replace('.', ',')} €`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  doc.save(`intracom_consolidee_${monthLabel.replace(/ /g, '_')}.pdf`);
};
