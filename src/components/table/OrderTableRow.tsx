
import { OrderData } from "@/pages/Index";
import { TableCell, TableRow } from "@/components/ui/table";
import { fixEncodingIssues, isVATNumberValid, cleanVATNumber } from "@/utils/formatUtils";
import { Badge } from "@/components/ui/badge";
import { Check, X, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OrderTableRowProps {
  order: OrderData;
  formatCurrency: (amount: number) => string;
}

export function OrderTableRow({ order, formatCurrency }: OrderTableRowProps) {
  const cleanedVat = cleanVATNumber(order.vatNumber);
  const vatIsValid = isVATNumberValid(cleanedVat);
  const isIntracom = order.totalVAT === 0 && order.vatNumber && order.vatNumber.trim() !== "";
  const isExport = order.totalVAT === 0 && (!order.vatNumber || order.vatNumber.trim() === "" || order.vatNumber.includes("Suisse"));
  
  // Détecter les cas spéciaux (numéros de TVA non-UE comme "Suisse")
  const specialVatCase = isExport && order.vatNumber && order.vatNumber.trim() !== "";
  
  return (
    <TableRow key={order.id}>
      <TableCell>{order.date}</TableCell>
      <TableCell>{fixEncodingIssues(order.company)}</TableCell>
      <TableCell className="flex items-center gap-2">
        {order.vatNumber || "-"}
        {order.vatNumber && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant={vatIsValid ? "default" : specialVatCase ? "outline" : "destructive"} 
                  className={`flex items-center gap-1 ml-2 ${
                    vatIsValid ? "bg-green-500" : 
                    specialVatCase ? "bg-amber-500" : 
                    "bg-red-500"
                  }`}
                >
                  {vatIsValid ? 
                    <Check className="h-3 w-3" /> : 
                    specialVatCase ?
                    <AlertTriangle className="h-3 w-3" /> :
                    <X className="h-3 w-3" />
                  }
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                {vatIsValid 
                  ? "Numéro de TVA valide pour l'UE" 
                  : specialVatCase 
                    ? "Cas spécial (export hors UE)" 
                    : "Format de TVA invalide"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {isIntracom && (
          <Badge variant="secondary" className="ml-1">Intracom</Badge>
        )}
        {isExport && (
          <Badge variant="outline" className="ml-1 bg-amber-100">Export</Badge>
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
