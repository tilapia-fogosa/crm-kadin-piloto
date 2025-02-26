
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useSales } from "@/hooks/useSales"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function SalesPage() {
  const { data: sales, isLoading } = useSales()
  console.log('Renderizando página de vendas', { sales, isLoading })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando...
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Vendas</h1>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data da Venda</TableHead>
              <TableHead>Nome do Aluno</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Origem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales?.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell>
                  {format(new Date(sale.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </TableCell>
                <TableCell>{sale.student_name}</TableCell>
                <TableCell>{sale.profiles?.full_name || 'N/A'}</TableCell>
                <TableCell>{sale.clients?.lead_source || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
