
import { ContactAttemptFormContent } from "./components/contact-attempt/ContactAttemptFormContent"
import { ContactAttempt } from "./types"

interface ContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
  isDisabled?: boolean
}

export function ContactAttemptForm({ onSubmit, cardId, onLossSubmit, isDisabled = false }: ContactAttemptFormProps) {
  console.log('Renderizando ContactAttemptForm para cartão:', cardId, 'disabled:', isDisabled)
  return <ContactAttemptFormContent onSubmit={onSubmit} cardId={cardId} onLossSubmit={onLossSubmit} isDisabled={isDisabled} />
}
