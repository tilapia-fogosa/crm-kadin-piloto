
import { format, getDaysInMonth, startOfMonth, getDay } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarDayCell } from "./CalendarDayCell"
import { UserUnit } from "../../hooks/useUserUnit"
import { CalendarItem } from "../../types/calendar"

interface CalendarGridProps {
  currentDate: Date
  isLoadingItems: boolean
  calendarItems?: CalendarItem[]
  onReschedule: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
  onOpenClient?: (clientId: string) => void
}

export function CalendarGrid({
  currentDate,
  isLoadingItems,
  calendarItems = [],
  onReschedule,
  userUnits,
  onOpenClient
}: CalendarGridProps) {
  console.log('📅 [CalendarGrid] Renderizando com unidades:', userUnits?.length)
  console.log('📅 [CalendarGrid] Total de itens do calendário recebidos:', calendarItems.length)
  
  // Log detalhado de distribuição por tipo
  const appointmentCount = calendarItems.filter(item => item.type === 'appointment').length
  const occupationCount = calendarItems.filter(item => item.type === 'occupation').length
  console.log('📊 [CalendarGrid] Distribuição por tipo:', { 
    appointments: appointmentCount, 
    occupations: occupationCount,
    total: calendarItems.length 
  })

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

  const getDayItems = (dayNumber: number) => {
    if (dayNumber <= 0 || dayNumber > daysInMonth || !calendarItems) return []
    
    return calendarItems.filter(item => {
      const itemDate = new Date(item.scheduled_date)
      const itemDay = itemDate.getDate()
      const itemMonth = itemDate.getMonth()
      const itemYear = itemDate.getFullYear()
      
      const isSameDay = itemDay === dayNumber &&
                         itemMonth === currentDate.getMonth() &&
                         itemYear === currentDate.getFullYear()
      
      if (isSameDay) {
        console.log(`✅ [CalendarGrid] Item encontrado para dia ${dayNumber}:`, {
          id: item.id,
          name: item.name,
          type: item.type,
          scheduled_date: item.scheduled_date,
          unit_name: item.unit_name
        })
      }
      
      return isSameDay
    }).sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
  }

  const days = generateCalendarDays()

  // Debug adicional - mostrar distribuição de itens por dia
  if (calendarItems.length > 0) {
    const itemsByDay = calendarItems.reduce((acc, item) => {
      const day = new Date(item.scheduled_date).getDate()
      const month = new Date(item.scheduled_date).getMonth()
      const year = new Date(item.scheduled_date).getFullYear()
      
      if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
        const key = `${day}-${item.type}`
        acc[key] = (acc[key] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    console.log('📅 [CalendarGrid] Distribuição de itens por dia e tipo:', itemsByDay)
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
          isLoading={isLoadingItems}
          calendarItems={day ? getDayItems(day) : []}
          onReschedule={onReschedule}
          userUnits={userUnits}
          onOpenClient={onOpenClient}
        />
      ))}
    </div>
  )
}
