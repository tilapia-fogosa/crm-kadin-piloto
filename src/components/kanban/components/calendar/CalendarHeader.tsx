
import { Button } from "@/components/ui/button"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { DialogTitle, DialogHeader } from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CalendarHeaderProps {
  currentDate: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export function CalendarHeader({ 
  currentDate, 
  onPreviousMonth, 
  onNextMonth 
}: CalendarHeaderProps) {
  console.log('Renderizando CalendarHeader')
  
  const currentMonth = format(currentDate, 'MMM', { locale: ptBR }).toUpperCase()
  const currentYear = currentDate.getFullYear()

  return (
    <DialogHeader className="text-center mb-6">
      <DialogTitle className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-2xl font-bold">
          <Calendar className="h-6 w-6" />
          Agenda de Leads
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onPreviousMonth}
            className="hover:bg-emerald-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="bg-emerald-600 text-white px-6 py-2 rounded-full text-lg font-semibold min-w-[200px]">
            {currentMonth} {currentYear}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onNextMonth}
            className="hover:bg-emerald-50"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogTitle>
    </DialogHeader>
  )
}
