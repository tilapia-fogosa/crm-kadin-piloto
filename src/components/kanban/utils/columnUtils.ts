
import { KanbanColumn } from "../types"
import { ClientData } from "./types/kanbanTypes"
import { transformClientToCard } from "./transforms/clientTransforms"
import { KANBAN_COLUMNS } from "./columns/columnDefinitions"
import { 
  logClientFiltering, 
  logFilteredClients, 
  logColumnCounts,
  logClientMapping 
} from "./logging/kanbanLogger"

export const transformClientsToColumnData = (clients: any[] | null): KanbanColumn[] => {
  logClientFiltering(clients)
  
  // Filtra clientes com status "matriculado" ou "perdido"
  const filteredClients = clients?.filter(client => 
    client.status !== 'matriculado' && client.status !== 'perdido'
  ) as ClientData[] | null
  
  logFilteredClients(filteredClients)

  const columns = KANBAN_COLUMNS.map(columnDef => ({
    id: columnDef.id,
    title: columnDef.title,
    cards: filteredClients
      ?.filter(client => {
        const isInColumn = columnDef.filterPredicate(client)
        logClientMapping(client.id, client)
        return isInColumn
      })
      .map(transformClientToCard) || []
  }))

  // Log final column counts
  columns.forEach(column => {
    logColumnCounts(column.title, column.cards.length)
  })

  return columns
}

