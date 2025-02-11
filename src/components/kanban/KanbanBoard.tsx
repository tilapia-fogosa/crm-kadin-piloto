
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState } from "react"
import { startOfDay, isAfter } from "date-fns"

export function KanbanBoard() {
  const { data: clients, isLoading } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  // Iniciando com o filtro desligado (false)
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    if (!showPendingOnly) {
      console.log('Filter is OFF, showing all clients:', clients.length)
      return clients
    }

    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      // Se não tem data de próximo contato, mostra o cliente
      if (!client.next_contact_date) {
        console.log('Client with no next contact date:', client.name)
        return true
      }

      const nextContactDate = new Date(client.next_contact_date)
      const shouldShow = !isAfter(nextContactDate, today)
      console.log('Client:', client.name, 'Next contact:', nextContactDate, 'Should show:', shouldShow)
      return shouldShow
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
