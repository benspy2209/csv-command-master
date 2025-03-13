
import { OrderData } from "@/pages/Index";
import { format, parse } from "date-fns";
import { fr } from "date-fns/locale";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

// Export en CSV
export const exportToCSV = (filteredData: OrderData[], selectedMonth: string | null, showIntracomOnly: boolean) => {
  const headers = ['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Montant Total'];
  
  const csvData = filteredData.map(order => {
    // Convertir les montants en nombre pour les calculs
    const totalAmount = parseFloat(String(order.totalAmount).replace(',', '.'));
    const totalVAT = parseFloat(String(order.totalVAT).replace(',', '.'));
    const amountHT = totalAmount - totalVAT;
    
    return [
      order.date,
      order.company,
      order.vatNumber,
      amountHT.toFixed(2).replace('.', ','),
      totalVAT.toFixed(2).replace('.', ','),
      totalAmount.toFixed(2).replace('.', ',')
    ];
  });
  
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
  doc.text(`Montant total HT: ${stats.totalExcludingVAT} €`, 14, 38);
  doc.text(`TVA totale: ${stats.totalVAT} €`, 14, 46);
  doc.text(`Montant total TTC: ${stats.total} €`, 14, 54);
  
  // Préparation des données pour le tableau
  const tableBody = filteredData.map(order => {
    // Convertir les montants en nombre pour les calculs
    const totalAmount = parseFloat(String(order.totalAmount).replace(',', '.'));
    const totalVAT = parseFloat(String(order.totalVAT).replace(',', '.'));
    const amountHT = totalAmount - totalVAT;
    
    return [
      order.date,
      order.company,
      order.vatNumber,
      `${amountHT.toFixed(2).replace('.', ',')} €`,
      `${totalVAT.toFixed(2).replace('.', ',')} €`,
      `${totalAmount.toFixed(2).replace('.', ',')} €`
    ];
  });
  
  // @ts-ignore
  doc.autoTable({
    startY: 65,
    head: [['Date', 'Société', 'N° TVA', 'Montant HT', 'TVA', 'Total']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] }
  });
  
  doc.save(`commandes_${monthLabel.replace(/ /g, '_')}${intracomLabel ? '_intracom' : ''}.pdf`);
};
