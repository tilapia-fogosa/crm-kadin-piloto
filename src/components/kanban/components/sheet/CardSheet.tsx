
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { KanbanCard as KanbanCardComponent } from "../../KanbanCard"
import { SheetHeaderContent } from "./SheetHeader"
import { ActivityGrid } from "./ActivityGrid"
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
  
  useEffect(() => {
    console.log('CardSheet - Estado do sheet:', isOpen ? 'aberto' : 'fechado')
  }, [isOpen])

  const handleSheetOpenChange = (open: boolean) => {
    console.log('CardSheet - Mudança de estado do sheet:', open ? 'abrindo' : 'fechando')
    onOpenChange(open)
  }

  const handleLossSubmit = async (reasons: string[], observations?: string) => {
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
          <SheetHeaderContent 
            clientName={card.clientName}
            phoneNumber={card.phoneNumber}
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
