
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScheduledAppointment } from "../../types"

interface AppointmentItemProps {
  appointment: ScheduledAppointment
  onReschedule: (clientId: string, clientName: string) => void
}

export function AppointmentItem({ appointment, onReschedule }: AppointmentItemProps) {
  return (
    <div className="text-xs p-1 bg-gray-100 rounded flex items-center justify-between group">
      <span>
        {format(new Date(appointment.scheduled_date), 'HH:mm')} - {appointment.client_name}
      </span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReschedule(appointment.id, appointment.client_name)}>
              Remarcar
            </DropdownMenuItem>
            <DropdownMenuItem>Confirmar Presença</DropdownMenuItem>
            <DropdownMenuItem>Cancelar Agendamento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
