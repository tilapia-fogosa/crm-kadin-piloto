
import { Button } from "@/components/ui/button"
import { ResultButtonProps } from "../../types/attendance-form.types"
import { cn } from "@/lib/utils"

export function ResultButton({ result, selectedResult, onClick }: ResultButtonProps) {
  console.log('ResultButton - Renderizando botão para resultado:', result)
  
  const getButtonStyle = () => {
    const styles = {
      matriculado: {
        selected: 'bg-green-500 hover:bg-green-600 ring-2 ring-green-700',
        default: 'bg-green-100 hover:bg-green-200 text-green-800'
      },
      negociacao: {
        selected: 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-700 text-yellow-950',
        default: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
      },
      perdido: {
        selected: 'bg-red-500 hover:bg-red-600 ring-2 ring-red-700 text-white',
        default: 'bg-red-100 hover:bg-red-200 text-red-800'
      }
    }

    const isSelected = selectedResult === result
    return cn(
      'w-full',
      isSelected ? styles[result].selected : styles[result].default
    )
  }

  return (
    <Button
      onClick={onClick}
      className={getButtonStyle()}
      variant="default"
    >
      {result.charAt(0).toUpperCase() + result.slice(1)}
    </Button>
  )
}
