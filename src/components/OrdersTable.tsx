
import { OrderData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrdersTableProps {
  filteredData: OrderData[];
}

export function OrdersTable({ filteredData }: OrdersTableProps) {
  // Fonction pour formater les montants en conservant toutes les décimales
  const formatCurrency = (amount: number) => {
    // Formater avec 2 décimales systématiquement et remplacer le point par une virgule
    return amount.toFixed(2).replace('.', ',') + ' €';
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
            // Calculer le montant HT en soustrayant la TVA du total avec précision maximale
            const totalVAT = Number(order.totalVAT);
            const totalAmount = Number(order.totalAmount);
            const totalExcludingVAT = totalAmount - totalVAT;
            
            return (
              <TableRow key={order.id}>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.company}</TableCell>
                <TableCell>{order.vatNumber || "-"}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(totalExcludingVAT)}
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
