import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EffectiveContact } from "./types"
import { useToast } from "@/components/ui/use-toast"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
}

export function EffectiveContactForm({ onSubmit, cardId }: EffectiveContactFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [observations, setObservations] = useState("")
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

    onSubmit({
      type: contactType,
      contactDate: new Date(), // Using current date as default
      notes,
      observations,
      cardId
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
        <Label>Descritivo</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Digite o descritivo do contato"
        />
      </div>
      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Digite as observações adicionais"
        />
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full"
      >
        Registrar Contato Efetivo
      </Button>
    </div>
  )
}