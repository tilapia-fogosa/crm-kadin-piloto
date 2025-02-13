
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EffectiveContact } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
}

export function EffectiveContactForm({ onSubmit, cardId }: EffectiveContactFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("")
  const { toast } = useToast()

  const handleSubmit = () => {
    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato",
        variant: "destructive",
      })
      return
    }

    // Validação da data e hora do próximo contato
    let nextContactDate: Date | undefined = undefined
    if (date && time) {
      const [hours, minutes] = time.split(":")
      nextContactDate = new Date(date)
      nextContactDate.setHours(parseInt(hours), parseInt(minutes))

      // Verifica se a data/hora é futura
      if (nextContactDate <= new Date()) {
        toast({
          title: "Erro",
          description: "A data e hora do próximo contato deve ser futura",
          variant: "destructive",
        })
        return
      }
    }

    onSubmit({
      type: contactType,
      contactDate: new Date(),
      notes,
      observations: "", // Mantendo vazio já que não será mais usado
      cardId,
      nextContactDate // Novo campo adicionado
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Contato</Label>
        <RadioGroup
          value={contactType}
          onValueChange={(value: 'phone' | 'whatsapp' | 'whatsapp-call') => setContactType(value)}
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
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Data do Próximo Contato</Label>
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
        <Label>Hora do Próximo Contato</Label>
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
          placeholder="Digite o descritivo do contato"
        />
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full bg-orange-500 hover:bg-orange-600"
      >
        Registrar Contato Efetivo
      </Button>
    </div>
  )
}
