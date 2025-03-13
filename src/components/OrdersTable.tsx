
import { OrderData } from "@/pages/Index";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface OrdersTableProps {
  filteredData: OrderData[];
}

export function OrdersTable({ filteredData }: OrdersTableProps) {
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
  );
}
