
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

  useEffect(() => {
    console.log("Kanban Board mounted or route changed, refetching data...")
    refetch()
  }, [location.pathname, refetch])

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    
    if (!showPendingOnly) {
      console.log('Filter is OFF, showing all clients')
      return clients
    }
    
    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      if (!client.next_contact_date) {
        console.log('Client with no next contact date:', client.name)
        return true
      }

      const nextContactDate = startOfDay(new Date(client.next_contact_date))
      const shouldShow = isBefore(nextContactDate, today) || isEqual(nextContactDate, today)
      console.log('Client:', client.name, 'Next contact:', nextContactDate, 'Should show:', shouldShow)
      return shouldShow
    })
  }

  const filteredClients = filterClients(clients)
  console.log('Filtered clients count:', filteredClients?.length)
  const columns = transformClientsToColumnData(filteredClients)

  return (
    <div className="flex flex-col h-full">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        onRefresh={() => refetch()}
      />

      <div className="flex-1 overflow-x-auto px-4">
        <div className="flex gap-4 h-full">
          {columns.map((column, index) => (
            <KanbanColumn
              key={column.id}
              column={column}
              index={index}
              onWhatsAppClick={handleWhatsAppClick}
              onRegisterAttempt={registerAttempt}
              onRegisterEffectiveContact={registerEffectiveContact}
              onDeleteActivity={deleteActivity}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default KanbanBoard
