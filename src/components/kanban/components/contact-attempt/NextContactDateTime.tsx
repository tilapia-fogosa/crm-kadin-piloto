
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { TimeButtons } from "../common/TimeButtons";
import { DateButtons } from "../common/DateButtons";

interface NextContactDateTimeProps {
  date: string
  time: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  disabled?: boolean
}

export function NextContactDateTime({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange,
  disabled = false
}: NextContactDateTimeProps) {
  console.log("NextContactDateTime - Renderizando componente")
  
  // Função para formatar data para o formato do input HTML
  const formatDateForInput = (date: Date): string => {
    console.log("Formatando data para input:", date);
    return format(date, 'yyyy-MM-dd');
  }

  // Função para formatar hora para o formato do input HTML
  const formatTimeForInput = (date: Date): string => {
    console.log("Formatando hora para input:", date);
    return format(date, 'HH:mm');
  }

  // Função para atualizar a data e hora
  const updateDateAndTime = (newDate: Date) => {
    onDateChange(formatDateForInput(newDate));
    onTimeChange(formatTimeForInput(newDate));
    
    console.log("Data e hora atualizadas:", {
      date: formatDateForInput(newDate),
      time: formatTimeForInput(newDate)
    });
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
              disabled={disabled}
            />
          </div>
          <DateButtons 
            updateDateAndTime={updateDateAndTime}
            disabled={disabled}
          />
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
              disabled={disabled}
            />
          </div>
          <div className="flex gap-1">
            <TimeButtons
              dateValue={date}
              setDateValue={onDateChange}
              onDateChange={(newDate) => {
                onDateChange(formatDateForInput(newDate));
                onTimeChange(formatTimeForInput(newDate));
              }}
              formatDateForInput={formatDateForInput}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </>
  );
}
