
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDayCell } from "./CalendarDayCell"
import { ScheduledAppointment } from "../../types"

interface CalendarGridProps {
  currentDate: Date
  isLoadingAppointments: boolean
  scheduledAppointments?: ScheduledAppointment[]
  onReschedule: (clientId: string, clientName: string) => void
}

export function CalendarGrid({
  currentDate,
  isLoadingAppointments,
  scheduledAppointments,
  onReschedule
}: CalendarGridProps) {
  console.log('Renderizando CalendarGrid')

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
    if (dayNumber <= 0 || dayNumber > daysInMonth) return []
    
    return scheduledAppointments?.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduled_date)
      return appointmentDate.getDate() === dayNumber &&
             appointmentDate.getMonth() === currentDate.getMonth() &&
             appointmentDate.getFullYear() === currentDate.getFullYear()
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const days = generateCalendarDays()

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
        />
      ))}
    </div>
  )
}
