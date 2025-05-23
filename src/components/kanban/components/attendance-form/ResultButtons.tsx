
import { ResultButton } from "../attendance/ResultButton"

interface ResultButtonsProps {
  selectedResult?: 'matriculado' | 'negociacao' | 'perdido'
  onResultSelect: (result: 'matriculado' | 'negociacao' | 'perdido') => void
  disabled?: boolean
}

export function ResultButtons({ selectedResult, onResultSelect, disabled = false }: ResultButtonsProps) {
  console.log('ResultButtons - Renderizando com resultado selecionado:', selectedResult, 'disabled:', disabled)
  
  return (
    <div className="flex flex-col gap-2">
      {['matriculado', 'negociacao', 'perdido'].map((result) => (
        <ResultButton
          key={result}
          result={result as 'matriculado' | 'negociacao' | 'perdido'}
          selectedResult={selectedResult}
          onClick={() => !disabled && onResultSelect(result as 'matriculado' | 'negociacao' | 'perdido')}
          disabled={disabled}
        />
      ))}
    </div>
  )
}
