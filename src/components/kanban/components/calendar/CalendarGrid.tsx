
import { Calendar } from "@/components/ui/calendar"
import { CalendarDayCell } from "./CalendarDayCell"
import { Skeleton } from "@/components/ui/skeleton"
import { ScheduledAppointment } from "../../types"
import { UserUnit } from "../../hooks/useUserUnit"
import { ptBR } from "date-fns/locale"

interface CalendarGridProps {
  currentDate: Date
  isLoadingAppointments: boolean
  scheduledAppointments: ScheduledAppointment[]
  onReschedule: (clientId: string, clientName: string) => void
  onConfirmPresence: (clientId: string, clientName: string) => void
  onCancelAppointment: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
}

export function CalendarGrid({
  currentDate,
  isLoadingAppointments,
  scheduledAppointments,
  onReschedule,
  onConfirmPresence,
  onCancelAppointment,
  userUnits
}: CalendarGridProps) {
  console.log('📅 [CalendarGrid] Renderizando calendário para:', currentDate.getMonth() + 1, '/', currentDate.getFullYear())
  console.log('📅 [CalendarGrid] Agendamentos recebidos:', scheduledAppointments?.length || 0)
  
  if (isLoadingAppointments) {
    return (
      <div className="flex items-center justify-center p-8">
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <Calendar
      mode="single"
      locale={ptBR}
      month={currentDate}
      className="w-full"
      components={{
        DayContent: (props) => (
          <CalendarDayCell
            {...props}
            appointments={scheduledAppointments}
            onReschedule={onReschedule}
            onConfirmPresence={onConfirmPresence}
            onCancelAppointment={onCancelAppointment}
            userUnits={userUnits}
          />
        )
      }}
    />
  )
}
