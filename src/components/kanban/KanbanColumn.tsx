
import { KanbanCard } from "./KanbanCard"
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, ContactAttempt, EffectiveContact, Scheduling, Attendance } from "./types"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { ActivityHistory } from "./ActivityHistory"
import { ActivitySelector } from "./ActivitySelector"
import { ActivityDetails } from "./ActivityDetails"
import { DeleteActivityDialog } from "./DeleteActivityDialog"
import { useActivityOperations } from "./hooks/useActivityOperations"
import { Separator } from "@/components/ui/separator"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)
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

  const handleRegisterAttempt = async (attempt: ContactAttempt) => {
    await onRegisterAttempt(attempt)
    setSelectedCard(null)
  }

  const handleEffectiveContact = async (contact: EffectiveContact) => {
    await onRegisterEffectiveContact(contact)
    setSelectedCard(null)
  }

  const handleScheduling = async (scheduling: Scheduling) => {
    await registerScheduling(scheduling)
    setSelectedCard(null)
  }

  const handleAttendance = async (attendance: Attendance) => {
    await registerAttendance(attendance)
    setSelectedCard(null)
  }

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
    setIsHistoryExpanded(false)
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
              <div className="grid gap-4 mt-6 relative" style={{ 
                gridTemplateColumns: isHistoryExpanded 
                  ? '1fr 1fr 1fr' 
                  : 'minmax(50px, auto) minmax(200px, 1fr) minmax(300px, 2fr)' 
              }}>
                <div className={`transition-all duration-300 ease-in-out ${isHistoryExpanded ? 'w-full' : 'w-[50px]'}`}>
                  {isHistoryExpanded ? (
                    <ActivityHistory
                      activities={card.activities}
                      onDeleteActivity={handleDeleteActivity}
                      clientId={card.id}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full p-2"
                        onClick={() => setIsHistoryExpanded(true)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      {card.activities?.filter(activity => {
                        const parts = activity.split('|')
                        return parts[6] === 'true'
                      }).map((activity, index) => {
                        const parts = activity.split('|')
                        const tipo_atividade = parts[0]
                        let badge = ''
                        switch(tipo_atividade) {
                          case 'Tentativa de Contato':
                            badge = 'TE'
                            break
                          case 'Contato Efetivo':
                            badge = 'CE'
                            break
                          case 'Agendamento':
                            badge = 'AG'
                            break
                          case 'Atendimento':
                            badge = 'AT'
                            break
                        }
                        return (
                          <div key={index} className="flex justify-center">
                            <span className="flex items-center justify-center bg-[#FEC6A1] text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
                              {badge}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                <ActivitySelector
                  selectedActivity={selectedActivity}
                  onActivitySelect={handleActivitySelect}
                />

                <div className={`transition-all duration-300 ease-in-out ${!selectedActivity ? 'w-full' : ''}`}>
                  {!selectedActivity && (
                    <div className="border rounded-md p-4">
                      <h3 className="font-medium text-sm mb-4">Informações do Cliente</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Origem:</span>
                          <span className="text-sm font-medium text-right">{card.leadSource || "-"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Anúncio:</span>
                          <span className="text-sm font-medium text-right">{card.original_ad || "-"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Segmentação:</span>
                          <span className="text-sm font-medium text-right">{card.original_adset || "-"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm text-muted-foreground">Observações:</span>
                          <span className="text-sm font-medium text-right max-w-[60%] whitespace-pre-wrap">{card.observations || "-"}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <ActivityDetails
                    selectedActivity={selectedActivity}
                    cardId={card.id}
                    onRegisterAttempt={handleRegisterAttempt}
                    onRegisterEffectiveContact={handleEffectiveContact}
                    onRegisterScheduling={handleScheduling}
                    onRegisterAttendance={handleAttendance}
                  />
                </div>
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
