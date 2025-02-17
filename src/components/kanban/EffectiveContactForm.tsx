
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EffectiveContact } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
}

export function EffectiveContactForm({ onSubmit, cardId }: EffectiveContactFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState("")
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

    try {
      // Validação da data e hora do próximo contato
      let nextContactDate: Date | undefined = undefined
      if (date && time) {
        const [year, month, day] = date.split('-').map(Number)
        const [hours, minutes] = time.split(":").map(Number)
        
        nextContactDate = new Date(year, month - 1, day)
        nextContactDate.setHours(hours, minutes, 0, 0)

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
        observations: "",
        cardId,
        nextContactDate
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
        <Label>Data do Próximo Contato</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full"
          placeholder="dd/mm/aaaa"
        />
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
