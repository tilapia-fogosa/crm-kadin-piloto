
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface FilterBadgeProps {
  count: number
  onClear: () => void
}

/**
 * Componente que exibe uma badge com a contagem de filtros ativos
 * 
 * @param count - Número de filtros ativos
 * @param onClear - Função para limpar todos os filtros
 */
export function FilterBadge({ count, onClear }: FilterBadgeProps) {
  if (count === 0) return null

  return (
    <Badge variant="secondary" className="flex items-center gap-1">
      {count} {count === 1 ? 'filtro ativo' : 'filtros ativos'}
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 rounded-full p-0 ml-1" 
        onClick={onClear}
      >
        <X className="h-3 w-3" />
        <span className="sr-only">Limpar filtros</span>
      </Button>
    </Badge>
  )
}
