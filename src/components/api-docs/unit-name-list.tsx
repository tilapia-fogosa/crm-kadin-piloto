
import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Badge } from "@/components/ui/badge"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface UnitNameListProps {
  unitIds: string[]
}

export function UnitNameList({ unitIds }: UnitNameListProps) {
  // Consulta para buscar informações sobre as unidades
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units-for-list'],
    queryFn: async () => {
      console.log('Buscando informações das unidades para lista')
      
      const { data, error } = await supabase
        .from('units')
        .select('id, name, city')
        .eq('active', true)
      
      if (error) {
        console.error('Erro ao buscar unidades:', error)
        throw error
      }
      
      console.log('Unidades carregadas:', data)
      return data || []
    },
  })

  // Filtrar apenas as unidades selecionadas
  const selectedUnits = units.filter(unit => unitIds.includes(unit.id))

  // Se não houver unidades selecionadas, mostrar "Todas"
  if (unitIds.length === 0 || !unitIds) {
    return <span>Todas</span>
  }

  // Se estiver carregando, mostrar indicador
  if (isLoading) {
    return <span className="text-gray-400">Carregando...</span>
  }

  // Se houver mais de 3 unidades, mostrar 3 e um indicador de "mais"
  if (selectedUnits.length > 3) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex flex-wrap gap-1">
              {selectedUnits.slice(0, 3).map(unit => (
                <Badge key={unit.id} variant="outline" className="max-w-[150px] truncate">
                  {unit.name} - {unit.city}
                </Badge>
              ))}
              <Badge variant="secondary">
                +{selectedUnits.length - 3} mais
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px]">
            <div className="space-y-1">
              {selectedUnits.map(unit => (
                <div key={unit.id}>
                  {unit.name} - {unit.city}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // Exibir todas as unidades se forem 3 ou menos
  return (
    <div className="flex flex-wrap gap-1">
      {selectedUnits.map(unit => (
        <Badge key={unit.id} variant="outline" className="max-w-[150px] truncate">
          {unit.name} - {unit.city}
        </Badge>
      ))}
    </div>
  )
}
