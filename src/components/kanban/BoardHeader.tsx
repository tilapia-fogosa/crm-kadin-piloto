
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

interface BoardHeaderProps {
  selectedDate: Date | undefined
  isCalendarOpen: boolean
  setIsCalendarOpen: (open: boolean) => void
  handleDateSelect: (date: Date | undefined) => void
  showPendingOnly: boolean
  setShowPendingOnly: (show: boolean) => void
}

export function BoardHeader({
  selectedDate,
  isCalendarOpen,
  setIsCalendarOpen,
  handleDateSelect,
  showPendingOnly,
  setShowPendingOnly
}: BoardHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
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
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          id="pending-filter"
          checked={showPendingOnly}
          onCheckedChange={setShowPendingOnly}
        />
        <Label htmlFor="pending-filter">
          Apenas contatos pendentes/atrasados
        </Label>
      </div>
    </div>
  )
}
