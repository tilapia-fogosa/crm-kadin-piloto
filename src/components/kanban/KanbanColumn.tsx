
import { KanbanCard } from "./KanbanCard"
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from "./types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { EffectiveContactForm } from "./EffectiveContactForm"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ContactAttempt, EffectiveContact } from "./types"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KanbanColumnProps {
  column: KanbanColumnType
  onWhatsAppClick: (e: React.MouseEvent, phoneNumber: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => void
  onRegisterEffectiveContact: (contact: EffectiveContact) => void
}

export function KanbanColumn({ 
  column, 
  onWhatsAppClick, 
  onRegisterAttempt,
  onRegisterEffectiveContact 
}: KanbanColumnProps) {
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)

  const activities = [
    { id: 'tentativa', label: 'Tentativa de Contato', badge: 'TE' },
    { id: 'efetivo', label: 'Contato Efetivo', badge: 'CE' },
    { id: 'agendamento', label: 'Agendamento', badge: 'AG' },
    { id: 'atendimento', label: 'Atendimento', badge: 'AT' },
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
            <DialogContent className="sm:max-w-[900px]" onPointerDownOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Atividades - {card.clientName}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-4">
                {/* Primeira Coluna - Histórico */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {card.activities?.map((activity, index) => (
                      <div key={index} className="mb-2 text-sm">
                        <p>{activity}</p>
                      </div>
                    )) || (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada
                      </p>
                    )}
                  </ScrollArea>
                </div>

                {/* Segunda Coluna - Novas Atividades */}
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold mb-2">Nova Atividade</h3>
                  <div className="flex flex-col gap-2">
                    {activities.map((activity) => (
                      <Button
                        key={activity.id}
                        variant="outline"
                        className={cn(
                          "justify-start gap-2",
                          selectedActivity === activity.id && "bg-primary/10"
                        )}
                        onClick={() => setSelectedActivity(activity.id)}
                      >
                        <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                          {activity.badge}
                        </span>
                        {activity.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Terceira Coluna - Formulário Dinâmico */}
                <div className="border-l pl-4">
                  <h3 className="font-semibold mb-2">Detalhes da Atividade</h3>
                  {selectedActivity === 'tentativa' ? (
                    <ContactAttemptForm
                      onSubmit={onRegisterAttempt}
                      cardId={card.id}
                    />
                  ) : selectedActivity === 'efetivo' ? (
                    <EffectiveContactForm
                      onSubmit={onRegisterEffectiveContact}
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
