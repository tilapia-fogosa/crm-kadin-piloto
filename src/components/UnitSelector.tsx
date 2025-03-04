
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUnit } from "@/contexts/UnitContext"

export function UnitSelector() {
  const { selectedUnitId, setSelectedUnitId, availableUnits, isLoading } = useUnit();

  if (isLoading) {
    return <div>Carregando unidades...</div>;
  }

  if (availableUnits.length === 0) {
    return <div>Nenhuma unidade disponível</div>;
  }

  return (
    <Select
      value={selectedUnitId || undefined}
      onValueChange={(value) => setSelectedUnitId(value)}
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
