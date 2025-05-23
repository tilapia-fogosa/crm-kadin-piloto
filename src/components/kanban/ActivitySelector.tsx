
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Calendar,
  Phone,
  MessageSquare,
  Briefcase
} from "lucide-react"

interface ActivitySelectorProps {
  selectedActivity: string | null
  onActivitySelect: (id: string) => void
  disabled?: boolean
}

export function ActivitySelector({ 
  selectedActivity, 
  onActivitySelect,
  disabled = false 
}: ActivitySelectorProps) {
  const isSelected = (id: string) => selectedActivity === id

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Nova Atividade</h3>
      <Button
        variant={isSelected("tentativa-contato") ? "default" : "outline"}
        className="w-full justify-start"
        onClick={() => onActivitySelect("tentativa-contato")}
        disabled={disabled}
      >
        <div className="bg-orange-500 text-white w-7 h-7 flex items-center justify-center rounded mr-2">
          <Phone className="h-4 w-4" />
        </div>
        Tentativa de Contato
      </Button>
      <Button
        variant={isSelected("contato-efetivo") ? "default" : "outline"}
        className="w-full justify-start"
        onClick={() => onActivitySelect("contato-efetivo")}
        disabled={disabled}
      >
        <div className="bg-orange-500 text-white w-7 h-7 flex items-center justify-center rounded mr-2">
          <MessageSquare className="h-4 w-4" />
        </div>
        Contato Efetivo
      </Button>
      <Button
        variant={isSelected("agendamento") ? "default" : "outline"}
        className="w-full justify-start"
        onClick={() => onActivitySelect("agendamento")}
        disabled={disabled}
      >
        <div className="bg-orange-500 text-white w-7 h-7 flex items-center justify-center rounded mr-2">
          <Calendar className="h-4 w-4" />
        </div>
        Agendamento
      </Button>
      <Button
        variant={isSelected("atendimento") ? "default" : "outline"}
        className="w-full justify-start"
        onClick={() => onActivitySelect("atendimento")}
        disabled={disabled}
      >
        <div className="bg-orange-500 text-white w-7 h-7 flex items-center justify-center rounded mr-2">
          <Briefcase className="h-4 w-4" />
        </div>
        Atendimento
      </Button>
    </div>
  )
}
