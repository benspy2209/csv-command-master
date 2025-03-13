
import { OrderData } from "@/pages/Index";
import { TableCell, TableRow } from "@/components/ui/table";
import { fixEncodingIssues } from "@/utils/formatUtils";

interface OrderTableRowProps {
  order: OrderData;
  formatCurrency: (amount: number) => string;
}

export function OrderTableRow({ order, formatCurrency }: OrderTableRowProps) {
  return (
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
  );
}
