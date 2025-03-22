
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContactAttemptActionsProps {
  onSubmit: () => void
  onLossClick: () => void
  showOnLossSubmit?: boolean
  showContactTypeAlert: boolean
}

export function ContactAttemptActions({ 
  onSubmit, 
  onLossClick, 
  showOnLossSubmit,
  showContactTypeAlert
}: ContactAttemptActionsProps) {
  return (
    <div className="space-y-2">
      <Button 
        onClick={onSubmit}
        className="w-full"
      >
        Cadastrar Tentativa
      </Button>

      {showOnLossSubmit && (
        <>
          <Button
            variant="destructive"
            onClick={onLossClick}
            className="w-full"
          >
            Perdido
          </Button>
          
          {showContactTypeAlert && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>
                Selecione o Tipo de Contato
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  )
}
