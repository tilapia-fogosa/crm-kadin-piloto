import { KanbanCard } from "./KanbanCard"
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from "./types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ContactAttempt } from "./types"

interface KanbanColumnProps {
  column: KanbanColumnType
  onWhatsAppClick: (e: React.MouseEvent, phoneNumber: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => void
}

export function KanbanColumn({ column, onWhatsAppClick, onRegisterAttempt }: KanbanColumnProps) {
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    { id: 'tentativa', label: 'Tentativa de Contato' },
    { id: 'efetivo', label: 'Contato Efetivo' },
    { id: 'agendamento', label: 'Agendamento' },
    { id: 'atendimento', label: 'Atendimento' },
  ]

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
          <Dialog key={card.id} open={selectedCard?.id === card.id} onOpenChange={(open) => !open && setSelectedCard(null)}>
            <DialogTrigger asChild>
              <div onClick={() => setSelectedCard(card)}>
                <KanbanCard
                  card={card}
                  onClick={() => setSelectedCard(card)}
                  onWhatsAppClick={(e) => onWhatsAppClick(e, card.phoneNumber)}
                />
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Atividades - {card.clientName}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  {activities.map((activity) => (
                    <Button
                      key={activity.id}
                      variant="outline"
                      className={cn(
                        "justify-start",
                        selectedActivity === activity.id && "bg-primary/10"
                      )}
                      onClick={() => setSelectedActivity(activity.id)}
                    >
                      {activity.label}
                    </Button>
                  ))}
                </div>
                <div className="border-l pl-4">
                  {selectedActivity === 'tentativa' ? (
                    <ContactAttemptForm
                      onSubmit={onRegisterAttempt}
                      cardId={card.id}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Selecione uma atividade para ver as opções
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  )
}