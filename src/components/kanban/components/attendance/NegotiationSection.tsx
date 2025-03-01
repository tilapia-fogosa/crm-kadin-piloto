
import { NextContactDate } from "./NextContactDate"
import { Observations } from "./Observations"

interface NegotiationSectionProps {
  nextContactDate: Date | undefined
  observations: string
  onDateChange: (date: Date | undefined) => void
  onObservationsChange: (value: string) => void
}

export function NegotiationSection({
  nextContactDate,
  observations,
  onDateChange,
  onObservationsChange
}: NegotiationSectionProps) {
  return (
    <>
      <NextContactDate 
        date={nextContactDate} 
        onDateChange={onDateChange} 
      />
      <Observations 
        value={observations} 
        onChange={onObservationsChange} 
      />
    </>
  )
}
