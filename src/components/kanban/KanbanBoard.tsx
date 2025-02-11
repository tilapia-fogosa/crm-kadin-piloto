
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { useCalendarState } from "./hooks/useCalendarState"
import { transformClientsToColumnData } from "./utils/columnUtils"
import { useState } from "react"
import { startOfDay, isAfter } from "date-fns"

export function KanbanBoard() {
  const { data: clients, isLoading } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const { selectedDate, isCalendarOpen, setIsCalendarOpen, handleDateSelect } = useCalendarState()
  // Iniciando com o filtro ligado (true)
  const [showPendingOnly, setShowPendingOnly] = useState(true)

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const filterClients = (clients: any[] | null) => {
    if (!clients) return null
    if (!showPendingOnly) return clients

    const today = startOfDay(new Date())
    console.log('Filtering clients with showPendingOnly:', showPendingOnly)

    return clients.filter(client => {
      // Encontrar a última tentativa de contato com data de próximo contato
      const lastAttempt = client.client_activities
        ?.filter((activity: string) => {
          const [tipoAtividade, , , , , nextContactDate] = activity.split('|')
          return tipoAtividade === 'Tentativa de Contato' && nextContactDate
        })
        .sort((a: string, b: string) => {
          const dateA = new Date(a.split('|')[5])
          const dateB = new Date(b.split('|')[5])
          return dateB.getTime() - dateA.getTime()
        })[0]

      if (!lastAttempt) {
        console.log('Client with no next contact date:', client.name)
        return true
      }

      const nextContactDate = new Date(lastAttempt.split('|')[5])
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
        selectedDate={selectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        handleDateSelect={handleDateSelect}
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
