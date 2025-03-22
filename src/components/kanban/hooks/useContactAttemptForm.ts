
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { ContactAttempt } from "../types"

export type ContactType = 'phone' | 'whatsapp' | 'whatsapp-call' | undefined

interface UseContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
}

export function useContactAttemptForm({ onSubmit, cardId }: UseContactAttemptFormProps) {
  const [contactType, setContactType] = useState<ContactType>(undefined)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [isLossModalOpen, setIsLossModalOpen] = useState(false)
  const [showContactTypeAlert, setShowContactTypeAlert] = useState(false)
  const { toast } = useToast()

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
  const handleContactTypeChange = (value: 'phone' | 'whatsapp' | 'whatsapp-call') => {
    setContactType(value)
    setShowContactTypeAlert(false)
  }

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

  return {
    contactType,
    date,
    time,
    isLossModalOpen,
    showContactTypeAlert,
    setDate,
    setTime,
    setIsLossModalOpen,
    handleContactTypeChange,
    handleSubmit,
    handleLossButtonClick
  }
}
