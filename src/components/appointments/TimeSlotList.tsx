
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock } from "lucide-react"

interface TimeSlotListProps {
  date: Date
  availableSlots: string[]
  isLoading: boolean
  onSelectTime: (time: string) => void
}

export function TimeSlotList({ date, availableSlots, isLoading, onSelectTime }: TimeSlotListProps) {
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
            className="w-full justify-start"
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
