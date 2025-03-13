
import { OrderData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cleanVATNumber, fixEncodingIssues } from "@/utils/formatUtils";

interface OrdersTableProps {
  filteredData: OrderData[];
}

export function OrdersTable({ filteredData }: OrdersTableProps) {
  // Fonction pour formater les montants en utilisant la virgule comme séparateur décimal
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
          {filteredData.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.date}</TableCell>
              <TableCell>{fixEncodingIssues(order.company)}</TableCell>
              <TableCell>{order.vatNumber || "-"}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(Number(order.totalAmount) - Number(order.totalVAT))}
              </TableCell>
              <TableCell className="text-right">{formatCurrency(Number(order.totalVAT))}</TableCell>
              <TableCell className="text-right">{formatCurrency(Number(order.totalAmount))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
