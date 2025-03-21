
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
import { Button } from "@/components/ui/button"
import { Copy, Phone } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { WhatsAppIcon } from "../icons/WhatsAppIcon"

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
  const { toast } = useToast()

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

  const handleCopyPhone = () => {
    console.log('CardSheet - Copiando telefone:', card.phoneNumber)
    navigator.clipboard.writeText(card.phoneNumber)
      .then(() => {
        toast({
          title: "Número copiado",
          description: "Número de telefone copiado para a área de transferência",
        })
      })
      .catch(err => {
        console.error('Erro ao copiar telefone:', err)
        toast({
          title: "Erro",
          description: "Não foi possível copiar o número de telefone",
          variant: "destructive",
        })
      })
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
          <div className="flex flex-col items-center justify-center mb-2">
            <SheetTitle className="text-center">Atividades - {card.clientName}</SheetTitle>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                <span className="text-lg">{card.phoneNumber}</span>
              </div>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleCopyPhone} size="icon" variant="ghost" className="h-8 w-8">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar número</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={(e) => onWhatsAppClick(e)} 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-green-500 hover:text-green-600"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Abrir WhatsApp</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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
