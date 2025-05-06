
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  advanceBusinessDays, 
  adjustToBusinessHours,
  getNextBusinessPeriod,
  isSunday
} from "@/utils/date/utils"
import { format } from "date-fns"
import { useState, useEffect } from "react"

interface NextContactDateTimeProps {
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  disabled?: boolean
}

export function NextContactDateTime({ 
  date, 
  onDateChange, 
  disabled = false 
}: NextContactDateTimeProps) {
  console.log('NextContactDateTime - Renderizando componente', { date, disabled })
  
  const [dateValue, setDateValue] = useState<string>("")
  const [timeValue, setTimeValue] = useState<string>("")

  // Função para formatar data para o formato do input HTML
  const formatDateForInput = (date: Date): string => {
    console.log("Formatando data para input:", date)
    return format(date, 'yyyy-MM-dd')
  }

  // Função para formatar hora para o formato do input HTML
  const formatTimeForInput = (date: Date): string => {
    console.log("Formatando hora para input:", date)
    return format(date, 'HH:mm')
  }

  // Atualizar os campos quando a data é fornecida externamente
  useEffect(() => {
    if (date) {
      setDateValue(formatDateForInput(date))
      setTimeValue(formatTimeForInput(date))
    } else {
      setDateValue("")
      setTimeValue("")
    }
  }, [date])

  // Função para lidar com o clique no botão "Próx.Período"
  const handleNextPeriod = () => {
    console.log("Botão Próx.Período clicado")
    const now = new Date()
    
    // Calculando próximo período de atendimento
    const nextPeriod = getNextBusinessPeriod(now)
    
    // Atualizando data e hora
    updateDateAndTime(nextPeriod)
    
    console.log("Próximo período calculado:", {
      date: formatDateForInput(nextPeriod),
      time: formatTimeForInput(nextPeriod)
    })
  }

  // Função para lidar com o clique no botão "Amanhã"
  const handleTomorrow = () => {
    console.log("Botão Amanhã clicado")
    const now = new Date()
    
    // Avançando para amanhã, considerando dias úteis
    let tomorrow = advanceBusinessDays(now, 1)
    
    // Mantendo o mesmo horário da data atual, mas ajustando para horário comercial
    tomorrow.setHours(now.getHours(), now.getMinutes(), 0, 0)
    tomorrow = adjustToBusinessHours(tomorrow)
    
    // Atualizando data e hora
    updateDateAndTime(tomorrow)
    
    console.log("Amanhã calculado:", {
      date: formatDateForInput(tomorrow),
      time: formatTimeForInput(tomorrow)
    })
  }

  // Função para lidar com o clique no botão "Em 2 Dias"
  const handleTwoDays = () => {
    console.log("Botão Em 2 Dias clicado")
    const now = new Date()
    
    // Avançando 2 dias, considerando dias úteis
    let inTwoDays = advanceBusinessDays(now, 2)
    
    // Mantendo o mesmo horário da data atual, mas ajustando para horário comercial
    inTwoDays.setHours(now.getHours(), now.getMinutes(), 0, 0)
    inTwoDays = adjustToBusinessHours(inTwoDays)
    
    // Atualizando data e hora
    updateDateAndTime(inTwoDays)
    
    console.log("Em 2 dias calculado:", {
      date: formatDateForInput(inTwoDays),
      time: formatTimeForInput(inTwoDays)
    })
  }

  // Atualizar a data e hora e propagar para o componente pai
  const updateDateAndTime = (newDate: Date) => {
    setDateValue(formatDateForInput(newDate))
    setTimeValue(formatTimeForInput(newDate))
    onDateChange(newDate)
  }

  // Atualizar a data quando os campos são alterados manualmente
  const handleDateTimeChange = (newDate: string, newTime: string) => {
    console.log('NextContactDateTime - Campos alterados:', { newDate, newTime })
    
    if (newDate && newTime) {
      try {
        const [year, month, day] = newDate.split('-').map(Number)
        const [hours, minutes] = newTime.split(':').map(Number)
        
        const newDateObj = new Date(year, month - 1, day, hours, minutes)
        console.log('NextContactDateTime - Nova data calculada:', newDateObj)
        
        onDateChange(newDateObj)
      } catch (error) {
        console.error('NextContactDateTime - Erro ao processar data/hora:', error)
      }
    } else {
      onDateChange(undefined)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data do próximo contato</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              type="date"
              value={dateValue}
              onChange={(e) => {
                setDateValue(e.target.value)
                handleDateTimeChange(e.target.value, timeValue)
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleNextPeriod}
              disabled={disabled}
              className="text-xs whitespace-nowrap"
            >
              Próx.Período
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleTomorrow}
              disabled={disabled}
              className="text-xs whitespace-nowrap"
            >
              Amanhã
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleTwoDays}
              disabled={disabled}
              className="text-xs whitespace-nowrap"
            >
              Em 2 Dias
            </Button>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hora do próximo contato</Label>
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => {
            setTimeValue(e.target.value)
            handleDateTimeChange(dateValue, e.target.value)
          }}
          disabled={disabled}
          className="w-full"
        />
      </div>
    </div>
  )
}
