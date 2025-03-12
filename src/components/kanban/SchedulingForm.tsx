
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Scheduling } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
}

export function SchedulingForm({ onSubmit, cardId }: SchedulingFormProps) {
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [valorizacaoDiaAnterior, setValorizacaoDiaAnterior] = useState(false)
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined>(undefined)
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!date) {
      toast({
        title: "Erro",
        description: "Selecione a data do agendamento",
        variant: "destructive",
      })
      return
    }

    if (!time) {
      toast({
        title: "Erro",
        description: "Selecione o horário do agendamento",
        variant: "destructive",
      })
      return
    }

    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato",
        variant: "destructive",
      })
      return
    }

    try {
      const [year, month, day] = date.split('-').map(Number)
      const [hours, minutes] = time.split(":").map(Number)
      
      const scheduledDate = new Date(year, month - 1, day)
      scheduledDate.setHours(hours, minutes, 0, 0)

      // Verifica se a data/hora é futura
      if (scheduledDate <= new Date()) {
        toast({
          title: "Erro",
          description: "A data e hora do agendamento devem ser futuras",
          variant: "destructive",
        })
        return
      }

      // Nova lógica: 
      // Se valorizacaoDiaAnterior está ativo -> próxima atividade é D-1
      // Se não está ativo -> próxima atividade é na mesma data
      const nextContactDate = valorizacaoDiaAnterior 
        ? new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000) // D-1
        : new Date(scheduledDate.getTime()) // Mesma data

      onSubmit({
        scheduledDate,
        notes,
        cardId,
        valorizacaoDiaAnterior,
        nextContactDate, // Agora sempre terá uma data
        type: contactType
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar a data e hora selecionadas",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Contato</Label>
        <RadioGroup
          value={contactType}
          onValueChange={(value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => setContactType(value)}
          className="flex flex-col space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="phone" />
            <Label htmlFor="phone">Ligação Telefônica</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="whatsapp" />
            <Label htmlFor="whatsapp">Mensagem WhatsApp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp-call" id="whatsapp-call" />
            <Label htmlFor="whatsapp-call">Ligação WhatsApp</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="presencial" id="presencial" />
            <Label htmlFor="presencial">Presencial</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Data do Agendamento</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full"
          placeholder="dd/mm/aaaa"
        />
      </div>

      <div className="space-y-2">
        <Label>Horário do Agendamento</Label>
        <Input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label>Descritivo</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digite o descritivo do agendamento"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="valorizacao"
          checked={valorizacaoDiaAnterior}
          onCheckedChange={(checked) => setValorizacaoDiaAnterior(checked as boolean)}
        />
        <Label htmlFor="valorizacao">Valorização Dia Anterior?</Label>
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        Registrar Agendamento
      </Button>
    </div>
  )
}
