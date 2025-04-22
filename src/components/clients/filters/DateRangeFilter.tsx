import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { formatDateForInput } from "@/utils/date"

// Tipo de data simplificado compatível com componentes NextContactDate/NextContactDateTime
type DateRange = {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangeFilterProps {
  dateRange: DateRange | null
  onDateChange: (from: string, to: string) => void
}

/**
 * Componente para filtrar por período de datas
 * 
 * @param dateRange - Intervalo de datas atual
 * @param onDateChange - Função chamada quando as datas mudam
 */
export function DateRangeFilter({ dateRange, onDateChange }: DateRangeFilterProps) {
  console.log('DateRangeFilter: Renderizando com dateRange', dateRange)
  
  // Estados para inputs de data
  const [fromDate, setFromDate] = useState<string>("")
  const [toDate, setToDate] = useState<string>("")

  // Atualizar inputs de data quando o dateRange mudar
  useEffect(() => {
    console.log("DateRangeFilter: Atualizando estados de data", dateRange)
    
    if (dateRange?.from) {
      setFromDate(formatDateForInput(dateRange.from))
    } else {
      setFromDate("")
    }
    
    if (dateRange?.to) {
      setToDate(formatDateForInput(dateRange.to))
    } else {
      setToDate("")
    }
  }, [dateRange])

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Período de cadastro</Label>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-from">De</Label>
          <Input 
            id="date-from"
            type="date" 
            value={fromDate} 
            onChange={(e) => {
              const newValue = e.target.value
              setFromDate(newValue)
              onDateChange(newValue, toDate)
            }}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-to">Até</Label>
          <Input 
            id="date-to"
            type="date" 
            value={toDate} 
            onChange={(e) => {
              const newValue = e.target.value
              setToDate(newValue)
              onDateChange(fromDate, newValue)
            }}
          />
        </div>
      </div>
    </div>
  )
}
