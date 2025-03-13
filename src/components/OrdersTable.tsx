
import { OrderData } from "@/pages/Index";
import { Table, TableBody } from "@/components/ui/table";
import { OrderTableHeader } from "@/components/table/OrderTableHeader";
import { OrderTableRow } from "@/components/table/OrderTableRow";
import { EmptyTableMessage } from "@/components/table/EmptyTableMessage";
import { formatCurrency } from "@/components/table/formatters";

interface OrdersTableProps {
  filteredData: OrderData[];
}

export function OrdersTable({ filteredData }: OrdersTableProps) {
  if (filteredData.length === 0) {
    return <EmptyTableMessage />;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <OrderTableHeader />
        <TableBody>
          {filteredData.map((order) => (
            <OrderTableRow 
              key={order.id} 
              order={order} 
              formatCurrency={formatCurrency} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
