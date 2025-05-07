
import { Button } from "@/components/ui/button";
import { 
  handleNextPeriod, 
  handleTomorrow, 
  handleTwoDays 
} from "../../utils/nextContactDateUtils";

interface DateButtonsProps {
  updateDateAndTime: (date: Date) => void;
  disabled?: boolean;
}

export function DateButtons({
  updateDateAndTime,
  disabled = false
}: DateButtonsProps) {
  return (
    <div className="flex gap-1">
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleNextPeriod(updateDateAndTime)}
        disabled={disabled}
        className="text-xs whitespace-nowrap"
      >
        Próx.Período
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTomorrow(updateDateAndTime)}
        disabled={disabled}
        className="text-xs whitespace-nowrap"
      >
        Amanhã
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => handleTwoDays(updateDateAndTime)}
        disabled={disabled}
        className="text-xs whitespace-nowrap"
      >
        Em 2 Dias
      </Button>
    </div>
  );
}
