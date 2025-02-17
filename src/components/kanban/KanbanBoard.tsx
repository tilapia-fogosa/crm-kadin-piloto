
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState, useEffect } from "react"
import { startOfDay, isBefore, isEqual } from "date-fns"
import { useLocation } from "react-router-dom"

export function KanbanBoard() {
  const { data: clients, isLoading, refetch } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const [showPendingOnly, setShowPendingOnly] = useState(false)
  const location = useLocation()

  // Refetch data when component mounts or when route changes to /kanban
  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    // Se o filtro estiver desligado, retorna todos os clientes
    if (!showPendingOnly) {
      console.log('Filter is OFF, showing all clients')
      return clients
    }
    
    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      // Se não tem data de próximo contato
      if (!client.next_contact_date) {
        console.log('Client with no next contact date:', client.name)
        return true // Mostra clientes sem data de próximo contato quando o filtro está ligado
      }

      const nextContactDate = startOfDay(new Date(client.next_contact_date))
      // Mostra apenas os que têm data menor ou igual a hoje
      const shouldShow = isBefore(nextContactDate, today) || isEqual(nextContactDate, today)
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
        onRefresh={() => refetch()}
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
