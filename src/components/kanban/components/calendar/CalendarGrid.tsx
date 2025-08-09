
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDayCell } from "./CalendarDayCell"
import { UserUnit } from "../../hooks/useUserUnit"

interface AgendaLead {
  id: string
  name: string
  scheduled_date: string
  unit_id: string
  unit_name?: string
}

interface CalendarGridProps {
  currentDate: Date
  isLoadingAppointments: boolean
  scheduledAppointments?: AgendaLead[]
  onReschedule: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
  onOpenClient?: (clientId: string) => void
}

export function CalendarGrid({
  currentDate,
  isLoadingAppointments,
  scheduledAppointments = [],
  onReschedule,
  userUnits,
  onOpenClient
}: CalendarGridProps) {
  console.log('📅 [CalendarGrid] Renderizando com unidades:', userUnits?.length)
  console.log('📅 [CalendarGrid] Total de agendamentos recebidos:', scheduledAppointments.length)

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = startOfMonth(currentDate)
  const startingDayIndex = getDay(firstDayOfMonth)

  const generateCalendarDays = () => {
    console.log('📅 [CalendarGrid] Gerando dias do calendário para', format(currentDate, 'MMMM yyyy'))
    console.log('📅 [CalendarGrid] Primeiro dia do mês cai em:', startingDayIndex)
    console.log('📅 [CalendarGrid] Total de dias no mês:', daysInMonth)
    
    const days = []
    for (let i = 0; i < startingDayIndex; i++) {
      days.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    return days
  }

  const getDayAppointments = (dayNumber: number) => {
    if (dayNumber <= 0 || dayNumber > daysInMonth || !scheduledAppointments) return []
    
    return scheduledAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_date)
      const appointmentDay = appointmentDate.getDate()
      const appointmentMonth = appointmentDate.getMonth()
      const appointmentYear = appointmentDate.getFullYear()
      
      const isSameDay = appointmentDay === dayNumber &&
                         appointmentMonth === currentDate.getMonth() &&
                         appointmentYear === currentDate.getFullYear()
      
      if (isSameDay) {
        console.log(`✅ [CalendarGrid] Agendamento encontrado para dia ${dayNumber}:`, {
          id: appointment.id,
          name: appointment.name,
          scheduled_date: appointment.scheduled_date,
          unit_name: appointment.unit_name
        })
      }
      
      return isSameDay
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const days = generateCalendarDays()

  // Debug adicional - mostrar distribuição de agendamentos por dia
  if (scheduledAppointments.length > 0) {
    const appointmentsByDay = scheduledAppointments.reduce((acc, appointment) => {
      const day = new Date(appointment.scheduled_date).getDate()
      const month = new Date(appointment.scheduled_date).getMonth()
      const year = new Date(appointment.scheduled_date).getFullYear()
      
      if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        acc[day] = (acc[day] || 0) + 1
      }
      return acc
    }, {} as Record<number, number>)
    
    console.log('📅 [CalendarGrid] Distribuição de agendamentos por dia:', appointmentsByDay)
  }

  return (
    <div className="grid grid-cols-7 gap-0.5 mt-4 text-sm">
      <div className="text-center font-semibold p-2">DOM</div>
      <div className="text-center font-semibold p-2">SEG</div>
      <div className="text-center font-semibold p-2">TER</div>
      <div className="text-center font-semibold p-2">QUA</div>
      <div className="text-center font-semibold p-2">QUI</div>
      <div className="text-center font-semibold p-2">SEX</div>
      <div className="text-center font-semibold p-2">SÁB</div>

      {days.map((day, index) => (
        <CalendarDayCell
          key={index}
          day={day}
          currentDate={currentDate}
          isLoading={isLoadingAppointments}
          appointments={day ? getDayAppointments(day) : []}
          onReschedule={onReschedule}
          userUnits={userUnits}
          onOpenClient={onOpenClient}
        />
      ))}
    </div>
  )
}
