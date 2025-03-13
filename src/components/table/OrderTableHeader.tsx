
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function OrderTableHeader() {
  return (
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
  );
}
