
import { KanbanCard } from "./KanbanCard"
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType } from "./types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ContactAttemptForm } from "./ContactAttemptForm"
import { EffectiveContactForm } from "./EffectiveContactForm"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { ContactAttempt, EffectiveContact } from "./types"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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
  const [activityToDelete, setActivityToDelete] = useState<{index: number, activity: string} | null>(null)

  const handleDeleteActivity = (index: number, activity: string) => {
    setActivityToDelete({ index, activity })
  }

  const confirmDeleteActivity = async () => {
    if (selectedCard && activityToDelete !== null) {
      const updatedActivities = [...(selectedCard.activities || [])];
      updatedActivities.splice(activityToDelete.index, 1);
      
      // Here you would update the card's activities in your database
      console.log('Deleting activity:', activityToDelete);
      console.log('Updated activities:', updatedActivities);
      
      setActivityToDelete(null);
    }
  }

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
                <div className="flex flex-col gap-2">
                  <h3 className="font-semibold mb-2">Histórico de Atividades</h3>
                  <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                    {card.activities?.map((activity, index) => {
                      try {
                        const parts = activity.split('|')
                        const tipo_atividade = parts[0]
                        const tipo_contato = parts[1]
                        const date = new Date(parts[2])
                        const notes = parts[3]
                        
                        return (
                          <div key={index} className="mb-4 text-sm space-y-1">
                            <div className="flex items-center justify-between">
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
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteActivity(index, activity);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
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
            </SheetContent>
          </Sheet>
        ))}
      </div>

      <AlertDialog 
        open={activityToDelete !== null} 
        onOpenChange={() => setActivityToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta atividade? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteActivity}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
