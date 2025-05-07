
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { TimeButtons } from "../common/TimeButtons";
import { DateButtons } from "../common/DateButtons";
import {
  advanceBusinessDays,
  adjustToBusinessHours,
  getNextBusinessPeriod
} from "@/utils/date/utils";

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

  // Função para definir horários específicos
  const handleTimeButtonClick = (hours: number, minutes: number) => {
    console.log(`Botão de horário ${hours}:${minutes} clicado`);
    
    // Formatando o horário no formato HH:mm
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    // Se não houver data selecionada, usar a data atual
    if (!date) {
      console.log("Data não selecionada, usando data atual");
      const now = new Date();
      onDateChange(formatDateForInput(now));
    }
    
    // Atualizando o horário
    onTimeChange(formattedTime);
    
    console.log(`Horário definido para ${formattedTime}`);
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
          <DateButtons 
            updateDateAndTime={updateDateAndTime} 
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
            />
          </div>
        </div>
      </div>
    </>
  );
}
