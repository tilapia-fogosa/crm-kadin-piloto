
import { useState } from "react"
import { ContactTypeSelector } from "./components/contact-attempt/ContactTypeSelector"
import { NextContactDateTime } from "./components/contact-attempt/NextContactDateTime"
import { ContactAttemptActions } from "./components/contact-attempt/ContactAttemptActions"
import { NotesField } from "./components/contact-attempt/NotesField"
import { LossModal } from "./components/loss/LossModal"
import { useContactAttemptForm } from "./hooks/useContactAttemptForm"
import { ContactAttempt } from "./types"
import { useLossRegistration } from "./hooks/useLossRegistration"

interface ContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
}

export function ContactAttemptForm({ onSubmit, cardId, onLossSubmit }: ContactAttemptFormProps) {
  const { 
    contactType, 
    date, 
    time, 
    notes, // Extraindo o campo de notas
    isLossModalOpen, 
    showContactTypeAlert,
    setDate, 
    setTime, 
    setIsLossModalOpen, 
    handleContactTypeChange,
    handleNotesChange, // Extraindo o handler para notas
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

      {/* Adicionando o campo de notas */}
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
