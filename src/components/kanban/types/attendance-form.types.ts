
import { Attendance } from "../types"

export interface AttendanceFormProps {
  onSubmit: (attendance: Attendance) => void
  cardId: string
  clientName: string
}

export interface ResultButtonProps {
  result: 'matriculado' | 'negociacao' | 'perdido'
  selectedResult?: string
  onClick: () => void
}

export interface QualityScoreProps {
  value: string
  onChange: (value: string) => void
}

export interface NextContactDateProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
}

export interface ObservationsProps {
  value: string
  onChange: (value: string) => void
}
