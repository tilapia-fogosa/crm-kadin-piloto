// ============= CALENDÁRIO TYPES - ESTRUTURAS UNIFICADAS =============

// Interface base para itens do calendário
export interface BaseCalendarItem {
  id: string
  name: string
  scheduled_date: string
  unit_id: string
  unit_name?: string
}

// Tipos específicos de itens
export interface CalendarAppointment extends BaseCalendarItem {
  type: 'appointment'
}

export interface CalendarOccupation extends BaseCalendarItem {
  type: 'occupation'
  duration_minutes: number
  description?: string
  created_by_name?: string
}

// Union type para todos os itens do calendário
export type CalendarItem = CalendarAppointment | CalendarOccupation

// Interface para o resultado do compound hook
export interface CalendarData {
  items: CalendarItem[]
  appointments: CalendarAppointment[]
  occupations: CalendarOccupation[]
  isLoading: boolean
  currentDate: Date
  userUnits?: any[]
  isLoadingUnits: boolean
  handlePreviousMonth: () => void
  handleNextMonth: () => void
  refetch: () => Promise<void>
}

// Type guards para identificar tipos de itens
export function isAppointment(item: CalendarItem): item is CalendarAppointment {
  return item.type === 'appointment'
}

export function isOccupation(item: CalendarItem): item is CalendarOccupation {
  return item.type === 'occupation'
}