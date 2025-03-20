
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
}

export function UnitSelector({ onChange }: UnitSelectorProps) {
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

  return (
    <Select
      value={selectedUnitId || undefined}
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
