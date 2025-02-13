
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState } from "react"
import { startOfDay, isAfter, isBefore, isEqual } from "date-fns"

export function KanbanBoard() {
  const { data: clients, isLoading } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      // Se não tem data de próximo contato
      if (!client.next_contact_date) {
        console.log('Client with no next contact date:', client.name)
        return showPendingOnly // Se o filtro estiver ligado, mostra. Se estiver desligado, não mostra
      }

      const nextContactDate = startOfDay(new Date(client.next_contact_date))
      
      if (showPendingOnly) {
        // Se o filtro estiver ligado, mostra apenas os que têm data menor ou igual a hoje
        const shouldShow = isBefore(nextContactDate, today) || isEqual(nextContactDate, today)
        console.log('Client:', client.name, 'Next contact:', nextContactDate, 'Should show (pending only):', shouldShow)
        return shouldShow
      } else {
        // Se o filtro estiver desligado, mostra todos os clientes
        console.log('Filter is OFF, showing client:', client.name)
        return true
      }
    })
  }

  const filteredClients = filterClients(clients)
  console.log('Filtered clients count:', filteredClients?.length)
  const columns = transformClientsToColumnData(filteredClients)

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
      />

      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            onWhatsAppClick={handleWhatsAppClick}
            onRegisterAttempt={registerAttempt}
            onRegisterEffectiveContact={registerEffectiveContact}
            onDeleteActivity={deleteActivity}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard
