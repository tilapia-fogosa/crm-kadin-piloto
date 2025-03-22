
import { Button } from "@/components/ui/button"

interface SchedulingActionButtonProps {
  onSubmit: () => void
}

export function SchedulingActionButton({ onSubmit }: SchedulingActionButtonProps) {
  return (
    <Button 
      onClick={onSubmit}
      className="w-full bg-orange-500 hover:bg-orange-600"
    >
      Registrar Agendamento
    </Button>
  )
}
