import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, ContactAttempt, EffectiveContact } from "./types"
import { useState } from "react"
import { DeleteActivityDialog } from "./DeleteActivityDialog"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { ColumnHeader } from "./components/column/ColumnHeader"
import { CardSheet } from "./components/sheet/CardSheet"

interface KanbanColumnProps {
  column: KanbanColumnType
  index?: number
  onWhatsAppClick: (e: React.MouseEvent, phoneNumber: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => void
  onRegisterEffectiveContact: (contact: EffectiveContact) => void
  onDeleteActivity: (activityId: string, clientId: string) => Promise<void>
}

export function KanbanColumn({ 
  column, 
  index = 0,
  onWhatsAppClick, 
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onDeleteActivity 
}: KanbanColumnProps) {
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<{id: string, clientId: string} | null>(null)
  const { registerScheduling, submitAttendance } = useActivityOperations()

  const handleDeleteActivity = (id: string, clientId: string) => {
    if (!id || !clientId) {
      console.error('Invalid activity or client ID:', { activityId: id, clientId });
      return;
    }
    setActivityToDelete({ id, clientId })
  }

  const confirmDeleteActivity = async () => {
    if (!activityToDelete || !activityToDelete.id || !activityToDelete.clientId) {
      console.error('Invalid activity to delete:', activityToDelete);
      return;
    }
    
    await onDeleteActivity(activityToDelete.id, activityToDelete.clientId)
    setActivityToDelete(null)
  }

  const isEven = index % 2 === 0

  return (
    <div className={`h-full flex flex-col gap-4 rounded-lg p-4 shadow-sm ${isEven ? 'bg-white' : 'bg-[#F1F0FB]'}`}>
      <ColumnHeader title={column.title} cardCount={column.cards.length} />
      
      <div className="flex flex-col gap-4 min-h-0 overflow-y-auto">
        {column.cards.map((card) => (
          <CardSheet
            key={card.id}
            card={card}
            isOpen={selectedCard?.id === card.id}
            onOpenChange={(open) => {
              if (open) {
                console.log('Abrindo card sheet para:', card.clientName);
                setSelectedCard(card)
              } else {
                console.log('Fechando card sheet para:', selectedCard?.clientName);
                setSelectedCard(null)
              }
            }}
            onWhatsAppClick={(e) => onWhatsAppClick(e, card.phoneNumber)}
            onDeleteActivity={handleDeleteActivity}
            onRegisterAttempt={async (attempt) => {
              await onRegisterAttempt(attempt)
              setSelectedCard(null)
            }}
            onRegisterEffectiveContact={async (contact) => {
              await onRegisterEffectiveContact(contact)
              setSelectedCard(null)
            }}
            onRegisterScheduling={async (scheduling) => {
              await registerScheduling(scheduling)
              setSelectedCard(null)
            }}
            onRegisterAttendance={async (attendance) => {
              await submitAttendance(attendance)
              setSelectedCard(null)
            }}
          />
        ))}
      </div>

      <DeleteActivityDialog
        isOpen={activityToDelete !== null}
        onOpenChange={() => setActivityToDelete(null)}
        onConfirm={confirmDeleteActivity}
      />
    </div>
  )
}
