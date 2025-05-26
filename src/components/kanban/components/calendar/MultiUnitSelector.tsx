
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserUnit } from "../../hooks/useUserUnit";
import { getUnitColor, shouldUseWhiteText } from "../../utils/unitColors";

interface MultiUnitSelectorProps {
  units?: UserUnit[];
  selectedUnitIds: string[];
  onChange: (unitIds: string[]) => void;
  isLoading?: boolean;
}

export function MultiUnitSelector({ 
  units = [], 
  selectedUnitIds, 
  onChange,
  isLoading = false
}: MultiUnitSelectorProps) {
  // Estado local para controlar seleções temporárias (antes de confirmar)
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  console.log('MultiUnitSelector - Renderizando com unidades:', units?.length);
  console.log('MultiUnitSelector - Unidades selecionadas:', selectedUnitIds);
  
  useEffect(() => {
    // Sincroniza o estado temporário quando as props mudam
    setTempSelectedIds(selectedUnitIds);
  }, [selectedUnitIds, open]);
  
  // Verificações de segurança para dados indefinidos
  if (!units || units.length === 0) {
    if (isLoading) {
      return (
        <Button variant="outline" disabled className="w-[180px] justify-start">
          Carregando unidades...
        </Button>
      );
    }
    
    return (
      <Button variant="outline" disabled className="w-[180px] justify-start">
        Nenhuma unidade disponível
      </Button>
    );
  }
  
  // Verifica se todas as unidades estão selecionadas
  const allSelected = selectedUnitIds.includes('todos') || 
                     (selectedUnitIds.length === units.length && !selectedUnitIds.includes('todos'));
  
  // Verifica se algumas unidades estão selecionadas
  const someSelected = selectedUnitIds.length > 0 && !selectedUnitIds.includes('todos') && selectedUnitIds.length < units.length;
  
  // Gerencia a seleção de todas as unidades
  const handleSelectAll = () => {
    if (allSelected) {
      setTempSelectedIds([]);
    } else {
      setTempSelectedIds(['todos']);
    }
  };
  
  // Gerencia a seleção individual de unidades
  const handleSelectUnit = (unitId: string) => {
    // Se estamos selecionando uma unidade individual e 'todos' está selecionado, remova 'todos'
    let newSelected = [...tempSelectedIds];
    if (unitId !== 'todos' && newSelected.includes('todos')) {
      newSelected = newSelected.filter(id => id !== 'todos');
    }
    
    // Alternar a seleção da unidade
    if (newSelected.includes(unitId)) {
      newSelected = newSelected.filter(id => id !== unitId);
    } else {
      newSelected.push(unitId);
    }
    
    // Se todas as unidades individuais estão selecionadas, selecione 'todos' em vez disso
    if (unitId !== 'todos' && 
        units.every(unit => newSelected.includes(unit.unit_id)) && 
        !newSelected.includes('todos')) {
      newSelected = ['todos'];
    }
    
    setTempSelectedIds(newSelected);
  };
  
  // Função para aplicar as seleções e fechar o popover
  const handleConfirm = () => {
    // Se nenhuma seleção, padrão para 'todos'
    if (tempSelectedIds.length === 0) {
      onChange(['todos']);
    } else {
      onChange(tempSelectedIds);
    }
    setOpen(false);
  };
  
  // Função para cancelar as alterações
  const handleCancel = () => {
    setTempSelectedIds(selectedUnitIds);
    setOpen(false);
  };
  
  // Texto que mostra no botão principal
  const getButtonText = () => {
    if (selectedUnitIds.includes('todos') || selectedUnitIds.length === 0) {
      return "Todas unidades";
    }
    
    if (selectedUnitIds.length === 1 && !selectedUnitIds.includes('todos')) {
      const selectedUnit = units.find(unit => unit.unit_id === selectedUnitIds[0]);
      return selectedUnit?.unit_name || "Uma unidade";
    }
    
    return `${selectedUnitIds.length} unidades`;
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
                  id="select-all" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Selecionar todas
                </label>
              </div>
            </div>
            
            <div className="max-h-[200px] overflow-auto space-y-2 py-1">
              {units.map((unit, index) => {
                const unitColor = getUnitColor(index);
                const textColorClass = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-800';
                
                return (
                  <div key={unit.unit_id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`unit-${unit.unit_id}`} 
                      checked={tempSelectedIds.includes(unit.unit_id) || tempSelectedIds.includes('todos')}
                      onCheckedChange={() => handleSelectUnit(unit.unit_id)}
                    />
                    <div className="flex items-center space-x-2">
                      <div 
                        className={`w-3 h-3 rounded-sm ${textColorClass}`}
                        style={{ backgroundColor: unitColor }}
                      />
                      <label
                        htmlFor={`unit-${unit.unit_id}`}
                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {unit.unit_name}
                      </label>
                    </div>
                  </div>
                );
              })}
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
