
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SchedulingForm } from "../../SchedulingForm"
import { Scheduling } from "../../types"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reagendar Atendimento - {clientName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <SchedulingForm 
            onSubmit={onSubmit}
            cardId={clientId}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

