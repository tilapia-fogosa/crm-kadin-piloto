
import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { TimeSlotList } from "./TimeSlotList"
import { cn } from "@/lib/utils"
import { useAvailableSlots } from "./hooks/useAvailableSlots"

interface AppointmentSchedulerProps {
  onSelectSlot: (date: Date) => void
  simplified?: boolean
  unitId?: string // Adicionado unitId como prop opcional
}

export function AppointmentScheduler({ 
  onSelectSlot, 
  simplified = false, 
  unitId 
}: AppointmentSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  
  // Passa o unitId para o hook useAvailableSlots
  const { availableSlots, isLoading } = useAvailableSlots(selectedDate, unitId)

  const handleDateSelect = (date: Date | undefined) => {
    console.log('AppointmentScheduler - Data selecionada:', date);
    console.log('AppointmentScheduler - Usando unitId:', unitId);
    setSelectedDate(date)
    setSelectedTime(undefined) // Reset selected time when date changes
  }

  const handleTimeSelect = (time: string) => {
    console.log('AppointmentScheduler - Horário selecionado:', time);
    setSelectedTime(time)
    
    if (!selectedDate) return
    
    const [hours, minutes] = time.split(':').map(Number)
    const dateTime = new Date(selectedDate)
    dateTime.setHours(hours, minutes, 0, 0)
    
    console.log('AppointmentScheduler - DateTime completo selecionado:', dateTime);
    onSelectSlot(dateTime)
  }

  return (
    <div className={cn(
      "flex gap-6",
      simplified ? "flex-col" : "flex-row"
    )}>
      <div className="flex-1">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={ptBR}
          className="border rounded-md"
        />
      </div>

      <div className="flex-1">
        {selectedDate && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </h3>
            <TimeSlotList 
              date={selectedDate}
              availableSlots={availableSlots}
              isLoading={isLoading}
              onSelectTime={handleTimeSelect}
              selectedTime={selectedTime}
            />
          </>
        )}
      </div>
    </div>
  )
}
