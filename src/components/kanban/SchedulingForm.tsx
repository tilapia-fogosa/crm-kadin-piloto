
import { Scheduling } from "./types"
import { AppointmentScheduler } from "../appointments/AppointmentScheduler"
import { useSchedulingForm } from "./hooks/useSchedulingForm"
import { SchedulingContactType } from "./components/scheduling/SchedulingContactType"
import { UnitSelection } from "./components/scheduling/UnitSelection"
import { ValorizationCheckbox } from "./components/scheduling/ValorizationCheckbox"
import { SchedulingActionButton } from "./components/scheduling/SchedulingActionButton"
import { NotesField } from "./components/contact-attempt/NotesField"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
}

export function SchedulingForm({ onSubmit, cardId }: SchedulingFormProps) {
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
  console.log('SchedulingForm - Renderizando com unitId:', selectedUnitId)
  console.log('SchedulingForm - Usuário tem múltiplas unidades?', hasMultipleUnits ? 'Sim' : 'Não')

  return (
    <div className="space-y-4">
      <SchedulingContactType 
        contactType={contactType || 'phone'} 
        onContactTypeChange={handleContactTypeChange} 
      />

      {/* Seleção de unidade (exibida apenas quando o usuário tem acesso a múltiplas unidades) */}
      {hasMultipleUnits && (
        <UnitSelection 
          onUnitChange={handleUnitChange}
          availableUnitsCount={hasMultipleUnits ? 2 : 1}
        />
      )}

      {/* Só exibe o seletor de data se uma unidade estiver selecionada */}
      {selectedUnitId && (
        <div className="space-y-2">
          <AppointmentScheduler 
            onSelectSlot={handleScheduledDateChange}
            simplified={true}
            unitId={selectedUnitId}
          />
        </div>
      )}

      <NotesField
        notes={notes}
        onNotesChange={handleNotesChange}
      />

      <ValorizationCheckbox 
        checked={valorizacaoDiaAnterior}
        onCheckedChange={handleValorizacaoChange}
      />

      <SchedulingActionButton onSubmit={handleSubmit} />
    </div>
  )
}
