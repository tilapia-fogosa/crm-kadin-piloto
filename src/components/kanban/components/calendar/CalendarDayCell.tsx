
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentItem } from "./AppointmentItem"
import { UserUnit } from "../../hooks/useUserUnit"

interface AgendaLead {
  id: string
  name: string
  scheduled_date: string
  unit_id: string
  unit_name?: string
}

interface CalendarDayCellProps {
  day: number | null
  currentDate: Date
  isLoading: boolean
  appointments: AgendaLead[]
  onReschedule: (clientId: string, clientName: string) => void
  userUnits?: UserUnit[]
}

export function CalendarDayCell({
  day,
  currentDate,
  isLoading,
  appointments,
  onReschedule,
  userUnits
}: CalendarDayCellProps) {
  // Log específico para dias com agendamentos
  if (day && appointments.length > 0) {
    console.log(`📅 [CalendarDayCell] Dia ${day}: ${appointments.length} agendamento(s)`)
    console.log(`📅 [CalendarDayCell] Detalhes do dia ${day}:`, appointments)
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
              {appointments?.map(appointment => (
                <AppointmentItem
                  key={appointment.id}
                  appointment={{
                    id: appointment.id,
                    client_name: appointment.name,
                    scheduled_date: appointment.scheduled_date,
                    status: 'agendado',
                    unit_id: appointment.unit_id,
                    unit_name: appointment.unit_name
                  }}
                  onReschedule={onReschedule}
                  unitIndex={getUnitIndex(appointment.unit_id)}
                />
              ))}
            </div>
          </>
        )
      )}
    </div>
  )
}
