
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
import { getUnitColor, shouldUseWhiteText } from "../../utils/unitColors"

interface AppointmentItemProps {
  appointment: ScheduledAppointment
  onReschedule: (clientId: string, clientName: string) => void
  unitIndex: number
  onOpenClient?: (clientId: string) => void
}

export function AppointmentItem({ appointment, onReschedule, unitIndex, onOpenClient }: AppointmentItemProps) {
  // Verificação de segurança para índice negativo
  const safeUnitIndex = unitIndex >= 0 ? unitIndex : 0;
  
  // Obter a cor para a unidade baseada no índice
  const unitColor = getUnitColor(safeUnitIndex);
  const textColorClass = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-800';
  
  console.log(`AppointmentItem - Renderizando ${appointment.client_name} com cor da unidade ${safeUnitIndex}:`, unitColor);
  
  return (
    <div 
      className={`text-xs p-1 rounded flex items-center justify-between group cursor-pointer ${textColorClass}`}
      style={{ backgroundColor: unitColor }}
      onClick={() => onOpenClient?.(appointment.id)}
    >
      <span>
        {format(new Date(appointment.scheduled_date), 'HH:mm')} - {appointment.client_name}
      </span>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-4 w-4 p-0 ${textColorClass} hover:bg-opacity-20`}
              onClick={(e) => e.stopPropagation()}
            >
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
