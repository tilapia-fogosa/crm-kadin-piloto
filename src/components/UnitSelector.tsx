
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUnit } from "@/contexts/UnitContext"
import { useEffect } from "react"

interface UnitSelectorProps {
  onChange?: (unitId: string) => void;
  value?: string; // Nova propriedade para controlar o valor externamente
}

export function UnitSelector({ onChange, value }: UnitSelectorProps) {
  const { selectedUnitId, setSelectedUnitId, availableUnits, isLoading } = useUnit();

  // Notifica o componente pai quando a unidade selecionada muda
  useEffect(() => {
    console.log('UnitSelector - Unidade selecionada mudou para:', selectedUnitId);
    if (selectedUnitId && onChange) {
      onChange(selectedUnitId);
    }
  }, [selectedUnitId, onChange]);

  if (isLoading) {
    return <div>Carregando unidades...</div>;
  }

  if (availableUnits.length === 0) {
    return <div>Nenhuma unidade disponível</div>;
  }

  // Determina qual valor usar: o fornecido externamente (value) ou o do contexto (selectedUnitId)
  const currentValue = value !== undefined ? value : selectedUnitId;
  
  console.log('UnitSelector - Renderizando com valor:', currentValue || 'nenhum valor');

  return (
    <Select
      value={currentValue || undefined}
      onValueChange={(value) => {
        console.log('UnitSelector - Seleção alterada para:', value);
        setSelectedUnitId(value);
        if (onChange) {
          onChange(value);
        }
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Selecione uma unidade" />
      </SelectTrigger>
      <SelectContent>
        {availableUnits.map((unitUser) => (
          <SelectItem key={unitUser.unit_id} value={unitUser.unit_id}>
            {unitUser.units.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
