
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SchedulingForm } from "../../SchedulingForm"
import { Scheduling } from "../../types"
import { useScheduling } from "../../hooks/useScheduling"

interface ReschedulingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string
  clientName: string
  onSubmit: (scheduling: Scheduling) => void
}

export function ReschedulingDialog({ 
  open, 
  onOpenChange, 
  clientId,
  clientName,
  onSubmit
}: ReschedulingDialogProps) {
  console.log('ReschedulingDialog - Renderizando para cliente:', clientName)
  
  const { registerScheduling } = useScheduling();

  const handleSubmit = async (scheduling: Scheduling) => {
    try {
      console.log('ReschedulingDialog - Registrando novo agendamento:', scheduling);
      
      // Register the scheduling using the hook
      await registerScheduling({
        ...scheduling,
        cardId: clientId,
      });

      // Notify parent component
      onSubmit(scheduling);

    } catch (error) {
      console.error('Erro ao registrar reagendamento:', error);
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reagendar Atendimento - {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <SchedulingForm 
            onSubmit={handleSubmit}
            cardId={clientId}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
