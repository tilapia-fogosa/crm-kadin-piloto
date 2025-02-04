
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

const getActivityBadge = (tipo_atividade: string) => {
  switch (tipo_atividade) {
    case 'Tentativa de Contato':
      return 'TE'
    case 'Contato Efetivo':
      return 'CE'
    case 'Agendamento':
      return 'AG'
    case 'Atendimento':
      return 'AT'
    default:
      return ''
  }
}

const getContactType = (tipo_contato: string) => {
  switch (tipo_contato) {
    case 'phone':
      return 'Ligação Telefônica'
    case 'whatsapp':
      return 'Mensagem WhatsApp'
    case 'whatsapp-call':
      return 'Ligação WhatsApp'
    default:
      return tipo_contato
  }
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
    { id: 'Tentativa de Contato', label: 'Tentativa de Contato', badge: 'TE' },
    { id: 'Contato Efetivo', label: 'Contato Efetivo', badge: 'CE' },
    { id: 'Agendamento', label: 'Agendamento', badge: 'AG' },
    { id: 'Atendimento', label: 'Atendimento', badge: 'AT' },
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
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    {card.activities?.map((activity, index) => {
                      try {
                        const parts = activity.split('|')
                        const tipo_atividade = parts[0]
                        const tipo_contato = parts[1]
                        const date = new Date(parts[2])
                        const notes = parts[3]
                        
                        console.log('Activity data:', { tipo_atividade, tipo_contato, date, notes })

                        return (
                          <div key={index} className="mb-4 text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                                {getActivityBadge(tipo_atividade)}
                              </span>
                              <span className="text-muted-foreground">
                                {getContactType(tipo_contato)}
                              </span>
                              <span className="text-muted-foreground">
                                {format(date, 'dd/MM/yyyy HH:mm')}
                              </span>
                            </div>
                            {notes && (
                              <p className="text-sm text-muted-foreground ml-10">
                                {notes}
                              </p>
                            )}
                          </div>
                        )
                      } catch (error) {
                        console.error('Error parsing activity:', error)
                        return null
                      }
                    })}
                    {(!card.activities || card.activities.length === 0) && (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma atividade registrada
                      </p>
                    )}
                  </ScrollArea>
                </div>

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

                <div className="border-l pl-4">
                  <h3 className="font-semibold mb-2">Detalhes da Atividade</h3>
                  {selectedActivity === 'Tentativa de Contato' ? (
                    <ContactAttemptForm
                      onSubmit={onRegisterAttempt}
                      cardId={card.id}
                    />
                  ) : selectedActivity === 'Contato Efetivo' ? (
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
