
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDayCell } from "./CalendarDayCell"
import { ScheduledAppointment } from "../../types"
import { UserUnit } from "../../hooks/useUserUnit"

interface CalendarGridProps {
  currentDate: Date
  isLoadingAppointments: boolean
  scheduledAppointments?: ScheduledAppointment[]
  onReschedule: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
}

export function CalendarGrid({
  currentDate,
  isLoadingAppointments,
  scheduledAppointments = [],
  onReschedule,
  userUnits
}: CalendarGridProps) {
  console.log('Renderizando CalendarGrid com unidades:', userUnits?.length);
  console.log('📅 CalendarGrid - Total de agendamentos recebidos:', scheduledAppointments.length);

  const daysInMonth = getDaysInMonth(currentDate)
  const firstDayOfMonth = startOfMonth(currentDate)
  const startingDayIndex = getDay(firstDayOfMonth)

  const generateCalendarDays = () => {
    console.log('Gerando dias do calendário para', format(currentDate, 'MMMM yyyy'))
    console.log('Primeiro dia do mês cai em:', startingDayIndex)
    console.log('Total de dias no mês:', daysInMonth)
    
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
    
    // Simplificar a comparação de datas - usar apenas o dia do mês
    return scheduledAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_date)
      const appointmentDay = appointmentDate.getDate()
      const appointmentMonth = appointmentDate.getMonth()
      const appointmentYear = appointmentDate.getFullYear()
      
      const isSameDay = appointmentDay === dayNumber &&
                         appointmentMonth === currentDate.getMonth() &&
                         appointmentYear === currentDate.getFullYear()
      
      // Log apenas para debug específico do dia 30
      if (dayNumber === 30 && isSameDay) {
        console.log(`✅ Agendamento encontrado para dia 30:`, {
          id: appointment.id,
          client_name: appointment.client_name,
          scheduled_date: appointment.scheduled_date,
          appointmentDay,
          appointmentMonth: appointmentMonth + 1,
          appointmentYear,
          currentMonth: currentDate.getMonth() + 1,
          currentYear: currentDate.getFullYear()
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
    
    console.log('📅 CalendarGrid - Distribuição de agendamentos por dia:', appointmentsByDay)
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
        />
      ))}
    </div>
  )
}
