
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

interface CompactHistoryProps {
  activities: string[] | undefined
  onExpand: () => void
}

export function CompactHistory({ activities, onExpand }: CompactHistoryProps) {
  return (
    <div className="flex flex-col h-full space-y-2">
      <Button 
        variant="ghost" 
        size="sm"
        className="w-full p-2"
        onClick={onExpand}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      <div className="flex flex-col gap-2 overflow-y-auto">
        {activities?.filter(activity => {
          const parts = activity.split('|')
          return parts[6] === 'true'
        }).map((activity, index) => {
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
