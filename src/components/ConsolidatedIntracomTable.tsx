import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight, Check, X } from "lucide-react";
import { useState } from "react";
import { OrderData } from "@/pages/Index";
import { cleanVATNumber } from "@/utils/dataProcessingUtils";
import { isVATNumberValid } from "@/utils/formatUtils";
import { Badge } from "@/components/ui/badge";

interface ConsolidatedData {
  company: string;
  vatNumber: string;
  totalAmount: number;
  orderCount: number;
  originalOrders: OrderData[];
}

interface ConsolidatedIntracomTableProps {
  consolidatedData: ConsolidatedData[];
}

export function ConsolidatedIntracomTable({ consolidatedData }: ConsolidatedIntracomTableProps) {
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace('.', ',') + ' €';
  };

  const toggleExpand = (vatNumber: string) => {
    if (expandedClient === vatNumber) {
      setExpandedClient(null);
    } else {
      setExpandedClient(vatNumber);
    }
  };

  if (consolidatedData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">Aucune vente intracom pour la période sélectionnée</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Société</TableHead>
            <TableHead>N° TVA</TableHead>
            <TableHead className="text-right">Nombre de commandes</TableHead>
            <TableHead className="text-right">Montant total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {consolidatedData.map((client) => (
            <>
              <TableRow 
                key={client.vatNumber}
                className="cursor-pointer hover:bg-muted/80"
                onClick={() => toggleExpand(client.vatNumber)}
              >
                <TableCell>
                  {expandedClient === client.vatNumber ? 
                    <ChevronDown className="h-4 w-4" /> : 
                    <ChevronRight className="h-4 w-4" />
                  }
                </TableCell>
                <TableCell className="font-medium">{client.company}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {client.vatNumber}
                  {client.vatNumber && (
                    <Badge 
                      variant={isVATNumberValid(client.vatNumber) ? "default" : "destructive"} 
                      className="flex items-center gap-1 ml-2"
                    >
                      {isVATNumberValid(client.vatNumber) ? 
                        <Check className="h-3 w-3" /> : 
                        <X className="h-3 w-3" />
                      }
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{client.orderCount}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(client.totalAmount)}</TableCell>
              </TableRow>
              
              {expandedClient === client.vatNumber && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={5}>
                    <div className="p-2">
                      <h4 className="font-medium mb-2">Détail des commandes</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>N° Commande</TableHead>
                            <TableHead className="text-right">Montant</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {client.originalOrders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>{order.id}</TableCell>
                              <TableCell className="text-right">{formatCurrency(order.totalAmount)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
