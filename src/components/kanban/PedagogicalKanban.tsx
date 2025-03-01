
import { usePedagogicalData } from "./hooks/usePedagogicalData"
import { PEDAGOGICAL_KANBAN_COLUMNS } from "./utils/columns/pedagogicalColumnDefinitions"
import { KanbanColumn } from "./KanbanColumn"
import { useState } from "react"
import { BoardHeader } from "./BoardHeader"
import { ClientData } from "./utils/types/kanbanTypes"

export function PedagogicalKanban() {
  const { data: students, isLoading, refetch } = usePedagogicalData()
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  // Transformar os dados dos alunos para o formato do Kanban
  const transformedData = students?.map(student => ({
    id: student.id,
    name: student.full_name,
    phone_number: student.client.phone_number,
    lead_source: student.client.lead_source,
    created_at: student.client.created_at,
    status: student.client.status,
    kit_versions: student.kit_versions,
    classes: student.classes,
    pedagogical_schedules: student.pedagogical_schedules,
    observations: student.client.observations
  } as ClientData))

  // Filtrar e distribuir os cards nas colunas
  const columns = PEDAGOGICAL_KANBAN_COLUMNS.map(columnDef => ({
    id: columnDef.id,
    title: columnDef.title,
    cards: transformedData?.filter(student => 
      columnDef.filterPredicate(student)
    ) || []
  }))

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      <BoardHeader 
        showPendingOnly={showPendingOnly}
        setShowPendingOnly={setShowPendingOnly}
        onRefresh={() => refetch()}
      />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full overflow-x-auto">
          <div className="inline-flex gap-4 p-4 min-w-max">
            {columns.map((column, index) => (
              <KanbanColumn
                key={column.id}
                column={column}
                index={index}
                onWhatsAppClick={() => {}}
                onRegisterAttempt={() => Promise.resolve()}
                onRegisterEffectiveContact={() => Promise.resolve()}
                onDeleteActivity={async () => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
