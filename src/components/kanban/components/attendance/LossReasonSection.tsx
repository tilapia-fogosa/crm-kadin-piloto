
import { LossReasonSelect } from "../../LossReasonSelect"
import { Observations } from "./Observations"

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
  return (
    <div className="space-y-4">
      <LossReasonSelect
        selectedReasons={selectedReasons}
        onSelect={onSelectReason}
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
