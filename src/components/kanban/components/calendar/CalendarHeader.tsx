
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  isLoading?: boolean
}

export function CalendarHeader({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth,
  isLoading = false
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onPreviousMonth}
        disabled={isLoading}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-2 min-w-[200px] justify-center">
        <h3 className="text-lg font-semibold">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onNextMonth}
        disabled={isLoading}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
