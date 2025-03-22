
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
  return (
    <>
      <div className="space-y-2">
        <Label>Data do Próximo Contato</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full"
          placeholder="dd/mm/aaaa"
        />
      </div>

      <div className="space-y-2">
        <Label>Hora do Próximo Contato</Label>
        <Input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full"
        />
      </div>
    </>
  )
}
