
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { YEARS } from "../../kanban/constants/dashboard.constants";

interface MultiYearSelectorProps {
  selectedYears: string[];
  onYearChange: (years: string[]) => void;
}

export function MultiYearSelector({ 
  selectedYears, 
  onYearChange
}: MultiYearSelectorProps) {
  // Estado local para seleções temporárias
  const [tempSelectedYears, setTempSelectedYears] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  console.log('MultiYearSelector - Anos selecionados:', selectedYears);
  
  // Sincroniza o estado temporário quando as props mudam
  useEffect(() => {
    setTempSelectedYears(selectedYears);
  }, [selectedYears, open]);
  
  // Verifica se todos os anos estão selecionados
  const allSelected = tempSelectedYears.includes('todos') || 
                     (tempSelectedYears.length === YEARS.length && !tempSelectedYears.includes('todos'));
  
  // Gerencia a seleção de todos os anos
  const handleSelectAll = () => {
    if (allSelected) {
      setTempSelectedYears([]);
    } else {
      setTempSelectedYears(['todos']);
    }
  };
  
  // Gerencia a seleção individual de anos
  const handleSelectYear = (yearValue: string) => {
    // Se estamos selecionando um ano individual e 'todos' está selecionado, remova 'todos'
    let newSelected = [...tempSelectedYears];
    if (yearValue !== 'todos' && newSelected.includes('todos')) {
      newSelected = newSelected.filter(id => id !== 'todos');
    }
    
    // Alternar a seleção do ano
    if (newSelected.includes(yearValue)) {
      newSelected = newSelected.filter(id => id !== yearValue);
    } else {
      newSelected.push(yearValue);
    }
    
    // Se todos os anos individuais estão selecionados, selecione 'todos' em vez disso
    if (yearValue !== 'todos' && 
        YEARS.every(year => newSelected.includes(year.toString())) && 
        !newSelected.includes('todos')) {
      newSelected = ['todos'];
    }
    
    setTempSelectedYears(newSelected);
  };
  
  // Função para aplicar as seleções
  const handleConfirm = () => {
    // Se nenhuma seleção, padrão para ano atual
    if (tempSelectedYears.length === 0) {
      const currentYear = new Date().getFullYear().toString();
      onYearChange([currentYear]);
    } else {
      onYearChange(tempSelectedYears);
    }
    setOpen(false);
  };
  
  // Função para cancelar as alterações
  const handleCancel = () => {
    setTempSelectedYears(selectedYears);
    setOpen(false);
  };
  
  // Texto que mostra no botão principal
  const getButtonText = () => {
    if (selectedYears.includes('todos') || selectedYears.length === 0) {
      return "Todos os anos";
    }
    
    if (selectedYears.length === 1) {
      if (selectedYears[0] === 'todos') {
        return "Todos os anos";
      }
      return selectedYears[0];
    }
    
    return `${selectedYears.length} anos`;
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
                  id="select-all-years" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all-years"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Selecionar todos
                </label>
              </div>
            </div>
            
            <div className="max-h-[200px] overflow-auto space-y-2 py-1">
              {YEARS.map((year) => (
                <div key={year} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`year-${year}`} 
                    checked={tempSelectedYears.includes(year.toString()) || tempSelectedYears.includes('todos')}
                    onCheckedChange={() => handleSelectYear(year.toString())}
                  />
                  <label
                    htmlFor={`year-${year}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {year}
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
