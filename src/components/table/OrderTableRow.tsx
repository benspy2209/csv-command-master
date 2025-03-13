
import { OrderData } from "@/pages/Index";
import { TableCell, TableRow } from "@/components/ui/table";
import { fixEncodingIssues, isVATNumberValid } from "@/utils/formatUtils";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

interface OrderTableRowProps {
  order: OrderData;
  formatCurrency: (amount: number) => string;
}

export function OrderTableRow({ order, formatCurrency }: OrderTableRowProps) {
  const vatIsValid = isVATNumberValid(order.vatNumber);
  
  return (
    <TableRow key={order.id}>
      <TableCell>{order.date}</TableCell>
      <TableCell>{fixEncodingIssues(order.company)}</TableCell>
      <TableCell className="flex items-center gap-2">
        {order.vatNumber || "-"}
        {order.vatNumber && (
          <Badge variant={vatIsValid ? "default" : "destructive"} className="flex items-center gap-1 ml-2">
            {vatIsValid ? 
              <Check className="h-3 w-3" /> : 
              <X className="h-3 w-3" />
            }
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right">
        {formatCurrency(Number(order.totalAmount) - Number(order.totalVAT))}
      </TableCell>
      <TableCell className="text-right">{formatCurrency(Number(order.totalVAT))}</TableCell>
      <TableCell className="text-right">{formatCurrency(Number(order.totalAmount))}</TableCell>
    </TableRow>
  );
}
