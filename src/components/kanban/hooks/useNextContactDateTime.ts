
import { useState, useEffect } from "react";
import { 
  advanceBusinessDays, 
  adjustToBusinessHours,
  getNextBusinessPeriod,
  isSunday
} from "@/utils/date/utils";
import { format } from "date-fns";

interface UseNextContactDateTimeProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export function useNextContactDateTime({ 
  date, 
  onDateChange, 
  disabled = false 
}: UseNextContactDateTimeProps) {
  console.log('useNextContactDateTime - Hook inicializado', { date, disabled });
  
  const [dateValue, setDateValue] = useState<string>("");
  const [timeValue, setTimeValue] = useState<string>("");

  // Função para formatar data para o formato do input HTML
  const formatDateForInput = (date: Date): string => {
    console.log("Formatando data para input:", date);
    return format(date, 'yyyy-MM-dd');
  };

  // Função para formatar hora para o formato do input HTML
  const formatTimeForInput = (date: Date): string => {
    console.log("Formatando hora para input:", date);
    return format(date, 'HH:mm');
  };

  // Atualizar os campos quando a data é fornecida externamente
  useEffect(() => {
    if (date) {
      setDateValue(formatDateForInput(date));
      setTimeValue(formatTimeForInput(date));
    } else {
      setDateValue("");
      setTimeValue("");
    }
  }, [date]);

  // Atualizar a data e hora e propagar para o componente pai
  const updateDateAndTime = (newDate: Date) => {
    setDateValue(formatDateForInput(newDate));
    setTimeValue(formatTimeForInput(newDate));
    onDateChange(newDate);
  };

  // Atualizar a data quando os campos são alterados manualmente
  const handleDateTimeChange = (newDate: string, newTime: string) => {
    console.log('useNextContactDateTime - Campos alterados:', { newDate, newTime });
    
    if (newDate && newTime) {
      try {
        const [year, month, day] = newDate.split('-').map(Number);
        const [hours, minutes] = newTime.split(':').map(Number);
        
        const newDateObj = new Date(year, month - 1, day, hours, minutes);
        console.log('useNextContactDateTime - Nova data calculada:', newDateObj);
        
        onDateChange(newDateObj);
      } catch (error) {
        console.error('useNextContactDateTime - Erro ao processar data/hora:', error);
      }
    } else {
      onDateChange(undefined);
    }
  };

  return {
    dateValue,
    timeValue,
    setDateValue,
    setTimeValue,
    formatDateForInput,
    formatTimeForInput,
    updateDateAndTime,
    handleDateTimeChange,
    disabled
  };
}
