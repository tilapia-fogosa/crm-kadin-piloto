
import { KanbanColumn as KanbanColumnType, KanbanCard as KanbanCardType, ContactAttempt, EffectiveContact } from "../../types"
import { useState, useEffect, useRef, useCallback, memo } from "react"
import { DeleteActivityDialog } from "../../DeleteActivityDialog"
import { useActivityOperations } from "../../hooks/useActivityOperations"
import { ColumnHeader } from "./ColumnHeader"
import { CardSheet } from "../sheet/CardSheet"

interface InfiniteKanbanColumnProps {
  column: KanbanColumnType
  index?: number
  onWhatsAppClick: (e: React.MouseEvent, phoneNumber: string) => void
  onRegisterAttempt: (attempt: ContactAttempt) => void
  onRegisterEffectiveContact: (contact: EffectiveContact) => void
  onDeleteActivity: (activityId: string, clientId: string) => Promise<void>
  onLoadMore?: () => void
  isLoading?: boolean
  hasNextPage?: boolean
}

function InfiniteKanbanColumnComponent({ 
  column, 
  index = 0,
  onWhatsAppClick, 
  onRegisterAttempt,
  onRegisterEffectiveContact,
  onDeleteActivity,
  onLoadMore,
  isLoading = false,
  hasNextPage = false
}: InfiniteKanbanColumnProps) {
  const [selectedCard, setSelectedCard] = useState<KanbanCardType | null>(null)
  const [activityToDelete, setActivityToDelete] = useState<{id: string, clientId: string} | null>(null)
  const { registerScheduling, submitAttendance } = useActivityOperations()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Infinite scroll detection
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !onLoadMore || !hasNextPage || isLoading) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

    if (isNearBottom) {
      console.log('📊 [InfiniteKanbanColumn] Loading more items for column:', column.title)
      onLoadMore()
    }
  }, [onLoadMore, hasNextPage, isLoading, column.title])

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current
    if (!scrollContainer) return

    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const isEven = index % 2 === 0

  return (
    <div className={`h-full flex flex-col gap-4 rounded-lg p-4 shadow-sm ${isEven ? 'bg-white' : 'bg-[#F1F0FB]'}`}>
      <ColumnHeader title={column.title} cardCount={column.cards.length} />
      
      <div 
        ref={scrollContainerRef}
        className="flex flex-col gap-4 min-h-0 overflow-y-auto"
      >
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
              await submitAttendance(attendance)
              setSelectedCard(null)
            }}
          />
        ))}
        
        {isLoading && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-sm text-muted-foreground">Carregando mais...</span>
          </div>
        )}
        
        {!hasNextPage && column.cards.length > 0 && (
          <div className="text-center text-sm text-gray-500 p-2">
            Todos os clientes foram carregados
          </div>
        )}
      </div>

      <DeleteActivityDialog
        isOpen={activityToDelete !== null}
        onOpenChange={() => setActivityToDelete(null)}
        onConfirm={confirmDeleteActivity}
      />
    </div>
  )
}

// Memoizar o componente para evitar re-renders desnecessários
export const InfiniteKanbanColumn = memo(InfiniteKanbanColumnComponent, (prevProps, nextProps) => {
  // Re-render apenas se props importantes mudaram
  return (
    prevProps.column.id === nextProps.column.id &&
    prevProps.column.cards.length === nextProps.column.cards.length &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.hasNextPage === nextProps.hasNextPage &&
    JSON.stringify(prevProps.column.cards.map(c => c.id)) === JSON.stringify(nextProps.column.cards.map(c => c.id))
  )
})
