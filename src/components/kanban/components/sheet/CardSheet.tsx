import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { KanbanCard as KanbanCardComponent } from "../../KanbanCard"
import { ActivityHistory } from "../../ActivityHistory"
import { ActivitySelector } from "../../ActivitySelector"
import { ActivityDetails } from "../../ActivityDetails"
import { CompactHistory } from "../history/CompactHistory"
import { ClientInformation } from "./ClientInformation"
import { KanbanCard } from "../../types"
import { useState, useEffect } from "react"
import { ContactAttempt, EffectiveContact, Scheduling, Attendance } from "../../types"

interface CardSheetProps {
  card: KanbanCard
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onWhatsAppClick: (e: React.MouseEvent) => void
  onDeleteActivity: (id: string, clientId: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => Promise<void>
  onRegisterEffectiveContact: (contact: EffectiveContact) => Promise<void>
  onRegisterScheduling: (scheduling: Scheduling) => Promise<void>
  onRegisterAttendance: (attendance: Attendance) => Promise<void>
}

export function CardSheet({ 
  card, 
  isOpen, 
  onOpenChange,
  onWhatsAppClick,
  onDeleteActivity,
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onRegisterScheduling,
  onRegisterAttendance
}: CardSheetProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)

  useEffect(() => {
    console.log('CardSheet - Estado do sheet:', isOpen ? 'aberto' : 'fechado')
    
    return () => {
      if (!isOpen) {
        console.log('CardSheet - Limpando estados ao fechar')
        setSelectedActivity(null)
        setIsHistoryExpanded(true)
      }
    }
  }, [isOpen])

  const handleActivitySelect = (activityId: string) => {
    console.log('CardSheet - Selecionando atividade:', activityId)
    setSelectedActivity(activityId)
    setIsHistoryExpanded(false)
  }

  const handleSheetOpenChange = (open: boolean) => {
    console.log('CardSheet - Mudança de estado do sheet:', open ? 'abrindo' : 'fechando')
    onOpenChange(open)
  }

  const handleLossSubmit = async (reasons: string[], observations?: string) => {
    console.log('CardSheet - Registrando perda:', { reasons, observations })
    
    try {
      await onRegisterAttendance({
        result: 'perdido',
        cardId: card.id,
        lossReasons: reasons,
        observations: observations
      })

      console.log('CardSheet - Perda registrada com sucesso')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao registrar perda:', error)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <div>
          <KanbanCardComponent
            card={card}
            onClick={() => handleSheetOpenChange(true)}
            onWhatsAppClick={onWhatsAppClick}
          />
        </div>
      </SheetTrigger>
      <SheetContent 
        className="w-[900px] sm:max-w-[900px] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Atividades - {card.clientName}</SheetTitle>
        </SheetHeader>
        <div className="grid gap-4 mt-6 relative h-[calc(90vh-80px)]" style={{ 
          gridTemplateColumns: isHistoryExpanded 
            ? '1fr 1fr 1fr' 
            : '50px minmax(200px, 1fr) minmax(300px, 2fr)' 
        }}>
          <div className={`transition-all duration-300 ease-in-out h-full ${isHistoryExpanded ? 'w-full' : 'w-[50px]'}`}>
            {isHistoryExpanded ? (
              <ActivityHistory
                activities={card.activities}
                onDeleteActivity={onDeleteActivity}
                clientId={card.id}
              />
            ) : (
              <CompactHistory
                activities={card.activities}
                onExpand={() => setIsHistoryExpanded(true)}
              />
            )}
          </div>

          <div className="space-y-4 h-full overflow-y-auto">
            <div>
              <ActivitySelector
                selectedActivity={selectedActivity}
                onActivitySelect={handleActivitySelect}
              />
            </div>
            
            <div>
              <ClientInformation card={card} />
            </div>
          </div>

          <div className="h-full overflow-y-auto">
            <ActivityDetails
              selectedActivity={selectedActivity}
              cardId={card.id}
              clientName={card.clientName}
              onRegisterAttempt={onRegisterAttempt}
              onRegisterEffectiveContact={onRegisterEffectiveContact}
              onRegisterScheduling={onRegisterScheduling}
              onRegisterAttendance={onRegisterAttendance}
              onLossSubmit={handleLossSubmit}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
