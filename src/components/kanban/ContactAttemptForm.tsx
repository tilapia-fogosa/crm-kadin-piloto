
import { ContactAttemptFormContent } from "./components/contact-attempt/ContactAttemptFormContent"
import { ContactAttempt } from "./types"

interface ContactAttemptFormProps {
  onSubmit: (attempt: ContactAttempt) => void
  cardId: string
  onLossSubmit?: (reasons: string[], observations?: string) => void
}

export function ContactAttemptForm({ onSubmit, cardId, onLossSubmit }: ContactAttemptFormProps) {
  console.log('Renderizando ContactAttemptForm para cartão:', cardId)
  return <ContactAttemptFormContent onSubmit={onSubmit} cardId={cardId} onLossSubmit={onLossSubmit} />
}
