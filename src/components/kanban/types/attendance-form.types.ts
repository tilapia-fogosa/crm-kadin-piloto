
import { Attendance } from "../types"

export interface AttendanceFormProps {
  onSubmit: (attendance: Attendance) => void
  cardId: string
  clientName: string
  isDisabled?: boolean
}

export interface ResultButtonProps {
  result: 'matriculado' | 'negociacao' | 'perdido'
  selectedResult?: string
  onClick: () => void
  disabled?: boolean
}

export interface QualityScoreProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export interface NextContactDateProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  disabled?: boolean
}

export interface ObservationsProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}
