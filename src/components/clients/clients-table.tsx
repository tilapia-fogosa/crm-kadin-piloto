
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClientActions } from "./client-actions"
import { UseFormReturn } from "react-hook-form"
import { LeadFormData } from "@/types/lead-form"
import { format } from "date-fns"

interface ClientsTableProps {
  clients: any[]
  selectedClient: any
  clientToDelete: any
  form: UseFormReturn<LeadFormData>
  onEdit: (client: any) => void
  onDelete: (clientId: string) => void
  setSelectedClient: (client: any) => void
  setClientToDelete: (client: any) => void
  onSubmit: (values: LeadFormData) => Promise<void>
}

export function ClientsTable({
  clients,
  selectedClient,
  clientToDelete,
  form,
  onEdit,
  onDelete,
  setSelectedClient,
  setClientToDelete,
  onSubmit,
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
                  selectedClient={selectedClient}
                  clientToDelete={clientToDelete}
                  form={form}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  setSelectedClient={setSelectedClient}
                  setClientToDelete={setClientToDelete}
                  onSubmit={onSubmit}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
