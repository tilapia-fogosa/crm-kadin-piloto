import { format } from "date-fns"
import { Clock, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CalendarOccupation } from "../../types/calendar"

interface OccupationItemProps {
  occupation: CalendarOccupation
  unitIndex: number
}

export function OccupationItem({ occupation, unitIndex }: OccupationItemProps) {
  console.log(`OccupationItem - Renderizando ocupação: ${occupation.name}`)
  
  return (
    <div className="text-xs p-1 rounded border-l-4 border-orange-500 bg-orange-50 text-gray-800">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          {/* Horário e título */}
          <div className="font-medium truncate flex items-center gap-1">
            <Calendar className="h-3 w-3 text-orange-600" />
            <span>{format(new Date(occupation.scheduled_date), 'HH:mm')} - {occupation.name}</span>
          </div>
          
          {/* Informações da ocupação */}
          <div className="flex items-center gap-2 mt-1">
            {/* Badge identificando como ocupação */}
            <Badge 
              variant="outline" 
              className="text-[10px] px-1 py-0 border-orange-300 text-orange-700"
            >
              Ocupação
            </Badge>
            
            {/* Duração */}
            <div className="flex items-center gap-0.5 text-[10px] text-orange-600">
              <Clock className="h-2.5 w-2.5" />
              <span>{occupation.duration_minutes}min</span>
            </div>
          </div>
          
          {/* Criador da ocupação */}
          {occupation.created_by_name && (
            <div className="flex items-center gap-0.5 text-[10px] text-gray-600 mt-0.5">
              <User className="h-2.5 w-2.5" />
              <span className="truncate">{occupation.created_by_name}</span>
            </div>
          )}
          
          {/* Descrição se houver */}
          {occupation.description && (
            <div className="text-[10px] text-gray-600 mt-0.5 truncate" title={occupation.description}>
              {occupation.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}