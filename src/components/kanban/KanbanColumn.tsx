
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, ContactAttempt, EffectiveContact } from "./types"
import { useState } from "react"
import { DeleteActivityDialog } from "./DeleteActivityDialog"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { ColumnHeader } from "./components/column/ColumnHeader"
import { CardSheet } from "./components/sheet/CardSheet"

interface KanbanColumnProps {
  column: KanbanColumnType
  onWhatsAppClick: (e: React.MouseEvent, phoneNumber: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => void
  onRegisterEffectiveContact: (contact: EffectiveContact) => void
  onDeleteActivity: (activityId: string, clientId: string) => Promise<void>
}

export function KanbanColumn({ 
  column, 
  onWhatsAppClick, 
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onDeleteActivity 
}: KanbanColumnProps) {
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<{id: string, clientId: string} | null>(null)
  const { registerScheduling, registerAttendance } = useActivityOperations()

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

  return (
    <div className="flex w-80 flex-none flex-col gap-4">
      <ColumnHeader title={column.title} cardCount={column.cards.length} />
      
      <div className="flex flex-col gap-4">
        {column.cards.map((card) => (
          <CardSheet
            key={card.id}
            card={card}
            isOpen={selectedCard?.id === card.id}
            onOpenChange={(open) => {
              if (open) {
                setSelectedCard(card)
              } else {
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
              await registerAttendance(attendance)
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
