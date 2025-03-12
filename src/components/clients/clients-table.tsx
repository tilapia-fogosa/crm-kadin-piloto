
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientActions } from "./client-actions"
import { format } from "date-fns"

interface ClientsTableProps {
  clients: any[]
  clientToDelete: any
  onDelete: (clientId: string) => void
  setClientToDelete: (client: any) => void
}

export function ClientsTable({
  clients,
  clientToDelete,
  onDelete,
  setClientToDelete,
}: ClientsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd-MM-yy HH:mm')
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return '-'
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome Completo</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Origem do Lead</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients?.map((client) => (
            <TableRow key={client.id}>
              <TableCell>{client.name}</TableCell>
              <TableCell>{client.phone_number}</TableCell>
              <TableCell>{client.lead_source}</TableCell>
              <TableCell>{client.status}</TableCell>
              <TableCell>{formatDate(client.created_at)}</TableCell>
              <TableCell className="text-right">
                <ClientActions
                  client={client}
                  clientToDelete={clientToDelete}
                  onDelete={onDelete}
                  setClientToDelete={setClientToDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
