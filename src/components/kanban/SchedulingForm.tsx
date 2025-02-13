
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Scheduling } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"

interface SchedulingFormProps {
  onSubmit: (scheduling: Scheduling) => void
  cardId: string
}

export function SchedulingForm({ onSubmit, cardId }: SchedulingFormProps) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const [notes, setNotes] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!date || !time) {
      toast({
        title: "Erro",
        description: "Selecione a data e hora do agendamento",
        variant: "destructive",
      })
      return
    }

    const [hours, minutes] = time.split(":")
    const scheduledDate = new Date(date)
    scheduledDate.setHours(parseInt(hours), parseInt(minutes))

    // Verifica se a data/hora é futura
    if (scheduledDate <= new Date()) {
      toast({
        title: "Erro",
        description: "A data e hora do agendamento deve ser futura",
        variant: "destructive",
      })
      return
    }

    onSubmit({
      scheduledDate,
      notes,
      cardId
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data do Agendamento</Label>
        <div className="border rounded-md p-2">
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
            className="w-full"
            classNames={{
              months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center text-sm",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100",
              day_range_end: "day-range-end",
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
              day_today: "bg-accent text-accent-foreground",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-50",
              day_hidden: "invisible",
            }}
          />
        </div>
        {date && (
          <p className="text-sm text-muted-foreground">
            Data selecionada: {format(date, "PPP", { locale: ptBR })}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Hora do Agendamento</Label>
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

      <Button 
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        Confirmar Agendamento
      </Button>
    </div>
  )
}
