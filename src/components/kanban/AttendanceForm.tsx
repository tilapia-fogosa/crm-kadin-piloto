
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Attendance } from "./types"

interface AttendanceFormProps {
  onSubmit: (attendance: Attendance) => void
  cardId: string
}

export function AttendanceForm({ onSubmit, cardId }: AttendanceFormProps) {
  const [selectedResult, setSelectedResult] = useState<'matriculado' | 'negociacao' | 'perdido' | undefined>(undefined)

  const handleSubmit = () => {
    if (!selectedResult) {
      return
    }

    onSubmit({
      result: selectedResult,
      cardId
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => setSelectedResult('matriculado')}
          className={`w-full ${
            selectedResult === 'matriculado' 
              ? 'bg-green-500 hover:bg-green-600 ring-2 ring-green-700' 
              : 'bg-green-100 hover:bg-green-200 text-green-800'
          }`}
          variant="default"
        >
          Matriculado
        </Button>
        
        <Button
          onClick={() => setSelectedResult('negociacao')}
          className={`w-full ${
            selectedResult === 'negociacao'
              ? 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-700 text-yellow-950'
              : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
          }`}
          variant="default"
        >
          Negociação
        </Button>
        
        <Button
          onClick={() => setSelectedResult('perdido')}
          className={`w-full ${
            selectedResult === 'perdido'
              ? 'bg-red-500 hover:bg-red-600 ring-2 ring-red-700 text-white'
              : 'bg-red-100 hover:bg-red-200 text-red-800'
          }`}
          variant="default"
        >
          Perdido
        </Button>
      </div>

      <Button 
        onClick={handleSubmit}
        className="w-full"
        disabled={!selectedResult}
      >
        Cadastrar Atendimento
      </Button>
    </div>
  )
}
