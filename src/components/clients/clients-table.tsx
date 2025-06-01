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
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { useState } from "react"
import { ClientActivitySheet } from "./client-activity-sheet"

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
  console.log('📋 [ClientsTable] Renderizada com', clients?.length || 0, 'clientes')
  
  // Estado para controlar qual cliente tem o sheet de atividades aberto
  const [selectedClientForActivities, setSelectedClientForActivities] = useState<any>(null)
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd-MM-yy HH:mm')
    } catch (error) {
      console.error('Error formatting date:', dateString, error)
      return '-'
    }
  }

  const handleViewActivities = (client: any) => {
    console.log('👁️ [ClientsTable] Abrindo atividades para cliente:', client.name)
    setSelectedClientForActivities(client)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Origem do Lead</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-center">Atividades</TableHead>
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
                <TableCell className="text-center">
                  <Button
                    onClick={() => handleViewActivities(client)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
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

      {/* Sheet de atividades - só renderiza quando cliente selecionado */}
      <ClientActivitySheet
        client={selectedClientForActivities}
        isOpen={!!selectedClientForActivities}
        setIsOpen={(open) => {
          if (!open) {
            setSelectedClientForActivities(null)
          }
        }}
      />
    </>
  )
}
