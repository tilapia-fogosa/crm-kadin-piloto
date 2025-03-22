
import { Button } from "@/components/ui/button"

interface SchedulingActionButtonProps {
  onSubmit: () => void
  disabled?: boolean
}

export function SchedulingActionButton({ onSubmit, disabled = false }: SchedulingActionButtonProps) {
  // Log para rastreamento
  console.log('SchedulingActionButton - Renderizando botão', disabled ? 'desabilitado' : 'habilitado')
  
  const handleClick = () => {
    console.log('SchedulingActionButton - Botão de agendamento clicado')
    onSubmit()
  }

  return (
    <Button 
      onClick={handleClick}
      disabled={disabled}
      className="w-full bg-orange-500 hover:bg-orange-600"
    >
      Registrar Agendamento
    </Button>
  )
}
