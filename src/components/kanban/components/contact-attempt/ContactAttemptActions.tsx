
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ContactAttemptActionsProps {
  onSubmit: () => void
  onLossClick: () => void
  showOnLossSubmit?: boolean
  showContactTypeAlert: boolean
  actionType?: 'attempt' | 'contact'
  disabled?: boolean
}

export function ContactAttemptActions({ 
  onSubmit, 
  onLossClick, 
  showOnLossSubmit,
  showContactTypeAlert,
  actionType = 'attempt',
  disabled = false
}: ContactAttemptActionsProps) {
  // Log para rastreamento
  console.log('ContactAttemptActions - Renderizando com tipo:', actionType)
  console.log('ContactAttemptActions - Mostrando alerta:', showContactTypeAlert)
  
  // Texto dinâmico do botão baseado no tipo de ação
  const buttonText = actionType === 'attempt' ? 'Cadastrar Tentativa' : 'Cadastrar Contato'
  
  return (
    <div className="space-y-2">
      <Button 
        onClick={onSubmit}
        className="w-full"
        disabled={disabled}
      >
        {buttonText}
      </Button>

      {showContactTypeAlert && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>
            Selecione o Tipo de Contato
          </AlertDescription>
        </Alert>
      )}

      {showOnLossSubmit && (
        <Button
          variant="destructive"
          onClick={onLossClick}
          className="w-full mt-2"
          disabled={disabled}
        >
          Perdido
        </Button>
      )}
    </div>
  )
}
