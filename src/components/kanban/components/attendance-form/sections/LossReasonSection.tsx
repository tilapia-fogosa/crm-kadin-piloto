
import { LossReasonSelect } from "../../../LossReasonSelect"
import { Observations } from "../../attendance/Observations"

interface LossReasonSectionProps {
  selectedReasons: string[]
  observations: string
  onSelectReason: (reasonId: string) => void
  onObservationsChange: (value: string) => void
  disabled?: boolean
}

export function LossReasonSection({
  selectedReasons,
  observations,
  onSelectReason,
  onObservationsChange,
  disabled
}: LossReasonSectionProps) {
  console.log('LossReasonSection - Renderizando com', selectedReasons.length, 'motivos selecionados')
  
  return (
    <div className="space-y-4">
      <LossReasonSelect
        selectedReasons={selectedReasons}
        onSelectReason={onSelectReason}
        disabled={disabled}
      />
      <Observations
        value={observations}
        onChange={onObservationsChange}
        disabled={disabled}
      />
    </div>
  )
}
