
import { format } from "date-fns"
import { ScheduledAppointment } from "../../types"
import { Skeleton } from "@/components/ui/skeleton"
import { AppointmentItem } from "./AppointmentItem"

interface CalendarDayCellProps {
  day: number | null
  currentDate: Date
  isLoading: boolean
  appointments: ScheduledAppointment[]
  onReschedule: (clientId: string, clientName: string) => void
}

export function CalendarDayCell({
  day,
  currentDate,
  isLoading,
  appointments,
  onReschedule
}: CalendarDayCellProps) {
  const isCurrentDay = day === new Date().getDate() && 
                      currentDate.getMonth() === new Date().getMonth() &&
                      currentDate.getFullYear() === new Date().getFullYear()

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
                />
              ))}
            </div>
          </>
        )
      )}
    </div>
  )
}
