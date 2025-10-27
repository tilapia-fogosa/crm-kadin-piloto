
/**
 * LOG: Página de Agenda com ocupações categorizadas
 * DESCRIÇÃO: Exibe ocupações em accordion (Próximos 7 dias, Futuras, Passadas)
 * OTIMIZAÇÃO: Remove AppointmentScheduler e usa categorização via RPC
 */

import { OccupationsList } from "@/components/schedule/components/OccupationsList"
import { useUnit } from "@/contexts/UnitContext"

export default function SchedulePage() {
  const { selectedUnitId } = useUnit()

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-2xl font-bold mb-2">Agenda</h1>
      
      {selectedUnitId ? (
        <OccupationsList unitId={selectedUnitId} />
      ) : (
        <div className="p-6 bg-amber-50 text-amber-800 rounded-md">
          Selecione uma unidade para visualizar a agenda disponível
        </div>
      )}
    </div>
  )
}
