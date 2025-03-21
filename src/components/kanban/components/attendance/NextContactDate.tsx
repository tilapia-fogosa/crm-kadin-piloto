
import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NextContactDateProps } from "../../types/attendance-form.types"
import { format } from "date-fns"

export function NextContactDate({ date, onDateChange, disabled = false }: NextContactDateProps) {
  console.log('NextContactDate - Renderizando componente', { date, disabled })
  
  const [dateValue, setDateValue] = useState<string>("")
  const [timeValue, setTimeValue] = useState<string>("")

  // Atualizar os campos quando a data é fornecida externamente
  useEffect(() => {
    if (date) {
      setDateValue(format(date, 'yyyy-MM-dd'))
      setTimeValue(format(date, 'HH:mm'))
    } else {
      setDateValue("")
      setTimeValue("")
    }
  }, [date])

  // Atualizar a data quando os campos são alterados
  const handleDateChange = (newDate: string, newTime: string) => {
    console.log('NextContactDate - Campos alterados:', { newDate, newTime })
    
    if (newDate && newTime) {
      try {
        const [year, month, day] = newDate.split('-').map(Number)
        const [hours, minutes] = newTime.split(':').map(Number)
        
        const newDateObj = new Date(year, month - 1, day, hours, minutes)
        console.log('NextContactDate - Nova data calculada:', newDateObj)
        
        onDateChange(newDateObj)
      } catch (error) {
        console.error('NextContactDate - Erro ao processar data/hora:', error)
      }
    } else {
      onDateChange(undefined)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Data do próximo contato</Label>
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => {
            setDateValue(e.target.value)
            handleDateChange(e.target.value, timeValue)
          }}
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label>Hora do próximo contato</Label>
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => {
            setTimeValue(e.target.value)
            handleDateChange(dateValue, e.target.value)
          }}
          disabled={disabled}
        />
      </div>
    </div>
  )
}
