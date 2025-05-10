
import { useState } from "react"
import { ContactTypeSelector } from "./ContactTypeSelector"
import { NextContactDateTime } from "./NextContactDateTime"
import { ContactAttemptActions } from "./ContactAttemptActions"
import { NotesField } from "./NotesField"
import { LossModal } from "../loss/LossModal"
import { useContactAttemptForm } from "../../hooks/useContactAttemptForm"
import { ContactAttempt } from "../../types"
import { useLossRegistration } from "../../hooks/useLossRegistration"

interface ContactAttemptFormContentProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
}

export function ContactAttemptFormContent({ 
  onSubmit, 
  cardId, 
  onLossSubmit 
}: ContactAttemptFormContentProps) {
  console.log('Renderizando ContactAttemptFormContent para cartão:', cardId)
  
  const { 
    contactType, 
    date, 
    time, 
    notes,
    isLossModalOpen, 
    showContactTypeAlert,
    setDate, 
    setTime, 
    setIsLossModalOpen, 
    handleContactTypeChange,
    handleNotesChange,
    handleSubmit, 
    handleLossButtonClick 
  } = useContactAttemptForm({ onSubmit, cardId })
  
  const { registerLoss } = useLossRegistration()

  const handleLossConfirm = async (reasons: string[], observations?: string) => {
    console.log('Confirmando perda com motivos:', reasons)
    if (!contactType) {
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
      <ContactTypeSelector 
        contactType={contactType} 
        onContactTypeChange={handleContactTypeChange} 
      />

      <NextContactDateTime 
        date={date} 
        time={time} 
        onDateChange={setDate} 
        onTimeChange={setTime} 
      />

      <NotesField 
        notes={notes}
        onNotesChange={handleNotesChange}
      />

      <ContactAttemptActions 
        onSubmit={handleSubmit} 
        onLossClick={handleLossButtonClick} 
        showOnLossSubmit={!!onLossSubmit}
        showContactTypeAlert={showContactTypeAlert}
      />

      <LossModal
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        onConfirm={handleLossConfirm}
      />
    </div>
  )
}
