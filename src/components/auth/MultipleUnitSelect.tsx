
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandInput,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MultipleUnitSelectProps } from "./types/unit-select.types";
import { useUnits } from "./hooks/useUnits";
import { UnitList } from "./components/UnitList";

export function MultipleUnitSelect({ 
  selectedUnits: initialSelectedUnits, 
  onUnitsChange,
  disabled = false 
}: MultipleUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const { units, loading } = useUnits();

  // Garantir que selectedUnits seja sempre um array
  const selectedUnits = initialSelectedUnits || [];

  const toggleUnit = (unitId: string) => {
    const newSelectedUnits = selectedUnits.includes(unitId)
      ? selectedUnits.filter(id => id !== unitId)
      : [...selectedUnits, unitId];
    
    onUnitsChange(newSelectedUnits);
  };

  const selectedUnitNames = units
    .filter(unit => selectedUnits.includes(unit.id))
    .map(unit => `${unit.name} - ${unit.city}`);

  const selectButtonAriaLabel = selectedUnits.length > 0
    ? `${selectedUnits.length} unidades selecionadas: ${selectedUnitNames.join(", ")}`
    : "Nenhuma unidade selecionada";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label={selectButtonAriaLabel}
          className="min-h-[40px] h-auto flex flex-wrap gap-1"
          disabled={disabled}
        >
          {selectedUnits.length > 0 ? (
            selectedUnitNames.map((name) => (
              <Badge 
                variant="secondary" 
                key={name}
                className="mr-1 mb-1"
              >
                {name}
              </Badge>
            ))
          ) : (
            "Selecione as unidades..."
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0"
        aria-label="Lista de unidades disponíveis"
      >
        <Command aria-label="Comando de busca de unidades">
          <CommandInput placeholder="Buscar unidade..." className="h-9" />
          <CommandEmpty>Nenhuma unidade encontrada.</CommandEmpty>
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">
              Carregando unidades...
            </div>
          ) : (
            <UnitList 
              units={units}
              selectedUnits={selectedUnits}
              onToggleUnit={toggleUnit}
            />
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
