import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ContactAttempt } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { format } from "date-fns"
import { Input } from "@/components/ui/input"
import { LossModal } from "./components/loss/LossModal"

interface ContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
}

export function ContactAttemptForm({ onSubmit, cardId, onLossSubmit }: ContactAttemptFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | undefined>(undefined)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isLossModalOpen, setIsLossModalOpen] = useState(false)
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
      const [year, month, day] = date.split('-').map(Number)
      const [hours, minutes] = time.split(":").map(Number)
      
      const nextContactDate = new Date(year, month - 1, day)
      nextContactDate.setHours(hours, minutes, 0, 0)

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

  const handleLossConfirm = async (reasons: string[], observations?: string) => {
    if (onLossSubmit) {
      onLossSubmit(reasons, observations)
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
        <Button 
          onClick={handleSubmit}
          className="w-full"
        >
          Cadastrar Tentativa
        </Button>

        {onLossSubmit && (
          <Button
            variant="destructive"
            onClick={() => setIsLossModalOpen(true)}
            className="w-full"
          >
            Perdido
          </Button>
        )}
      </div>

      <LossModal
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        onConfirm={handleLossConfirm}
      />
    </div>
  )
}
