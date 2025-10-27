/**
 * LOG: Componente de card individual de ocupação
 * DESCRIÇÃO: Exibe informações formatadas e ações de edição/exclusão
 * RESPONSABILIDADE: Apresentação visual e callbacks de ação
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Calendar, Clock, User } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CategorizedOccupation } from "../hooks/useCategorizedOccupations"

interface OccupationCardProps {
  occupation: CategorizedOccupation
  onEdit: (occupation: CategorizedOccupation) => void
  onDelete: (occupation: CategorizedOccupation) => void
}

/**
 * LOG: Formata data e hora para exibição
 */
const formatDateTime = (dateTime: string) => {
  return format(new Date(dateTime), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
}

/**
 * LOG: Formata duração em minutos para formato legível
 */
const formatDuration = (minutes: number) => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}min`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${mins}min`
  }
}

/**
 * LOG: Card individual de ocupação
 * Exibe informações formatadas e ações de edição/exclusão
 */
export function OccupationCard({ 
  occupation, 
  onEdit, 
  onDelete 
}: OccupationCardProps) {
  
  return (
    <div className="border border-border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors">
      {/* LOG: Cabeçalho com título e ações */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">
            {occupation.title}
          </h3>
          {occupation.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {occupation.description}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(occupation)}
            aria-label="Editar ocupação"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(occupation)}
            aria-label="Deletar ocupação"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* LOG: Informações detalhadas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(occupation.start_datetime)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatDuration(occupation.duration_minutes)}</span>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{occupation.created_by_name}</span>
        </div>
      </div>

      {/* LOG: Badge de status */}
      <div className="mt-3">
        <Badge variant="outline" className="text-xs border-primary text-primary">
          Ocupação Ativa
        </Badge>
      </div>
    </div>
  )
}
