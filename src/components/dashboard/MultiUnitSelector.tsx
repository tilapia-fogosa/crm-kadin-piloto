
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserUnit } from "@/components/kanban/hooks/useUserUnit";
import { getUnitColor, shouldUseWhiteText } from "@/components/kanban/utils/unitColors";
import { useUnit } from "@/contexts/UnitContext";

export function MultiUnitSelector() {
  const { availableUnits, selectedUnitIds, setSelectedUnitIds, isLoading } = useUnit();
  
  // Estado local para controlar seleções temporárias (antes de confirmar)
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  console.log('Dashboard MultiUnitSelector - Renderizando com unidades:', availableUnits?.length);
  console.log('Dashboard MultiUnitSelector - Unidades selecionadas:', selectedUnitIds);
  
  useEffect(() => {
    // Sincroniza o estado temporário quando as props mudam
    setTempSelectedIds(selectedUnitIds);
  }, [selectedUnitIds, open]);
  
  // Verificações de segurança para dados indefinidos
  if (!availableUnits || availableUnits.length === 0) {
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
  const allSelected = tempSelectedIds.length === availableUnits.length;
  
  // Verifica se algumas unidades estão selecionadas
  const someSelected = tempSelectedIds.length > 0 && tempSelectedIds.length < availableUnits.length;
  
  // Gerencia a seleção de todas as unidades
  const handleSelectAll = () => {
    if (allSelected) {
      setTempSelectedIds([]);
    } else {
      setTempSelectedIds(availableUnits.map(unit => unit.unit_id));
    }
  };
  
  // Gerencia a seleção individual de unidades
  const handleSelectUnit = (unitId: string) => {
    if (tempSelectedIds.includes(unitId)) {
      setTempSelectedIds(prev => prev.filter(id => id !== unitId));
    } else {
      setTempSelectedIds(prev => [...prev, unitId]);
    }
  };
  
  // Função para aplicar as seleções e fechar o popover
  const handleConfirm = () => {
    // Garantir que pelo menos uma unidade esteja selecionada
    if (tempSelectedIds.length === 0 && availableUnits.length > 0) {
      setSelectedUnitIds([availableUnits[0].unit_id]);
    } else {
      setSelectedUnitIds(tempSelectedIds);
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
    if (selectedUnitIds.length === 0 || selectedUnitIds.length === availableUnits.length) {
      return "Todas unidades";
    }
    
    if (selectedUnitIds.length === 1) {
      const selectedUnit = availableUnits.find(unit => unit.unit_id === selectedUnitIds[0]);
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
                  onClick={handleSelectAll}
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
              {availableUnits.map((unit, index) => {
                const unitColor = getUnitColor(index);
                const textColorClass = shouldUseWhiteText(unitColor) ? 'text-white' : 'text-gray-800';
                
                return (
                  <div key={unit.unit_id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`unit-${unit.unit_id}`} 
                      checked={tempSelectedIds.includes(unit.unit_id)}
                      onClick={() => handleSelectUnit(unit.unit_id)}
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
