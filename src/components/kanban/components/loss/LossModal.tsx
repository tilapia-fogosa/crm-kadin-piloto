
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LossReasonSelect } from "../../LossReasonSelect"
import { Textarea } from "@/components/ui/textarea"

interface LossModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reasons: string[], observations?: string) => void
  description?: string
}

export function LossModal({
  isOpen,
  onClose,
  onConfirm,
  description = "O cliente será marcado como perdido e sairá do Kanban. Confirma esta ação?"
}: LossModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [observations, setObservations] = useState("")

  const handleConfirm = () => {
    onConfirm(selectedReasons, observations)
    setSelectedReasons([])
    setObservations("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Cliente Perdido</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <LossReasonSelect
            selectedReasons={selectedReasons}
            onSelectReason={(reasonId) => {
              setSelectedReasons(prev => 
                prev.includes(reasonId)
                  ? prev.filter(id => id !== reasonId)
                  : [...prev, reasonId]
              )
            }}
          />

          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">
              Observações:
            </span>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Adicione observações sobre a perda do cliente"
              className="min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirm}
              disabled={selectedReasons.length === 0}
            >
              Confirmar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
