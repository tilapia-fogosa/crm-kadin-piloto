
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
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reagendar Valorização - {clientName}</DialogTitle>
        </DialogHeader>
        
        <SchedulingForm 
          onSubmit={onSubmit}
          cardId={clientId}
        />
      </DialogContent>
    </Dialog>
  )
}
