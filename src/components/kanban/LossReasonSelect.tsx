
import { useLossReasons } from "./hooks/useLossReasons"
import { Toggle } from "@/components/ui/toggle"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface LossReasonSelectProps {
  selectedReasons: string[]
  onSelectReason: (reasonId: string) => void
  disabled?: boolean
}

export function LossReasonSelect({ selectedReasons, onSelectReason, disabled }: LossReasonSelectProps) {
  const { data: reasons, isLoading } = useLossReasons()

  console.log('Renderizando LossReasonSelect', {
    selectedReasons,
    availableReasons: reasons
  })

  if (isLoading) {
    console.log('Carregando motivos...')
    return (
      <div className="space-y-4">
        <span className="text-sm font-medium text-muted-foreground">
          Motivos percebidos:
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 animate-pulse">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-muted rounded-md"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!reasons?.length) {
    console.log('Nenhum motivo encontrado')
    return (
      <div className="space-y-4">
        <span className="text-sm font-medium text-muted-foreground">
          Motivos percebidos:
        </span>
        <div className="text-center py-4 text-muted-foreground">
          Nenhum motivo de perda cadastrado.
        </div>
      </div>
    )
  }

  const handleToggle = (reasonId: string) => {
    console.log('Toggle do motivo:', reasonId)
    onSelectReason(reasonId)
  }

  return (
    <div className="space-y-4">
      <span className="text-sm font-medium text-muted-foreground">
        Motivos percebidos:
      </span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {reasons.map((reason) => {
          const isSelected = selectedReasons.includes(reason.id)
          
          return (
            <Toggle
              key={reason.id}
              pressed={isSelected}
              onPressedChange={() => !disabled && onSelectReason(reason.id)}
              disabled={disabled}
              className={cn(
                "w-full h-auto min-h-[2.5rem] px-4 py-2 gap-2 transition-all duration-200 text-xs text-left",
                isSelected 
                  ? "bg-red-100 text-red-800 hover:bg-red-200 data-[state=on]:bg-red-100 data-[state=on]:text-red-800" 
                  : "hover:bg-muted/80"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 shrink-0 transition-opacity",
                  isSelected ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-left">{reason.name}</span>
            </Toggle>
          )
        })}
      </div>
    </div>
  )
}
