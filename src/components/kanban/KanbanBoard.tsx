
import { BoardHeader } from "./BoardHeader"
import { KanbanColumn } from "./KanbanColumn"
import { useClientData } from "./hooks/useClientData"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { useWhatsApp } from "./hooks/useWhatsApp"
import { useCalendarState } from "./hooks/useCalendarState"
import { transformClientsToColumnData } from "./utils/columnUtils"

export function KanbanBoard() {
  const { data: clients, isLoading } = useClientData()
  const { registerAttempt, registerEffectiveContact, deleteActivity } = useActivityOperations()
  const { handleWhatsAppClick } = useWhatsApp()
  const { selectedDate, isCalendarOpen, setIsCalendarOpen, handleDateSelect } = useCalendarState()

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Carregando...</div>
  }

  const columns = transformClientsToColumnData(clients)

  return (
    <div className="flex h-full w-full flex-col gap-4 p-4">
      <BoardHeader 
        selectedDate={selectedDate}
        isCalendarOpen={isCalendarOpen}
        setIsCalendarOpen={setIsCalendarOpen}
        handleDateSelect={handleDateSelect}
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
