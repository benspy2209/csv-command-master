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

// Fonction pour générer un libellé de période
const getPeriodLabel = (selectedMonths: string[]) => {
  if (selectedMonths.length === 0) {
    return "toutes_commandes";
  } else if (selectedMonths.length === 1) {
    return format(parse(selectedMonths[0], "yyyy-MM", new Date()), "MMMM_yyyy", { locale: fr });
  } else {
    // Trouver si c'est un trimestre
    const firstMonth = selectedMonths[0];
    const year = firstMonth.split('-')[0];
    const allSameYear = selectedMonths.every(month => month.startsWith(year));
    
    // Vérifier si les mois forment un trimestre
    const monthNumbers = selectedMonths
      .map(month => parseInt(month.split('-')[1]))
      .sort((a, b) => a - b);
    
    if (allSameYear && selectedMonths.length === 3) {
      if (monthNumbers[0] === 1 && monthNumbers[2] === 3) {
        return `T1_${year}`;
      } else if (monthNumbers[0] === 4 && monthNumbers[2] === 6) {
        return `T2_${year}`;
      } else if (monthNumbers[0] === 7 && monthNumbers[2] === 9) {
        return `T3_${year}`;
      } else if (monthNumbers[0] === 10 && monthNumbers[2] === 12) {
        return `T4_${year}`;
      }
    }
    
    // Si ce n'est pas un trimestre exact, utiliser le nombre de mois
    if (allSameYear) {
      return `${selectedMonths.length}_mois_${year}`;
    } else {
      return `${selectedMonths.length}_mois_multi_annees`;
    }
  }
};

// Export en CSV
export const exportToCSV = (filteredData: OrderData[], selectedMonths: string[], showIntracomOnly: boolean) => {
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
  
  const periodLabel = getPeriodLabel(selectedMonths);
  const intracomLabel = showIntracomOnly ? "_intracom" : "";
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `commandes_${periodLabel}${intracomLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export des données consolidées en CSV
export const exportConsolidatedToCSV = (consolidatedData: ConsolidatedData[], selectedMonths: string[]) => {
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
  
  const periodLabel = getPeriodLabel(selectedMonths);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `intracom_consolidee_${periodLabel}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export en PDF
export const exportToPDF = (
  filteredData: OrderData[], 
  selectedMonths: string[], 
  showIntracomOnly: boolean,
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
    intracomSales: string;
    domesticSales: string;
    domesticVAT: string;
    domesticExcludingVAT: string;
    exportSales: string;
  }
) => {
  const doc = new jsPDF();
  
  // Titre
  const periodLabel = selectedMonths.length === 0 
    ? "Toutes les commandes"
    : selectedMonths.length === 1 
      ? format(parse(selectedMonths[0], "yyyy-MM", new Date()), "MMMM yyyy", { locale: fr })
      : `${selectedMonths.length} mois sélectionnés`;
  const intracomLabel = showIntracomOnly ? " (Intracom uniquement)" : "";
  
  doc.setFontSize(16);
  doc.text(`Rapport des commandes: ${periodLabel}${intracomLabel}`, 14, 20);
  
  // Tableau récapitulatif plus détaillé
  doc.setFontSize(12);
  doc.text("Récapitulatif comptable", 14, 30);
  
  // Positions initiales pour le placement des tableaux
  let startY = 35;
  
  autoTable(doc, {
    startY: startY,
    head: [['Catégorie', 'Montant HT', 'TVA', 'Montant TTC']],
    body: [
      ['Total général', 
       `${parseFloat(stats.totalExcludingVAT).toFixed(2).replace('.', ',')} €`, 
       `${parseFloat(stats.totalVAT).toFixed(2).replace('.', ',')} €`, 
       `${parseFloat(stats.total).toFixed(2).replace('.', ',')} €`],
      ['Ventes domestiques', 
       `${parseFloat(stats.domesticExcludingVAT).toFixed(2).replace('.', ',')} €`, 
       `${parseFloat(stats.domesticVAT).toFixed(2).replace('.', ',')} €`, 
       `${parseFloat(stats.domesticSales).toFixed(2).replace('.', ',')} €`],
      ['Ventes intracom', 
       `${parseFloat(stats.intracomSales).toFixed(2).replace('.', ',')} €`, 
       '0,00 €', 
       `${parseFloat(stats.intracomSales).toFixed(2).replace('.', ',')} €`],
      ['Exportations', 
       `${parseFloat(stats.exportSales).toFixed(2).replace('.', ',')} €`, 
       '0,00 €', 
       `${parseFloat(stats.exportSales).toFixed(2).replace('.', ',')} €`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 10 }
  });
  
  // Récupérer la position finale Y du tableau
  const finalY = (doc as any).lastAutoTable?.finalY || 95;
  
  // Statistiques générales
  doc.text(`Nombre de commandes: ${stats.orderCount}`, 14, finalY + 10);
  
  // Tableau des commandes
  autoTable(doc, {
    startY: finalY + 15,
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
    headStyles: { fillColor: [66, 139, 202] },
    styles: { fontSize: 8 }
  });
  
  const filenamePeriod = getPeriodLabel(selectedMonths);
  doc.save(`commandes_${filenamePeriod}${intracomLabel ? '_intracom' : ''}.pdf`);
};

// Export des données consolidées en PDF
export const exportConsolidatedToPDF = (
  consolidatedData: ConsolidatedData[], 
  selectedMonths: string[],
  stats: {
    total: string;
    totalVAT: string;
    totalExcludingVAT: string;
    orderCount: number;
    intracomSales: string;
    domesticSales: string;
    domesticVAT: string;
    domesticExcludingVAT: string;
    exportSales: string;
  }
) => {
  const doc = new jsPDF();
  
  // Titre
  const periodLabel = selectedMonths.length === 0 
    ? "Toutes les périodes" 
    : selectedMonths.length === 1 
      ? format(parse(selectedMonths[0], "yyyy-MM", new Date()), "MMMM yyyy", { locale: fr })
      : `${selectedMonths.length} mois sélectionnés`;
  
  doc.setFontSize(16);
  doc.text(`Rapport intracom consolidé: ${periodLabel}`, 14, 20);
  
  // Statistiques
  doc.setFontSize(12);
  doc.text(`Nombre total de clients: ${consolidatedData.length}`, 14, 30);
  doc.text(`Nombre total de commandes intracom: ${stats.orderCount}`, 14, 38);
  doc.text(`Montant total: ${parseFloat(stats.intracomSales).toFixed(2).replace('.', ',')} €`, 14, 46);
  
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
  
  const filenamePeriod = getPeriodLabel(selectedMonths);
  doc.save(`intracom_consolidee_${filenamePeriod}.pdf`);
};
