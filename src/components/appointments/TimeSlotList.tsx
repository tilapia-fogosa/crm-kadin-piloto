
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimeSlotListProps {
  date: Date
  availableSlots: string[]
  isLoading: boolean
  onSelectTime: (time: string) => void
  selectedTime?: string
}

export function TimeSlotList({ 
  date, 
  availableSlots, 
  isLoading, 
  onSelectTime,
  selectedTime 
}: TimeSlotListProps) {
  console.log('TimeSlotList - Selected time:', selectedTime)

  if (isLoading) {
    return <div className="text-center py-4">Carregando horários...</div>
  }

  if (!availableSlots.length) {
    return <div className="text-center py-4">Nenhum horário disponível nesta data.</div>
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-2">
        {availableSlots.map((time) => (
          <Button
            key={time}
            variant="outline"
            className={cn(
              "w-full justify-start",
              selectedTime === time && "bg-orange-500 text-white hover:bg-orange-600"
            )}
            onClick={() => onSelectTime(time)}
          >
            <Clock className="mr-2 h-4 w-4" />
            {time}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}
