
import { KanbanCard } from "./KanbanCard"
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from "./types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ContactAttempt, EffectiveContact } from "./types"
import { useState } from "react"
import { ActivityHistory } from "./ActivityHistory"
import { ActivitySelector } from "./ActivitySelector"
import { ActivityDetails } from "./ActivityDetails"
import { DeleteActivityDialog } from "./DeleteActivityDialog"

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
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<{id: string, clientId: string} | null>(null)

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

  const handleRegisterAttempt = async (attempt: ContactAttempt) => {
    await onRegisterAttempt(attempt)
    setSelectedCard(null) // Fecha a tela após registrar a tentativa
  }

  const handleEffectiveContact = async (contact: EffectiveContact) => {
    await onRegisterEffectiveContact(contact)
    setSelectedCard(null) // Fecha a tela após registrar o contato efetivo
  }

  return (
    <div className="flex w-80 flex-none flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{column.title}</h2>
        <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
          {column.cards.length}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        {column.cards.map((card) => (
          <Sheet key={card.id} open={selectedCard?.id === card.id} onOpenChange={(open) => !open && setSelectedCard(null)}>
            <SheetTrigger asChild>
              <div onClick={() => setSelectedCard(card)}>
                <KanbanCard
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  onWhatsAppClick={(e) => onWhatsAppClick(e, card.phoneNumber)}
                />
              </div>
            </SheetTrigger>
            <SheetContent className="w-[900px] sm:max-w-[900px] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
              <SheetHeader>
                <SheetTitle>Atividades - {card.clientName}</SheetTitle>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <ActivityHistory
                  activities={card.activities}
                  onDeleteActivity={handleDeleteActivity}
                  clientId={card.id}
                />
                <ActivitySelector
                  selectedActivity={selectedActivity}
                  onActivitySelect={setSelectedActivity}
                />
                <ActivityDetails
                  selectedActivity={selectedActivity}
                  cardId={card.id}
                  onRegisterAttempt={handleRegisterAttempt}
                  onRegisterEffectiveContact={handleEffectiveContact}
                />
              </div>
            </SheetContent>
          </Sheet>
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
