
import { useState, useEffect } from "react"
import { ActivitySelector } from "../../ActivitySelector"
import { ActivityDetails } from "../../ActivityDetails"
import { CompactHistory } from "../history/CompactHistory"
import { ClientInformation } from "./ClientInformation"
import { RegistrationCountInfo } from "./RegistrationCountInfo"
import { PaginatedActivityHistory } from "./PaginatedActivityHistory"
import { KanbanCard, ContactAttempt, EffectiveContact, Scheduling, Attendance } from "../../types"

interface ActivityGridProps {
  card: KanbanCard
  isOpen: boolean
  onDeleteActivity: (id: string, clientId: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => Promise<void>
  onRegisterEffectiveContact: (contact: EffectiveContact) => Promise<void>
  onRegisterScheduling: (scheduling: Scheduling) => Promise<void>
  onRegisterAttendance: (attendance: Attendance) => Promise<void>
  onLossSubmit: (reasons: string[], observations?: string) => Promise<void>
  isSubmitting?: boolean
}

export function ActivityGrid({
  card,
  isOpen,
  onDeleteActivity,
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onRegisterScheduling,
  onRegisterAttendance,
  onLossSubmit,
  isSubmitting = false
}: ActivityGridProps) {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)

  // Limpa estados quando o componente é desmontado
  useEffect(() => {
    console.log('ActivityGrid - Inicializando estados')
    
    return () => {
      console.log('ActivityGrid - Limpando estados')
      setSelectedActivity(null)
      setIsHistoryExpanded(true)
    }
  }, [])

  const handleActivitySelect = (activityId: string) => {
    console.log('ActivityGrid - Selecionando atividade:', activityId)
    setSelectedActivity(activityId)
    setIsHistoryExpanded(false)
  }

  return (
    <div className="grid gap-4 mt-6 relative h-[calc(90vh-80px)]" style={{ 
      gridTemplateColumns: isHistoryExpanded 
        ? '1fr 1fr 1fr' 
        : '50px minmax(200px, 1fr) minmax(300px, 2fr)' 
    }}>
      <div className={`transition-all duration-300 ease-in-out h-full ${isHistoryExpanded ? 'w-full' : 'w-[50px]'}`}>
        {isHistoryExpanded ? (
          <PaginatedActivityHistory
            clientId={card.id}
            isOpen={isOpen}
            onDeleteActivity={onDeleteActivity}
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
            disabled={isSubmitting}
          />
        </div>
        
        <div>
          <ClientInformation card={card} />
        </div>

        {/* Quadro de Número de Cadastros - só aparece quando há 2+ cadastros */}
        <RegistrationCountInfo card={card} />
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
          onLossSubmit={onLossSubmit}
          isSubmitting={isSubmitting}
        />
      </div>

      {isSubmitting && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            <p className="text-sm font-medium">Salvando...</p>
          </div>
        </div>
      )}
    </div>
  )
}
