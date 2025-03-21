
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MatriculationMessageProps {
  clientName: string
}

export function MatriculationMessage({ clientName }: MatriculationMessageProps) {
  console.log('MatriculationMessage - Renderizando para cliente:', clientName)
  
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Matriculando {clientName}</AlertTitle>
      <AlertDescription>
        O cliente será direcionado para o processo de matrícula após salvar.
      </AlertDescription>
    </Alert>
  )
}
