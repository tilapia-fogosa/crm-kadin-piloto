
import { ContactAttemptForm } from "./ContactAttemptForm"
import { EffectiveContactForm } from "./EffectiveContactForm"
import { ContactAttempt, EffectiveContact } from "./types"

interface ActivityDetailsProps {
  selectedActivity: string | null
  cardId: string
  onRegisterAttempt: (attempt: ContactAttempt) => Promise<void>
  onRegisterEffectiveContact: (contact: EffectiveContact) => Promise<void>
}

export function ActivityDetails({
  selectedActivity,
  cardId,
  onRegisterAttempt,
  onRegisterEffectiveContact
}: ActivityDetailsProps) {
  return (
    <div className="border-l pl-4">
      <h3 className="font-semibold mb-2">Detalhes da Atividade</h3>
      {selectedActivity === 'Tentativa de Contato' ? (
        <ContactAttemptForm
          onSubmit={onRegisterAttempt}
          cardId={cardId}
        />
      ) : selectedActivity === 'Contato Efetivo' ? (
        <EffectiveContactForm
          onSubmit={onRegisterEffectiveContact}
          cardId={cardId}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          Selecione uma atividade para ver as opções
        </p>
      )}
    </div>
  )
}
