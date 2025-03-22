
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EffectiveContact } from "./types"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { LossModal } from "./components/loss/LossModal"
import { useLossRegistration } from "./hooks/useLossRegistration"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
}

export function EffectiveContactForm({ onSubmit, cardId, onLossSubmit }: EffectiveContactFormProps) {
  const [contactType, setContactType] = useState<'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined>(undefined)
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isLossModalOpen, setIsLossModalOpen] = useState(false)
  const [showContactTypeAlert, setShowContactTypeAlert] = useState(false)
  const { toast } = useToast()
  const { registerLoss } = useLossRegistration()

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

  // Método para validar o tipo de contato antes de abrir o modal de perda
  const handleLossButtonClick = () => {
    console.log('Validando tipo de contato antes de abrir modal de perda')
    if (!contactType) {
      console.log('Tipo de contato não selecionado, exibindo alerta')
      setShowContactTypeAlert(true)
      return
    }
    
    // Se tipo de contato estiver selecionado, esconde o alerta e abre o modal
    setShowContactTypeAlert(false)
    setIsLossModalOpen(true)
  }

  // Atualiza o estado de seleção do tipo de contato e esconde o alerta quando um tipo for selecionado
  const handleContactTypeChange = (value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => {
    setContactType(value)
    setShowContactTypeAlert(false)
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
      activityType: 'Contato Efetivo',
      contactType,
      reasons,
      observations
    })

    if (success) {
      console.log('Perda registrada com sucesso no Contato Efetivo')
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
          onValueChange={handleContactTypeChange}
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

      <div className="space-y-2">
        <Button 
          onClick={handleSubmit}
          className="w-full bg-orange-500 hover:bg-orange-600"
        >
          Registrar Contato Efetivo
        </Button>

        {onLossSubmit && (
          <>
            <Button
              variant="destructive"
              onClick={handleLossButtonClick}
              className="w-full"
            >
              Perdido
            </Button>
            
            {showContactTypeAlert && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>
                  Selecione o Tipo de Contato
                </AlertDescription>
              </Alert>
            )}
          </>
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
