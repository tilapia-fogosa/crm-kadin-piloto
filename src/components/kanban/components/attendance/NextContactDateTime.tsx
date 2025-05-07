
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNextContactDateTime } from "../../hooks/useNextContactDateTime";
import { DateButtons } from "../common/DateButtons";
import { TimeButtons } from "../common/TimeButtons";

interface NextContactDateTimeProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function NextContactDateTime({ 
  date, 
  onDateChange, 
  disabled = false 
}: NextContactDateTimeProps) {
  console.log('NextContactDateTime - Renderizando componente', { date, disabled });
  
  // Usando o hook para gerenciar a lógica de data/hora
  const {
    dateValue,
    timeValue,
    setDateValue,
    setTimeValue,
    formatDateForInput,
    updateDateAndTime,
    handleDateTimeChange,
  } = useNextContactDateTime({ date, onDateChange, disabled });

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
                setDateValue(e.target.value);
                handleDateTimeChange(e.target.value, timeValue);
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>
          <DateButtons 
            updateDateAndTime={updateDateAndTime}
            disabled={disabled}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Hora do próximo contato</Label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-grow">
            <Input
              type="time"
              value={timeValue}
              onChange={(e) => {
                setTimeValue(e.target.value);
                handleDateTimeChange(dateValue, e.target.value);
              }}
              disabled={disabled}
              className="w-full"
            />
          </div>
          <TimeButtons
            dateValue={dateValue}
            setDateValue={setDateValue}
            onDateChange={onDateChange}
            formatDateForInput={formatDateForInput}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
