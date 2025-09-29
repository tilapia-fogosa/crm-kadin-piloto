
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentItem } from "./AppointmentItem"
import { OccupationItem } from "./OccupationItem"
import { UserUnit } from "../../hooks/useUserUnit"
import { CalendarItem, isAppointment, isOccupation } from "../../types/calendar"

interface CalendarDayCellProps {
  day: number | null
  currentDate: Date
  isLoading: boolean
  calendarItems: CalendarItem[]
  onReschedule: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
  onOpenClient?: (clientId: string) => void
}

export function CalendarDayCell({
  day,
  currentDate,
  isLoading,
  calendarItems,
  onReschedule,
  userUnits,
  onOpenClient
}: CalendarDayCellProps) {
  // Log específico para dias com itens
  if (day && calendarItems.length > 0) {
    console.log(`📅 [CalendarDayCell] Dia ${day}: ${calendarItems.length} item(s)`)
    
    // Detalhar por tipo
    const appointments = calendarItems.filter(isAppointment)
    const occupations = calendarItems.filter(isOccupation)
    console.log(`📅 [CalendarDayCell] Dia ${day} detalhado:`, {
      appointments: appointments.length,
      occupations: occupations.length,
      items: calendarItems.map(item => ({ id: item.id, name: item.name, type: item.type }))
    })
  }
  
  const isCurrentDay = day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()

  // Função para obter o índice da unidade para usar com cores
  const getUnitIndex = (unitId: string): number => {
    if (!userUnits || userUnits.length === 0) {
      console.log('📅 [CalendarDayCell] userUnits indefinido ou vazio ao buscar índice para', unitId)
      return 0
    }
    
    const index = userUnits.findIndex(unit => unit.unit_id === unitId)
    
    if (index === -1) {
      console.log(`📅 [CalendarDayCell] Unidade não encontrada: ${unitId}`)
    }
    
    return index >= 0 ? index : 0
  }

  return (
    <div 
      className={`border min-h-[100px] p-2 ${
        !day ? 'bg-gray-50' : 
        isCurrentDay ? 'bg-emerald-50' : 'bg-white'
      }`}
    >
      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        day && (
          <>
            <div className={`text-right mb-1 ${
              isCurrentDay ? 'text-emerald-600 font-bold' : ''
            }`}>
              {day}
            </div>
            <div className="space-y-1">
              {calendarItems?.map(item => {
                if (isAppointment(item)) {
                  return (
                    <AppointmentItem
                      key={item.id}
                      appointment={{
                        id: item.id,
                        client_name: item.name,
                        scheduled_date: item.scheduled_date,
                        status: 'agendado',
                        unit_id: item.unit_id,
                        unit_name: item.unit_name
                      }}
                      onReschedule={onReschedule}
                      unitIndex={getUnitIndex(item.unit_id)}
                      onOpenClient={onOpenClient}
                    />
                  )
                } else if (isOccupation(item)) {
                  return (
                    <OccupationItem
                      key={item.id}
                      occupation={item}
                      unitIndex={getUnitIndex(item.unit_id)}
                    />
                  )
                }
                return null
              })}
            </div>
          </>
        )
      )}
    </div>
  )
}
