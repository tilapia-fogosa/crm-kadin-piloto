
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ContactAttempt } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { format, setHours, setMinutes } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { ptBR } from "date-fns/locale"
import { Input } from "@/components/ui/input"

interface ContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
}

export function ContactAttemptForm({ onSubmit, cardId }: ContactAttemptFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | undefined>(undefined)
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

    if (!date) {
      toast({
        title: "Erro",
        description: "Selecione a data do próximo contato",
        variant: "destructive",
      })
      return
    }

    if (!time) {
      toast({
        title: "Erro",
        description: "Selecione a hora do próximo contato",
        variant: "destructive",
      })
      return
    }

    try {
      // Cria uma nova data para evitar mutação
      let nextContactDate = new Date(date.getTime())
      
      // Parse do horário
      const [hours, minutes] = time.split(":").map(Number)
      
      // Usa funções do date-fns para manipular a data com segurança
      nextContactDate = setHours(nextContactDate, hours)
      nextContactDate = setMinutes(nextContactDate, minutes)

      // Verifica se a data/hora é futura
      if (nextContactDate <= new Date()) {
        toast({
          title: "Erro",
          description: "A data e hora do próximo contato deve ser futura",
          variant: "destructive",
        })
        return
      }

      onSubmit({
        type: contactType,
        nextContactDate,
        cardId
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
          className="w-[300px] mx-auto border rounded-md"
        />
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

      <Button 
        onClick={handleSubmit}
        className="w-full"
      >
        Cadastrar Tentativa
      </Button>
    </div>
  )
}
