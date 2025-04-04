
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"

interface HorizontalTimeSlotProps {
  date: Date
  availableSlots: string[]
  isLoading: boolean
  onSelectTime: (time: string) => void
  selectedTime?: string
}

export function HorizontalTimeSlot({
  date,
  availableSlots,
  isLoading,
  onSelectTime,
  selectedTime
}: HorizontalTimeSlotProps) {
  const [sliderValue, setSliderValue] = useState<number[]>([0])
  const [displayedTime, setDisplayedTime] = useState<string>("")
  
  // Log para depuração
  console.log('HorizontalTimeSlot - Disponíveis:', availableSlots)
  console.log('HorizontalTimeSlot - Selecionado:', selectedTime)

  // Atualiza o estado do slider quando os slots mudam ou quando um horário é selecionado
  useEffect(() => {
    if (availableSlots.length && selectedTime) {
      const selectedIndex = availableSlots.indexOf(selectedTime)
      if (selectedIndex !== -1) {
        setSliderValue([selectedIndex])
        setDisplayedTime(selectedTime)
      }
    } else if (availableSlots.length) {
      setDisplayedTime(availableSlots[0])
    }
  }, [availableSlots, selectedTime])

  if (isLoading) {
    return <div className="text-center py-4">Carregando horários...</div>
  }

  if (!availableSlots.length) {
    return <div className="text-center py-4">Nenhum horário disponível nesta data.</div>
  }

  const handleSliderChange = (value: number[]) => {
    if (value[0] !== undefined && availableSlots[value[0]]) {
      setSliderValue(value)
      setDisplayedTime(availableSlots[value[0]])
    }
  }

  const handleSelectTime = () => {
    if (displayedTime) {
      onSelectTime(displayedTime)
    }
  }

  // Marcadores para intervalos regulares (a cada 2 horas)
  const getTimeMarkers = () => {
    if (!availableSlots.length) return []
    
    const markers = []
    let lastHour = -1
    
    for (let i = 0; i < availableSlots.length; i++) {
      const [hour] = availableSlots[i].split(':').map(Number)
      if (hour !== lastHour && hour % 2 === 0) {
        markers.push({
          position: (i / (availableSlots.length - 1)) * 100,
          label: `${hour}:00`
        })
        lastHour = hour
      }
    }
    
    return markers
  }
  
  const markers = getTimeMarkers()

  return (
    <div className="space-y-6 px-2 py-4">
      <div className="flex items-center justify-center space-x-3">
        <Clock className="h-5 w-5 text-orange-500" />
        <span className="text-xl font-semibold">{displayedTime}</span>
      </div>
      
      <div className="px-4 py-6">
        <Slider
          value={sliderValue}
          max={availableSlots.length - 1}
          step={1}
          onValueChange={handleSliderChange}
          className="mb-6"
        />
        
        {/* Marcadores de tempo */}
        <div className="relative h-6 mt-2">
          {markers.map((marker, index) => (
            <div 
              key={index}
              className="absolute transform -translate-x-1/2 top-0 text-xs"
              style={{ left: `${marker.position}%` }}
            >
              <div className="h-2 w-0.5 bg-gray-300 mx-auto mb-1"></div>
              {marker.label}
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleSelectTime}
        className={cn(
          "w-full py-2 px-4 rounded-md text-white font-medium",
          selectedTime === displayedTime 
            ? "bg-orange-600 hover:bg-orange-700" 
            : "bg-orange-500 hover:bg-orange-600"
        )}
      >
        Selecionar {displayedTime}
      </button>
    </div>
  )
}
