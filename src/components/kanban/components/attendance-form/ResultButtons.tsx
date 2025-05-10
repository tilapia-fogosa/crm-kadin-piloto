
import { ResultButton } from "../attendance/ResultButton"

interface ResultButtonsProps {
  selectedResult?: 'matriculado' | 'negociacao' | 'perdido'
  onResultSelect: (result: 'matriculado' | 'negociacao' | 'perdido') => void
}

export function ResultButtons({ selectedResult, onResultSelect }: ResultButtonsProps) {
  console.log('ResultButtons - Renderizando com resultado selecionado:', selectedResult)
  
  return (
    <div className="flex flex-col gap-2">
      {['matriculado', 'negociacao', 'perdido'].map((result) => (
        <ResultButton
          key={result}
          result={result as 'matriculado' | 'negociacao' | 'perdido'}
          selectedResult={selectedResult}
          onClick={() => onResultSelect(result as 'matriculado' | 'negociacao' | 'perdido')}
        />
      ))}
    </div>
  )
}
