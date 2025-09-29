
import { AppointmentScheduler } from "@/components/appointments/AppointmentScheduler"
import { OccupationsList } from "@/components/schedule/components/OccupationsList"
import { useScheduleOccupations } from "@/components/schedule/hooks/useScheduleOccupations"
import { useUnit } from "@/contexts/UnitContext"
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function SchedulePage() {
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null)
  const { selectedUnitId } = useUnit()
  
  // Hook para gerenciar ocupações
  const {
    occupations,
    isLoading: isLoadingOccupations,
    createOccupation,
    updateOccupation,
    deleteOccupation
  } = useScheduleOccupations(selectedUnitId)

  const handleSlotSelect = (date: Date) => {
    console.log('Slot selecionado na página:', date)
    setSelectedSlot(date)
    // Aqui podemos adicionar lógica adicional específica da página
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-2">Agenda</h1>
      
      {selectedSlot && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <h2 className="text-lg font-medium mb-2 text-orange-800">Horário selecionado:</h2>
          <p className="text-orange-700">
            {format(selectedSlot, "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        </div>
      )}
      
      {selectedUnitId ? (
        <>
          <div className="space-y-6">
            <AppointmentScheduler 
              onSelectSlot={handleSlotSelect}
              simplified={false}
              unitId={selectedUnitId}
            />
          </div>

          <div className="space-y-6">
            <OccupationsList
              occupations={occupations}
              onCreateOccupation={createOccupation}
              onUpdateOccupation={updateOccupation}
              onDeleteOccupation={deleteOccupation}
              unitId={selectedUnitId}
              isLoading={isLoadingOccupations}
            />
          </div>
        </>
      ) : (
        <div className="p-6 bg-amber-50 text-amber-800 rounded-md">
          Selecione uma unidade para visualizar a agenda disponível
        </div>
      )}
    </div>
  )
}
