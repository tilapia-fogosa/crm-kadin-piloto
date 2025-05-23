
import { Scheduling } from "./types"
import { AppointmentScheduler } from "../appointments/AppointmentScheduler"
import { useSchedulingForm } from "./hooks/useSchedulingForm"
import { SchedulingContactType } from "./components/scheduling/SchedulingContactType"
import { UnitSelection } from "./components/scheduling/UnitSelection"
import { ValorizationCheckbox } from "./components/scheduling/ValorizationCheckbox"
import { SchedulingActionButton } from "./components/scheduling/SchedulingActionButton"
import { NotesField } from "./components/contact-attempt/NotesField"
import { useUnit } from "@/contexts/UnitContext"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
  isDisabled?: boolean
}

export function SchedulingForm({ onSubmit, cardId, isDisabled = false }: SchedulingFormProps) {
  const { availableUnits } = useUnit()
  
  // Utilizamos o hook personalizado para gerenciar o estado e lógica do formulário
  const {
    notes,
    scheduledDate,
    valorizacaoDiaAnterior,
    contactType,
    selectedUnitId,
    hasMultipleUnits,
    handleNotesChange,
    handleScheduledDateChange,
    handleValorizacaoChange,
    handleContactTypeChange,
    handleUnitChange,
    handleSubmit
  } = useSchedulingForm(cardId, onSubmit)

  // Log para rastreamento
  console.log('SchedulingForm - Renderizando com unitId:', selectedUnitId, 'disabled:', isDisabled)
  console.log('SchedulingForm - Usuário tem múltiplas unidades?', hasMultipleUnits ? 'Sim' : 'Não')

  return (
    <div className="space-y-4">
      <SchedulingContactType 
        contactType={contactType} 
        onContactTypeChange={handleContactTypeChange}
        disabled={isDisabled}
      />

      {/* Seleção de unidade - sempre exibida */}
      <UnitSelection 
        onUnitChange={handleUnitChange}
        availableUnitsCount={availableUnits.length}
        selectedUnitId={selectedUnitId || undefined}
        disabled={isDisabled}
      />

      {/* Só exibe o seletor de data se uma unidade estiver selecionada */}
      {selectedUnitId ? (
        <div className="space-y-2">
          <AppointmentScheduler 
            key={`appointment-scheduler-${selectedUnitId}`}
            onSelectSlot={handleScheduledDateChange}
            simplified={true}
            unitId={selectedUnitId}
          />
        </div>
      ) : (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-md text-sm">
          Selecione uma unidade para visualizar a agenda disponível
        </div>
      )}

      <NotesField
        notes={notes}
        onNotesChange={handleNotesChange}
        disabled={isDisabled}
      />

      <ValorizationCheckbox 
        checked={valorizacaoDiaAnterior}
        onCheckedChange={handleValorizacaoChange}
        disabled={isDisabled}
      />

      <SchedulingActionButton 
        onSubmit={handleSubmit} 
        disabled={isDisabled || !selectedUnitId || !scheduledDate || !contactType}
      />
    </div>
  )
}
