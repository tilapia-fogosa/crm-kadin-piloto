
import { Button } from "@/components/ui/button";
import { handleTimeClick } from "../../utils/nextContactDateUtils";

interface TimeButtonsProps {
  dateValue: string;
  setDateValue: (value: string) => void;
  onDateChange: (date: Date) => void;
  formatDateForInput: (date: Date) => string;
  disabled?: boolean;
}

export function TimeButtons({
  dateValue,
  setDateValue,
  onDateChange,
  formatDateForInput,
  disabled = false
}: TimeButtonsProps) {
  // Funções para definir horários específicos
  const handleTimeButtonClick = (hours: number, minutes: number) => {
    handleTimeClick(
      hours, 
      minutes, 
      dateValue, 
      setDateValue, 
      onDateChange, 
      formatDateForInput
    );
  };

  return (
    <div className="flex gap-1">
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTimeButtonClick(9, 0)}
        disabled={disabled}
        className="text-xs"
      >
        09:00
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTimeButtonClick(13, 0)}
        disabled={disabled}
        className="text-xs"
      >
        13:00
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTimeButtonClick(17, 0)}
        disabled={disabled}
        className="text-xs"
      >
        17:00
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTimeButtonClick(18, 0)}
        disabled={disabled}
        className="text-xs"
      >
        18:00
      </Button>
    </div>
  );
}
