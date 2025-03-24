
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { EffectiveContact } from "../types"

export type ContactType = 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined

export function useEffectiveContactForm(cardId: string, onSubmit: (contact: EffectiveContact) => void) {
  // Estado do formulário - iniciando contactType como undefined (sem seleção)
  const [contactType, setContactType] = useState<ContactType>(undefined)
  const [notes, setNotes] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [showContactTypeAlert, setShowContactTypeAlert] = useState(false)
  const { toast } = useToast()

  // Handler para atualizar o tipo de contato
  const handleContactTypeChange = (value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => {
    console.log('useEffectiveContactForm - Tipo de contato alterado para:', value)
    setContactType(value)
    setShowContactTypeAlert(false)
  }

  // Handler para atualizar a data
  const handleDateChange = (value: string) => {
    console.log('useEffectiveContactForm - Data alterada para:', value)
    setDate(value)
  }

  // Handler para atualizar a hora
  const handleTimeChange = (value: string) => {
    console.log('useEffectiveContactForm - Hora alterada para:', value)
    setTime(value)
  }

  // Handler para atualizar as notas
  const handleNotesChange = (value: string) => {
    console.log('useEffectiveContactForm - Notas alteradas para:', value)
    setNotes(value)
  }

  // Método para validar e submeter o formulário
  const handleSubmit = () => {
    console.log('useEffectiveContactForm - Submetendo formulário')
    
    if (!contactType) {
      console.log('useEffectiveContactForm - Tipo de contato não selecionado')
      setShowContactTypeAlert(true) // Mostra o alerta visual
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
        console.log('useEffectiveContactForm - Processando data e hora:', date, time)
        const [year, month, day] = date.split('-').map(Number)
        const [hours, minutes] = time.split(":").map(Number)
        
        nextContactDate = new Date(year, month - 1, day)
        nextContactDate.setHours(hours, minutes, 0, 0)

        // Verifica se a data/hora é futura
        if (nextContactDate <= new Date()) {
          console.log('useEffectiveContactForm - Data/hora inválida: deve ser futura')
          toast({
            title: "Erro",
            description: "A data e hora do próximo contato deve ser futura",
            variant: "destructive",
          })
          return
        }
      }

      console.log('useEffectiveContactForm - Dados válidos, chamando onSubmit')
      onSubmit({
        type: contactType,
        contactDate: new Date(),
        notes,
        observations: "",
        cardId,
        nextContactDate
      })
    } catch (error) {
      console.error('useEffectiveContactForm - Erro ao processar data/hora:', error)
      toast({
        title: "Erro",
        description: "Erro ao processar a data e hora selecionadas",
        variant: "destructive",
      })
    }
  }

  // Método para validar o tipo de contato antes de abrir o modal de perda
  const handleLossButtonClick = () => {
    console.log('useEffectiveContactForm - Validando tipo de contato antes de abrir modal de perda')
    if (!contactType) {
      console.log('useEffectiveContactForm - Tipo de contato não selecionado, exibindo alerta')
      setShowContactTypeAlert(true)
      return false
    }
    
    // Se tipo de contato estiver selecionado, esconde o alerta
    setShowContactTypeAlert(false)
    return true
  }

  return {
    contactType,
    notes,
    date,
    time,
    showContactTypeAlert,
    handleContactTypeChange,
    handleDateChange,
    handleTimeChange,
    handleNotesChange,
    handleSubmit,
    handleLossButtonClick
  }
}
