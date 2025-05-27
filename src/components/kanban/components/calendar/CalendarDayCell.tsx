
import { isSameDay, format } from "date-fns"
import { AppointmentItem } from "./AppointmentItem"
import { ScheduledAppointment } from "../../types"
import { UserUnit } from "../../hooks/useUserUnit"

interface CalendarDayCellProps {
  date: Date
  displayMonth?: Date
  appointments: ScheduledAppointment[]
  onReschedule: (clientId: string, clientName: string) => void
  onConfirmPresence: (clientId: string, clientName: string) => void
  onCancelAppointment: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
}

export function CalendarDayCell({ 
  date, 
  appointments, 
  onReschedule,
  onConfirmPresence,
  onCancelAppointment,
  userUnits 
}: CalendarDayCellProps) {
  console.log('📅 [CalendarDayCell] Renderizando dia:', format(date, 'dd/MM/yyyy'))
  
  // Filtrar agendamentos para este dia específico
  const dayAppointments = appointments.filter(appointment => 
    isSameDay(new Date(appointment.scheduled_date), date)
  )

  console.log(`📅 [CalendarDayCell] Agendamentos para ${format(date, 'dd/MM')}:`, dayAppointments.length)

  return (
    <div className="h-full min-h-[100px] p-1">
      <div className="font-medium text-center mb-1">
        {format(date, 'd')}
      </div>
      
      <div className="space-y-1">
        {dayAppointments.map((appointment) => {
          // Encontrar o índice da unidade para definir a cor
          const unitIndex = userUnits?.findIndex(unit => unit.unit_id === appointment.unit_id) ?? 0
          
          return (
            <AppointmentItem
              key={appointment.id}
              appointment={appointment}
              onReschedule={onReschedule}
              onConfirmPresence={onConfirmPresence}
              onCancelAppointment={onCancelAppointment}
              unitIndex={unitIndex}
            />
          )
        })}
      </div>
    </div>
  )
}
