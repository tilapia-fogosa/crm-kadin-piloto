
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ContactAttempt } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { LossModal } from "./components/loss/LossModal"
import { useLossRegistration } from "./hooks/useLossRegistration"

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
  const { registerLoss } = useLossRegistration()

  const handleSubmit = () => {
    console.log('Validando dados da tentativa de contato')
    
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
      console.log('Processando data e hora do próximo contato')
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

      console.log('Submetendo tentativa de contato')
      onSubmit({
        type: contactType,
        nextContactDate,
        cardId
      })
    } catch (error) {
      console.error('Erro ao processar data/hora:', error)
      toast({
        title: "Erro",
        description: "Erro ao processar a data e hora selecionadas",
        variant: "destructive",
      })
    }
  }

  // Novo método para validar o tipo de contato antes de abrir o modal de perda
  const handleLossButtonClick = () => {
    console.log('Validando tipo de contato antes de abrir modal de perda')
    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato antes de registrar a perda",
        variant: "destructive",
      })
      return
    }
    
    // Se passar na validação, abre o modal
    setIsLossModalOpen(true)
  }

  const handleLossConfirm = async (reasons: string[], observations?: string) => {
    console.log('Confirmando perda com motivos:', reasons)
    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato antes de registrar a perda",
        variant: "destructive",
      })
      return
    }

    // Registra a perda usando apenas o hook registerLoss, evitando duplicação
    const success = await registerLoss({
      clientId: cardId,
      activityType: 'Tentativa de Contato',
      contactType,
      reasons,
      observations
    })

    if (success) {
      console.log('Perda registrada com sucesso na Tentativa de Contato')
      setIsLossModalOpen(false)
      
      // Removemos a chamada ao onLossSubmit para evitar a duplicação da atividade Atendimento
      // O método registerLoss já faz todas as atualizações necessárias, incluindo status do cliente
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
            onClick={handleLossButtonClick}
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
