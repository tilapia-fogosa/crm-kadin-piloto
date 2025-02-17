
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { SaleActions } from "./sale-actions"
import { Sale } from "@/components/kanban/types"

interface SalesTableProps {
  sales: any[]
  onDelete: (id: string) => Promise<void>
  onEdit: (sale: Sale) => Promise<void>
}

export function SalesTable({ sales, onDelete, onEdit }: SalesTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getTotalValue = (sale: any) => {
    return sale.enrollment_amount + sale.material_amount + sale.monthly_fee_amount
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Consultor</TableHead>
            <TableHead>Data da Venda</TableHead>
            <TableHead>Matrícula</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Mensalidade</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales?.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.client?.name}</TableCell>
              <TableCell>{sale.consultor?.full_name}</TableCell>
              <TableCell>{format(new Date(sale.created_at), 'dd/MM/yyyy')}</TableCell>
              <TableCell>{formatCurrency(sale.enrollment_amount)}</TableCell>
              <TableCell>{formatCurrency(sale.material_amount)}</TableCell>
              <TableCell>{formatCurrency(sale.monthly_fee_amount)}</TableCell>
              <TableCell>{formatCurrency(getTotalValue(sale))}</TableCell>
              <TableCell className="text-right">
                <SaleActions
                  sale={sale}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
