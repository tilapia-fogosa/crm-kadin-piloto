
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
  onConfirmPresence: (clientId: string, clientName: string) => void
  onCancelAppointment: (clientId: string, clientName: string) => void
  unitIndex: number
}

export function AppointmentItem({ 
  appointment, 
  onReschedule, 
  onConfirmPresence,
  onCancelAppointment,
  unitIndex 
}: AppointmentItemProps) {
  console.log('📅 [AppointmentItem] Renderizando agendamento:', appointment.client_name)
  
  // Verificação de segurança para índice negativo
  const safeUnitIndex = unitIndex >= 0 ? unitIndex : 0;
  
  // Obter a cor para a unidade baseada no índice
  const unitColor = getUnitColor(safeUnitIndex);
  const textColorClass = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-800';
  
  console.log(`📅 [AppointmentItem] Renderizando ${appointment.client_name} com cor da unidade ${safeUnitIndex}:`, unitColor);
  
  return (
    <div 
      className={`text-xs p-1 rounded flex items-center justify-between group ${textColorClass}`}
      style={{ backgroundColor: unitColor }}
    >
      <span>
        {format(new Date(appointment.scheduled_date), 'HH:mm')} - {appointment.client_name}
      </span>
      
      {/* Botão sempre visível - removida a classe opacity-0 group-hover:opacity-100 */}
      <div className="transition-opacity">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-4 w-4 p-0 ${textColorClass} hover:bg-opacity-20`}
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onReschedule(appointment.id, appointment.client_name)}>
              Remarcar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onConfirmPresence(appointment.id, appointment.client_name)}>
              Confirmar Presença
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onCancelAppointment(appointment.id, appointment.client_name)}>
              Cancelar Agendamento
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
