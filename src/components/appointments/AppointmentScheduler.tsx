
import React, { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { TimeSlotList } from "./TimeSlotList"
import { HorizontalTimeSlot } from "./HorizontalTimeSlot"
import { cn } from "@/lib/utils"
import { useAvailableSlots } from "./hooks/useAvailableSlots"
import { 
  ToggleGroup, 
  ToggleGroupItem 
} from "@/components/ui/toggle-group"
import { List, Calendar as CalendarIcon, Grid2x2 } from "lucide-react"

interface AppointmentSchedulerProps {
  onSelectSlot: (date: Date) => void
  simplified?: boolean
  unitId?: string
}

type ViewType = "list" | "horizontal"

export function AppointmentScheduler({ 
  onSelectSlot, 
  simplified = false, 
  unitId 
}: AppointmentSchedulerProps) {
  // Log para depuração
  console.log('AppointmentScheduler - Iniciando renderização', { simplified, unitId })
  
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [viewType, setViewType] = useState<ViewType>("list")
  
  // Passa o unitId para o hook useAvailableSlots
  const { availableSlots, isLoading } = useAvailableSlots(selectedDate, unitId)
  console.log('AppointmentScheduler - Slots disponíveis:', availableSlots)

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

  const handleViewChange = (value: string) => {
    if (value === "list" || value === "horizontal") {
      console.log('AppointmentScheduler - Alterando visualização para:', value);
      setViewType(value as ViewType)
    }
  }

  // Renderiza o seletor de horários baseado no tipo de visualização
  const renderTimeSelector = () => {
    if (!selectedDate) return null
    
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Horários disponíveis para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          
          {!simplified && (
            <ToggleGroup 
              type="single" 
              value={viewType}
              onValueChange={(value) => value && handleViewChange(value)}
              className="border rounded-md"
            >
              <ToggleGroupItem value="list" aria-label="Lista de horários">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="horizontal" aria-label="Seletor horizontal">
                <Grid2x2 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
        
        {viewType === "list" ? (
          <TimeSlotList 
            date={selectedDate}
            availableSlots={availableSlots}
            isLoading={isLoading}
            onSelectTime={handleTimeSelect}
            selectedTime={selectedTime}
          />
        ) : (
          <HorizontalTimeSlot
            date={selectedDate}
            availableSlots={availableSlots}
            isLoading={isLoading}
            onSelectTime={handleTimeSelect}
            selectedTime={selectedTime}
          />
        )}
      </>
    )
  }

  return (
    <div className={cn(
      "flex gap-6",
      simplified ? "flex-col" : "flex-row"
    )}>
      <div className="flex-1">
        <div className="mb-2 flex items-center justify-center">
          <CalendarIcon className="mr-2 h-5 w-5 text-orange-500" />
          <span className="font-medium">Selecione uma data</span>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={ptBR}
          className="border rounded-md"
        />
      </div>

      <div className="flex-1">
        {renderTimeSelector()}
      </div>
    </div>
  )
}
