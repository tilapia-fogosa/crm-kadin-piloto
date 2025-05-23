
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SchedulingForm } from "../../SchedulingForm"
import { Scheduling } from "../../types"
import { useScheduling } from "../../hooks/useScheduling"
import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ReschedulingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  onSubmit: () => Promise<void>
}

export function ReschedulingDialog({ 
  open, 
  onOpenChange, 
  clientId,
  clientName,
  onSubmit
}: ReschedulingDialogProps) {
  console.log('📅 [ReschedulingDialog] Renderizando para cliente:', clientName)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { registerScheduling } = useScheduling()

  const handleSubmit = async (scheduling: Scheduling) => {
    try {
      console.log('📅 [ReschedulingDialog] Iniciando reagendamento:', scheduling)
      setIsSubmitting(true)
      
      // Registrar o novo agendamento
      await registerScheduling({
        ...scheduling,
        cardId: clientId,
      })

      console.log('📅 [ReschedulingDialog] Reagendamento registrado - chamando callback de sucesso')
      
      // Chamar callback de sucesso que irá atualizar a agenda
      await onSubmit()

    } catch (error) {
      console.error('❌ [ReschedulingDialog] Erro ao registrar reagendamento:', error)
      setIsSubmitting(false)
      throw error
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Reagendar Atendimento - {clientName}
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <SchedulingForm 
            onSubmit={handleSubmit}
            cardId={clientId}
            isDisabled={isSubmitting}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
