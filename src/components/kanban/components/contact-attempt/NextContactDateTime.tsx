
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  advanceBusinessDays, 
  adjustToBusinessHours,
  getNextBusinessPeriod,
  isSunday
} from "@/utils/date/utils"
import { format, parse } from "date-fns"

interface NextContactDateTimeProps {
  date: string
  time: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
}

export function NextContactDateTime({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange 
}: NextContactDateTimeProps) {
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

  // Função para lidar com o clique no botão "Próx.Período"
  const handleNextPeriod = () => {
    console.log("Botão Próx.Período clicado")
    const now = new Date()
    
    // Calculando próximo período de atendimento
    const nextPeriod = getNextBusinessPeriod(now)
    
    // Atualizando data e hora nos inputs
    onDateChange(formatDateForInput(nextPeriod))
    onTimeChange(formatTimeForInput(nextPeriod))
    
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
    
    // Atualizando data e hora nos inputs
    onDateChange(formatDateForInput(tomorrow))
    onTimeChange(formatTimeForInput(tomorrow))
    
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
    
    // Atualizando data e hora nos inputs
    onDateChange(formatDateForInput(inTwoDays))
    onTimeChange(formatTimeForInput(inTwoDays))
    
    console.log("Em 2 dias calculado:", {
      date: formatDateForInput(inTwoDays),
      time: formatTimeForInput(inTwoDays)
    })
  }

  // Função para definir horários específicos
  const handleTimeClick = (hours: number, minutes: number) => {
    console.log(`Botão de horário ${hours}:${minutes} clicado`)
    
    // Formatando o horário no formato HH:mm
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    
    // Se não houver data selecionada, usar a data atual
    if (!date) {
      console.log("Data não selecionada, usando data atual")
      const now = new Date()
      onDateChange(formatDateForInput(now))
    }
    
    // Atualizando o horário
    onTimeChange(formattedTime)
    
    console.log(`Horário definido para ${formattedTime}`)
  }

  return (
    <>
      <div className="space-y-2">
        <Label>Data do Próximo Contato</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full"
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleNextPeriod}
              className="text-xs whitespace-nowrap"
            >
              Próx.Período
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleTomorrow}
              className="text-xs whitespace-nowrap"
            >
              Amanhã
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleTwoDays}
              className="text-xs whitespace-nowrap"
            >
              Em 2 Dias
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Hora do Próximo Contato</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-1">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleTimeClick(9, 0)}
              className="text-xs"
            >
              09:00
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleTimeClick(13, 0)}
              className="text-xs"
            >
              13:00
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleTimeClick(17, 0)}
              className="text-xs"
            >
              17:00
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => handleTimeClick(18, 0)}
              className="text-xs"
            >
              18:00
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
