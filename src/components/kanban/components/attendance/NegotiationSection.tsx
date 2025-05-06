
import { NextContactDateTime } from "./NextContactDateTime"
import { Observations } from "./Observations"

interface NegotiationSectionProps {
  nextContactDate: Date | undefined
  observations: string
  onDateChange: (date: Date | undefined) => void
  onObservationsChange: (value: string) => void
  disabled?: boolean
}

export function NegotiationSection({
  nextContactDate,
  observations,
  onDateChange,
  onObservationsChange,
  disabled
}: NegotiationSectionProps) {
  console.log('NegotiationSection - Renderizando seção de negociação')
  
  return (
    <div className="space-y-4">
      <NextContactDateTime
        date={nextContactDate}
        onDateChange={onDateChange}
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
