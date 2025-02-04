
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface BoardHeaderProps {
  selectedDate: Date | undefined
  isCalendarOpen: boolean
  setIsCalendarOpen: (open: boolean) => void
  handleDateSelect: (event: React.MouseEvent, date: Date) => void
}

export function BoardHeader({
  selectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
  handleDateSelect
}: BoardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Painel do Consultor</h1>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? (
              format(selectedDate, "PPP")
            ) : (
              <span>Selecione uma data</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && handleDateSelect({} as React.MouseEvent, date)}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
