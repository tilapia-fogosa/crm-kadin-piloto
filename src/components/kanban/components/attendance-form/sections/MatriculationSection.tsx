
import { Observations } from "../../attendance/Observations"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MatriculationSectionProps {
  notes: string
  onNotesChange: (value: string) => void
  isValidationError: boolean
  disabled?: boolean
}

export function MatriculationSection({
  notes,
  onNotesChange,
  isValidationError,
  disabled
}: MatriculationSectionProps) {
  console.log('MatriculationSection - Renderizando seção de matrícula', { notes, isValidationError })
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Observations
          value={notes}
          onChange={onNotesChange}
          disabled={disabled}
        />
        
        {isValidationError && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O campo Descritivo é obrigatório para matrículas
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
