
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
  value?: string; // Propriedade para controlar o valor externamente
  placeholder?: string; // Nova propriedade para texto placeholder personalizado
  required?: boolean; // Nova propriedade para indicar se a seleção é obrigatória
}

export function UnitSelector({ onChange, value, placeholder, required }: UnitSelectorProps) {
  const { selectedUnitId, setSelectedUnitId, availableUnits, isLoading } = useUnit();

  // Notifica o componente pai quando a unidade selecionada muda através do contexto global
  useEffect(() => {
    console.log('UnitSelector - Unidade selecionada no contexto global mudou para:', selectedUnitId);
    if (selectedUnitId && onChange && value === undefined) {
      onChange(selectedUnitId);
    }
  }, [selectedUnitId, onChange, value]);

  if (isLoading) {
    return <div>Carregando unidades...</div>;
  }

  if (availableUnits.length === 0) {
    return <div>Nenhuma unidade disponível</div>;
  }

  // Determina qual valor usar: o fornecido externamente (value) ou o do contexto (selectedUnitId)
  const currentValue = value !== undefined ? value : selectedUnitId;
  
  console.log('UnitSelector - Renderizando com valor:', currentValue || 'nenhum valor');
  console.log('UnitSelector - Usando placeholder:', placeholder || 'Selecione uma unidade');

  return (
    <Select
      value={currentValue || undefined}
      onValueChange={(value) => {
        console.log('UnitSelector - Seleção alterada para:', value);
        // Só atualiza o contexto global quando não tem valor controlado externamente
        if (value !== undefined) {
          setSelectedUnitId(value);
        }
        if (onChange) {
          onChange(value);
        }
      }}
      required={required}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder={placeholder || "Selecione uma unidade"} />
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
