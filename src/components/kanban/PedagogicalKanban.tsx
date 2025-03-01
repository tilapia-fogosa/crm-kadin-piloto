
import { usePedagogicalData } from "./hooks/usePedagogicalData"
import { PEDAGOGICAL_KANBAN_COLUMNS } from "./utils/columns/pedagogicalColumnDefinitions"
import { KanbanColumn } from "./KanbanColumn"
import { useState } from "react"
import { BoardHeader } from "./BoardHeader"

export function PedagogicalKanban() {
  const { data: students, isLoading } = usePedagogicalData()
  const [showPendingOnly, setShowPendingOnly] = useState(false)

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>
  }

  // Transformar os dados dos alunos para o formato do Kanban
  const transformedData = students?.map(student => ({
    id: student.id,
    clientName: student.full_name,
    phoneNumber: student.client.phone_number,
    leadSource: student.client.lead_source,
    createdAt: student.client.created_at,
    kit_type: student.kit_versions?.[0]?.kit_type?.name,
    kit_version: student.kit_versions?.[0]?.version,
    class_name: student.classes?.[0]?.name,
    schedule_date: student.pedagogical_schedules?.[0]?.schedule_date,
    observations: student.client.observations
  }))

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
                onRegisterAttempt={() => {}}
                onRegisterEffectiveContact={() => {}}
                onDeleteActivity={() => {}}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
