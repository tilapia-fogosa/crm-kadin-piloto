
import { useState } from "react"
import { EffectiveContact } from "./types"
import { LossModal } from "./components/loss/LossModal"
import { useLossRegistration } from "./hooks/useLossRegistration"
import { useEffectiveContactForm } from "./hooks/useEffectiveContactForm"
import { ContactTypeSelector } from "./components/contact-attempt/ContactTypeSelector"
import { NextContactDateTime } from "./components/contact-attempt/NextContactDateTime"
import { NotesField } from "./components/contact-attempt/NotesField"
import { ContactAttemptActions } from "./components/contact-attempt/ContactAttemptActions"

interface EffectiveContactFormProps {
  onSubmit: (contact: EffectiveContact) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
  isDisabled?: boolean
}

export function EffectiveContactForm({ onSubmit, cardId, onLossSubmit, isDisabled = false }: EffectiveContactFormProps) {
  const [isLossModalOpen, setIsLossModalOpen] = useState(false)
  const { registerLoss } = useLossRegistration()
  
  const {
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
  } = useEffectiveContactForm(cardId, onSubmit)

  // Handler para abrir o modal de perda
  const openLossModal = () => {
    if (handleLossButtonClick()) {
      console.log('EffectiveContactForm - Abrindo modal de perda')
      setIsLossModalOpen(true)
    }
  }

  // Handler para o registro de perda
  const handleLossConfirm = async (reasons: string[], observations?: string) => {
    console.log('EffectiveContactForm - Confirmando perda com motivos:', reasons)
    if (!contactType) {
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
      console.log('EffectiveContactForm - Perda registrada com sucesso no Contato Efetivo')
      setIsLossModalOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      <ContactTypeSelector 
        contactType={contactType} 
        onContactTypeChange={handleContactTypeChange}
        disabled={isDisabled}
      />

      <NextContactDateTime
        date={date}
        time={time}
        onDateChange={handleDateChange}
        onTimeChange={handleTimeChange}
        disabled={isDisabled}
      />

      <NotesField
        notes={notes}
        onNotesChange={handleNotesChange}
        disabled={isDisabled}
      />

      <ContactAttemptActions
        onSubmit={handleSubmit}
        onLossClick={openLossModal}
        showOnLossSubmit={!!onLossSubmit}
        showContactTypeAlert={showContactTypeAlert}
        actionType="contact"
        disabled={isDisabled}
      />

      <LossModal
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        onConfirm={handleLossConfirm}
      />
    </div>
  )
}
