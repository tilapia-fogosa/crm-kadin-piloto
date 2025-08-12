
import { useState } from "react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { getActivityBadge, getContactType } from "./utils/activityUtils"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip"

interface ActivityHistoryProps {
  activities?: string[]
  onDeleteActivity: (id: string, clientId: string) => void
  clientId: string
}

export function ActivityHistory({ activities, onDeleteActivity, clientId }: ActivityHistoryProps) {
  // Estado para controlar a direção da ordenação (true = decrescente, false = crescente)
  const [sortDescending, setSortDescending] = useState(true)
  
  // Função para alternar a direção da ordenação
  const toggleSortDirection = () => {
    console.log('Alternando direção da ordenação para:', sortDescending ? 'crescente' : 'decrescente')
    setSortDescending(prevState => !prevState)
  }

  // Ordena as atividades por data
  const getSortedActivities = () => {
    if (!activities || activities.length === 0) return []
    
    // Filtra atividades válidas e ativas
    const filteredActivities = activities.filter(activity => {
      const parts = activity.split('|')
      // Verifica se a atividade tem todos os campos necessários e está ativa
      if (parts.length < 8) {
        console.error('Invalid activity format:', activity)
        return false
      }
      return parts[7] === 'true' // Filtra apenas atividades ativas
    })
    
    // Função para comparar datas
    return [...filteredActivities].sort((a, b) => {
      try {
        const dateA = new Date(a.split('|')[2])
        const dateB = new Date(b.split('|')[2])
        
        // Validação de datas
        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
          console.error('Invalid date in activity:', { a, b })
          return 0
        }
        
        // Ordenação ascendente ou descendente baseada no estado
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
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Histórico de Atividades</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleSortDirection}
                className="h-8 w-8 p-0"
              >
                {sortDescending ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{sortDescending ? 'Mais recente primeiro' : 'Mais antigo primeiro'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <ScrollArea className="h-[600px] w-full rounded-md border p-4">
        {sortedActivities.length > 0 ? (
          sortedActivities.map((activity, index) => {
            try {
              const parts = activity.split('|')
              const tipo_atividade = parts[0]
              const tipo_contato = parts[1]
              const date = new Date(parts[2])
              const authorName = parts[3]
              const notes = parts[4]
              const id = parts[5]
              
              if (!id) {
                console.error('Activity without ID:', activity)
                return null
              }
              
              return (
                <div key={index} className="mb-4 text-sm space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                        {getActivityBadge(tipo_atividade)}
                      </span>
                      <span className="text-muted-foreground">
                        {getContactType(tipo_contato)}
                      </span>
                      <span className="text-muted-foreground">
                        {format(date, 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        console.log('Deletando atividade:', { id, clientId })
                        onDeleteActivity(id, clientId)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  {authorName && (
                    <p className="text-sm ml-10 text-primary font-medium">
                      {authorName}
                    </p>
                  )}
                  {notes && (
                    <p className="text-sm text-muted-foreground ml-10">
                      {notes}
                    </p>
                  )}
                </div>
              )
            } catch (error) {
              console.error('Error parsing activity:', error, activity)
              return null
            }
          })
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
