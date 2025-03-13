
import { OrderData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrdersTableProps {
  filteredData: OrderData[];
}

export function OrdersTable({ filteredData }: OrdersTableProps) {
  // Fonction pour formater les montants en préservant toutes les décimales
  const formatCurrency = (amount: string | number) => {
    // Convertir en string si ce n'est pas déjà le cas
    const amountStr = typeof amount === 'string' ? amount : amount.toString();
    
    // Remplacer le point par une virgule et ajouter le symbole €
    // Si le montant n'a pas de décimales, ajouter ",00"
    const formattedAmount = amountStr.includes('.') 
      ? amountStr.replace('.', ',') 
      : `${amountStr},00`;
      
    return `${formattedAmount} €`;
  };

  if (filteredData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">Aucune donnée pour la période sélectionnée</p>
      </div>
    );
  }

  return (
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
          {filteredData.map((order) => {
            // Calculs avec préservation des décimales
            const totalAmount = order.totalAmount;
            const totalVAT = order.totalVAT;
            
            // Calcul de HT = TTC - TVA avec précision maximale
            const amountExclVAT = (
              parseFloat(totalAmount.replace(',', '.')) - 
              parseFloat(totalVAT.replace(',', '.'))
            ).toString();
            
            return (
              <TableRow key={order.id}>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.company}</TableCell>
                <TableCell>{order.vatNumber || "-"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(amountExclVAT)}
                </TableCell>
                <TableCell className="text-right">{formatCurrency(totalVAT)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalAmount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
