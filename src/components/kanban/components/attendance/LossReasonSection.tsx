
import { LossReasonSelect } from "../../LossReasonSelect"
import { Observations } from "./Observations"

interface LossReasonSectionProps {
  selectedReasons: string[]
  observations: string
  onSelectReason: (reasonId: string) => void
  onObservationsChange: (value: string) => void
}

export function LossReasonSection({
  selectedReasons,
  observations,
  onSelectReason,
  onObservationsChange
}: LossReasonSectionProps) {
  return (
    <>
      <div className="space-y-2">
        <LossReasonSelect
          selectedReasons={selectedReasons}
          onSelectReason={onSelectReason}
        />
      </div>
      <Observations 
        value={observations} 
        onChange={onObservationsChange} 
      />
    </>
  )
}
