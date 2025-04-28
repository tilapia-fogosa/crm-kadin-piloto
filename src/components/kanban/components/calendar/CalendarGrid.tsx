
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDayCell } from "./CalendarDayCell"
import { ScheduledAppointment } from "../../types"
import { normalizeDate } from "@/utils/date"
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
    
    // Criamos uma data normalizada para o dia atual no mês corrente
    const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber)
    
    return scheduledAppointments.filter(appointment => {
      // Usamos a função normalizeDate para evitar problemas de fuso horário
      const appointmentDate = normalizeDate(new Date(appointment.scheduled_date)) as Date
      const normalizedTargetDate = normalizeDate(targetDate) as Date
      
      // Comparamos apenas ano, mês e dia
      const isSameDay = appointmentDate.getDate() === normalizedTargetDate.getDate() &&
                         appointmentDate.getMonth() === normalizedTargetDate.getMonth() &&
                         appointmentDate.getFullYear() === normalizedTargetDate.getFullYear()
      
      // Para debug - APENAS logar quando encontramos agendamentos para o dia 30
      if (dayNumber === 30 && isSameDay) {
        console.log(`Agendamento encontrado para dia 30:`, {
          id: appointment.id,
          client_name: appointment.client_name,
          scheduled_date: appointment.scheduled_date,
          appointmentDate: format(appointmentDate, 'yyyy-MM-dd HH:mm:ss'),
          normalizedTargetDate: format(normalizedTargetDate, 'yyyy-MM-dd')
        })
      }
      
      return isSameDay
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
          userUnits={userUnits}
        />
      ))}
    </div>
  )
}
