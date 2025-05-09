
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface CompactHistoryProps {
  activities: string[] | undefined
  onExpand: () => void
}

export function CompactHistory({ activities, onExpand }: CompactHistoryProps) {
  // Estado para controlar a direção da ordenação (true = decrescente, false = crescente)
  const [sortDescending, setSortDescending] = useState(true)
  
  // Função para alternar a direção da ordenação
  const toggleSortDirection = () => {
    console.log('CompactHistory - Alternando direção da ordenação para:', sortDescending ? 'crescente' : 'decrescente')
    setSortDescending(prevState => !prevState)
  }

  // Ordena e filtra as atividades
  const getSortedActivities = () => {
    if (!activities || activities.length === 0) return []
    
    // Filtra atividades válidas e ativas
    const filteredActivities = activities.filter(activity => {
      const parts = activity.split('|')
      return parts[6] === 'true'
    })
    
    // Ordena por data
    return [...filteredActivities].sort((a, b) => {
      try {
        const dateA = new Date(a.split('|')[2])
        const dateB = new Date(b.split('|')[2])
        
        // Validação de datas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error('Invalid date in activity:', { a, b })
          return 0
        }
        
        // Ordenação baseada no estado
        return sortDescending 
          ? dateB.getTime() - dateA.getTime() // Mais novo primeiro (decrescente)
          : dateA.getTime() - dateB.getTime() // Mais antigo primeiro (crescente)
      } catch (error) {
        console.error('Error sorting activities:', error)
        return 0
      }
    })
  }

  // Atividades ordenadas para renderização
  const sortedActivities = getSortedActivities()

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex flex-col gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          className="w-full p-2"
          onClick={onExpand}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSortDirection}
                className="w-full p-0"
              >
                {sortDescending ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{sortDescending ? 'Mais recente primeiro' : 'Mais antigo primeiro'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex flex-col gap-2 overflow-y-auto">
        {sortedActivities.map((activity, index) => {
          const parts = activity.split('|')
          const tipo_atividade = parts[0]
          let badge = ''
          switch(tipo_atividade) {
            case 'Tentativa de Contato':
              badge = 'TE'
              break
            case 'Contato Efetivo':
              badge = 'CE'
              break
            case 'Agendamento':
              badge = 'AG'
              break
            case 'Atendimento':
              badge = 'AT'
              break
          }
          return (
            <div key={index} className="flex justify-center">
              <span className="flex items-center justify-center bg-[#FEC6A1] text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                {badge}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
