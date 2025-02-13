
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Scheduling } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { format, subDays } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
}

export function SchedulingForm({ onSubmit, cardId }: SchedulingFormProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const [valorizacaoDiaAnterior, setValorizacaoDiaAnterior] = useState(false)
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

    // Combina a data selecionada com o horário
    const [hours, minutes] = time.split(":")
    const scheduledDate = new Date(date)
    scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // Verifica se a data/hora é futura
    if (scheduledDate <= new Date()) {
      toast({
        title: "Erro",
        description: "A data e hora do agendamento devem ser futuras",
        variant: "destructive",
      })
      return
    }

    // Se valorizacaoDiaAnterior está ativo, define next_contact_date como 24h antes
    const nextContactDate = valorizacaoDiaAnterior ? subDays(scheduledDate, 1) : undefined

    onSubmit({
      scheduledDate,
      notes,
      cardId,
      valorizacaoDiaAnterior,
      nextContactDate
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data do Agendamento</Label>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          locale={ptBR}
          disabled={(date) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const compareDate = new Date(date)
            compareDate.setHours(0, 0, 0, 0)
            return compareDate < today
          }}
          initialFocus
          className="w-[300px] mx-auto"
        />
        {date && (
          <p className="text-sm text-muted-foreground">
            Data selecionada: {format(date, "PPP", { locale: ptBR })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Horário do Agendamento</Label>
        <Input
          id="time"
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
