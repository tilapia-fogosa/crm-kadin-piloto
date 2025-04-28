
import { format } from "date-fns"
import { ScheduledAppointment } from "../../types"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentItem } from "./AppointmentItem"
import { UserUnit } from "../../hooks/useUserUnit"

interface CalendarDayCellProps {
  day: number | null
  currentDate: Date
  isLoading: boolean
  appointments: ScheduledAppointment[]
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
  // Adicionar log específico para o dia 30
  if (day === 30) {
    console.log(`CalendarDayCell - Dia 30: Recebeu ${appointments.length} agendamentos`)
    if (appointments.length > 0) {
      console.log('Detalhes dos agendamentos do dia 30:', appointments)
    }
  }
  
  const isCurrentDay = day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()

  // Função para obter o índice da unidade para usar com cores
  const getUnitIndex = (unitId: string): number => {
    if (!userUnits) return 0;
    const index = userUnits.findIndex(unit => unit.unit_id === unitId);
    return index >= 0 ? index : 0;
  };

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
                  appointment={appointment}
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
