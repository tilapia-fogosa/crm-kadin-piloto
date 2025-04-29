
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MONTHS } from "../../kanban/constants/dashboard.constants";

interface MultiMonthSelectorProps {
  selectedMonths: string[];
  onMonthChange: (months: string[]) => void;
}

export function MultiMonthSelector({ 
  selectedMonths, 
  onMonthChange
}: MultiMonthSelectorProps) {
  // Estado local para seleções temporárias
  const [tempSelectedMonths, setTempSelectedMonths] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  console.log('MultiMonthSelector - Meses selecionados:', selectedMonths);
  
  // Sincroniza o estado temporário quando as props mudam
  useEffect(() => {
    setTempSelectedMonths(selectedMonths);
  }, [selectedMonths, open]);
  
  // Verifica se todos os meses estão selecionados
  const allSelected = tempSelectedMonths.includes('todos') || 
                     (tempSelectedMonths.length === MONTHS.length && !tempSelectedMonths.includes('todos'));
  
  // Gerencia a seleção de todos os meses
  const handleSelectAll = () => {
    if (allSelected) {
      setTempSelectedMonths([]);
    } else {
      setTempSelectedMonths(['todos']);
    }
  };
  
  // Gerencia a seleção individual de meses
  const handleSelectMonth = (monthValue: string) => {
    // Se estamos selecionando um mês individual e 'todos' está selecionado, remova 'todos'
    let newSelected = [...tempSelectedMonths];
    if (monthValue !== 'todos' && newSelected.includes('todos')) {
      newSelected = newSelected.filter(id => id !== 'todos');
    }
    
    // Alternar a seleção do mês
    if (newSelected.includes(monthValue)) {
      newSelected = newSelected.filter(id => id !== monthValue);
    } else {
      newSelected.push(monthValue);
    }
    
    // Se todos os meses individuais estão selecionados, selecione 'todos' em vez disso
    if (monthValue !== 'todos' && 
        MONTHS.every(month => newSelected.includes(month.value)) && 
        !newSelected.includes('todos')) {
      newSelected = ['todos'];
    }
    
    setTempSelectedMonths(newSelected);
  };
  
  // Função para aplicar as seleções
  const handleConfirm = () => {
    // Se nenhuma seleção, padrão para mês atual
    if (tempSelectedMonths.length === 0) {
      const currentMonth = new Date().getMonth().toString();
      onMonthChange([currentMonth]);
    } else {
      onMonthChange(tempSelectedMonths);
    }
    setOpen(false);
  };
  
  // Função para cancelar as alterações
  const handleCancel = () => {
    setTempSelectedMonths(selectedMonths);
    setOpen(false);
  };
  
  // Texto que mostra no botão principal
  const getButtonText = () => {
    if (selectedMonths.includes('todos') || selectedMonths.length === 0) {
      return "Todos os meses";
    }
    
    if (selectedMonths.length === 1) {
      if (selectedMonths[0] === 'todos') {
        return "Todos os meses";
      }
      const selectedMonth = MONTHS.find(month => month.value === selectedMonths[0]);
      return selectedMonth?.label || "Um mês";
    }
    
    return `${selectedMonths.length} meses`;
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[180px] justify-start text-left font-normal"
        >
          <span className="truncate">{getButtonText()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        <div className="p-2">
          <div className="space-y-2">
            <div className="border-b pb-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="select-all-months" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-months"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Selecionar todos
                </label>
              </div>
            </div>
            
            <div className="max-h-[200px] overflow-auto space-y-2 py-1">
              {MONTHS.map((month) => (
                <div key={month.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`month-${month.value}`} 
                    checked={tempSelectedMonths.includes(month.value) || tempSelectedMonths.includes('todos')}
                    onCheckedChange={() => handleSelectMonth(month.value)}
                  />
                  <label
                    htmlFor={`month-${month.value}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {month.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4 border-t pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleConfirm}
            >
              <Check className="h-4 w-4 mr-1" />
              Confirmar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
