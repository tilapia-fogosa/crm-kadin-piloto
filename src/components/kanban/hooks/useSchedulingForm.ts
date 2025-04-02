
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Scheduling } from "../types"
import { useUnit } from "@/contexts/UnitContext"

export type ContactType = 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial' | undefined

export function useSchedulingForm(cardId: string, onSubmit: (scheduling: Scheduling) => void) {
  // Estado do formulário
  const [notes, setNotes] = useState("")
  const [scheduledDate, setScheduledDate] = useState<Date>()
  const [valorizacaoDiaAnterior, setValorizacaoDiaAnterior] = useState(false)
  const [contactType, setContactType] = useState<ContactType>(undefined)
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null)
  const { toast } = useToast()
  const { availableUnits } = useUnit()
  
  // Log das operações principais
  console.log('useSchedulingForm - Inicializando hook com cardId:', cardId)
  console.log('useSchedulingForm - Verificando unidades disponíveis:', availableUnits)
  
  // Não inicializa mais automaticamente a unidade selecionada

  // Handler para atualizar as notas
  const handleNotesChange = (value: string) => {
    console.log('useSchedulingForm - Notas alteradas para:', value)
    setNotes(value)
  }

  // Handler para atualizar a data agendada
  const handleScheduledDateChange = (date: Date) => {
    console.log('useSchedulingForm - Data de agendamento alterada para:', date)
    setScheduledDate(date)
  }

  // Handler para atualizar a opção de valorização dia anterior
  const handleValorizacaoChange = (checked: boolean) => {
    console.log('useSchedulingForm - Valorização dia anterior alterada para:', checked)
    setValorizacaoDiaAnterior(checked)
  }

  // Handler para atualizar o tipo de contato
  const handleContactTypeChange = (value: 'phone' | 'whatsapp' | 'whatsapp-call' | 'presencial') => {
    console.log('useSchedulingForm - Tipo de contato alterado para:', value)
    setContactType(value)
  }

  // Handler para atualizar a unidade selecionada
  const handleUnitChange = (unitId: string) => {
    console.log('useSchedulingForm - Unidade selecionada alterada para:', unitId)
    setSelectedUnitId(unitId)
    // Reset da data ao mudar a unidade
    setScheduledDate(undefined)
  }

  // Método para validar e submeter o formulário
  const handleSubmit = () => {
    console.log('useSchedulingForm - Validando dados do agendamento')
    
    if (!scheduledDate) {
      toast({
        title: "Erro",
        description: "Selecione a data e horário do agendamento",
        variant: "destructive",
      })
      return
    }

    if (!contactType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de contato",
        variant: "destructive",
      })
      return
    }

    if (!selectedUnitId) {
      toast({
        title: "Erro",
        description: "Selecione a unidade para o agendamento",
        variant: "destructive",
      })
      return
    }

    try {
      // Verifica se a data/hora é futura
      if (scheduledDate <= new Date()) {
        toast({
          title: "Erro",
          description: "A data e hora do agendamento devem ser futuras",
          variant: "destructive",
        })
        return
      }

      const nextContactDate = valorizacaoDiaAnterior 
        ? new Date(scheduledDate.getTime() - 24 * 60 * 60 * 1000) // D-1
        : new Date(scheduledDate.getTime()) // Mesma data

      console.log('useSchedulingForm - Enviando agendamento com unitId:', selectedUnitId)
      
      onSubmit({
        scheduledDate,
        notes,
        cardId,
        valorizacaoDiaAnterior,
        nextContactDate,
        type: contactType,
        unitId: selectedUnitId
      })
    } catch (error) {
      console.error('useSchedulingForm - Erro ao processar agendamento:', error)
      toast({
        title: "Erro",
        description: "Erro ao processar o agendamento",
        variant: "destructive",
      })
    }
  }

  // Verificar se o usuário tem acesso a múltiplas unidades
  const hasMultipleUnits = availableUnits.length > 1
  
  return {
    notes,
    scheduledDate,
    valorizacaoDiaAnterior,
    contactType,
    selectedUnitId,
    hasMultipleUnits,
    handleNotesChange,
    handleScheduledDateChange,
    handleValorizacaoChange,
    handleContactTypeChange,
    handleUnitChange,
    handleSubmit
  }
}
