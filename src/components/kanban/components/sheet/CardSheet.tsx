
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { KanbanCard as KanbanCardComponent } from "../../KanbanCard"
import { SheetHeaderContent } from "./SheetHeader"
import { ActivityGrid } from "./ActivityGrid"
import { KanbanCard } from "../../types"
import { useState, useEffect, useCallback } from "react"
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
  
  // Flag para determinar se um dialog de valorização está aberto
  const [valorizationDialogOpen, setValorizationDialogOpen] = useState(false);
  
  useEffect(() => {
    console.log('CardSheet - Estado do sheet:', isOpen ? 'aberto' : 'fechado')
    
    // Monitorar eventos do diálogo de valorização
    const handleDialogEvents = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target?.closest('[role="dialog"]')) {
        // Se um diálogo estiver aberto, marcamos para não abrir o sheet
        setValorizationDialogOpen(true);
        
        // Reset após um tempo
        setTimeout(() => {
          setValorizationDialogOpen(false);
        }, 300);
      }
    };

    document.addEventListener('mousedown', handleDialogEvents);
    return () => {
      document.removeEventListener('mousedown', handleDialogEvents);
    };
  }, [isOpen]);

  const handleCardClick = useCallback(() => {
    console.log('Clique no card detectado, dialog aberto?', valorizationDialogOpen);
    // Só abrimos o sheet se não houver um dialog de valorização aberto
    if (!valorizationDialogOpen) {
      onOpenChange(true);
    }
  }, [onOpenChange, valorizationDialogOpen]);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    console.log('CardSheet - Mudança de estado do sheet:', open ? 'abrindo' : 'fechando')
    onOpenChange(open)
  }, [onOpenChange]);

  const handleLossSubmit = useCallback(async (reasons: string[], observations?: string) => {
    console.log('CardSheet - Registrando perda:', { reasons, observations })
    
    try {
      await onRegisterAttendance({
        cardId: card.id,
        result: 'perdido',
        selectedReasons: reasons,
        observations: observations
      })

      console.log('CardSheet - Perda registrada com sucesso')
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao registrar perda:', error)
    }
  }, [card.id, onOpenChange, onRegisterAttendance]);

  // Componente para agendamento na valorização
  const handleOpenSchedulingForm = useCallback(() => {
    console.log('Abrindo formulário de agendamento a partir dos botões de valorização');
    // Implementação que será feita no componente de valorização
  }, []);

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <div>
          <KanbanCardComponent
            card={card}
            onClick={handleCardClick}
            onWhatsAppClick={onWhatsAppClick}
            onOpenSchedulingForm={handleOpenSchedulingForm}
          />
        </div>
      </SheetTrigger>
      <SheetContent 
        className="w-[900px] sm:max-w-[900px] overflow-y-auto"
        onInteractOutside={(e) => {
          // Verificar se o clique foi em um diálogo de valorização
          const target = e.target as HTMLElement;
          if (target?.closest('[role="dialog"]')) {
            e.preventDefault();
          }
        }}
      >
        <SheetHeader>
          <SheetHeaderContent 
            clientName={card.clientName}
            phoneNumber={card.phoneNumber}
            email={card.email}
            onWhatsAppClick={onWhatsAppClick}
          />
        </SheetHeader>
        
        <ActivityGrid 
          card={card}
          onDeleteActivity={onDeleteActivity}
          onRegisterAttempt={onRegisterAttempt}
          onRegisterEffectiveContact={onRegisterEffectiveContact}
          onRegisterScheduling={onRegisterScheduling}
          onRegisterAttendance={onRegisterAttendance}
          onLossSubmit={handleLossSubmit}
        />
      </SheetContent>
    </Sheet>
  )
}
