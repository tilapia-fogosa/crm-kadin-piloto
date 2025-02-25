
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultipleUnitSelectProps } from "./types/unit-select.types";
import { useUnits } from "./hooks/useUnits";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MultipleUnitSelect({ 
  selectedUnits: externalSelectedUnits, 
  onUnitsChange,
  disabled = false 
}: MultipleUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const { units, loading } = useUnits();
  const selectedUnits = externalSelectedUnits || [];

  // Função simplificada para alternar seleção
  const toggleUnit = (unitId: string) => {
    console.log('Toggling unit:', unitId);
    const newSelectedUnits = selectedUnits.includes(unitId)
      ? selectedUnits.filter(id => id !== unitId)
      : [...selectedUnits, unitId];
    
    onUnitsChange(newSelectedUnits);
  };

  // Obtém os nomes das unidades selecionadas
  const selectedUnitNames = units
    .filter(unit => selectedUnits.includes(unit.id))
    .map(unit => `${unit.name} - ${unit.city}`);

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={selectedUnits.join(',')}
      onValueChange={() => {}}
    >
      <SelectTrigger className="w-full min-h-[40px] h-auto flex flex-wrap gap-1" disabled={disabled}>
        <SelectValue placeholder="Selecione as unidades...">
          {selectedUnits.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedUnitNames.map((name) => (
                <Badge 
                  variant="default" // Mudado para variant default para melhor contraste
                  key={name}
                  className="mr-1 mb-1 bg-primary text-primary-foreground" // Cores ajustadas para melhor visibilidade
                >
                  {name}
                </Badge>
              ))}
            </div>
          ) : (
            "Selecione as unidades..."
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[400px]">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Carregando unidades...
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-2">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md cursor-pointer"
                  onClick={() => toggleUnit(unit.id)}
                >
                  <Checkbox 
                    checked={selectedUnits.includes(unit.id)}
                    onCheckedChange={() => toggleUnit(unit.id)}
                    id={`unit-${unit.id}`}
                  />
                  <label
                    htmlFor={`unit-${unit.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-grow"
                  >
                    {unit.name} - {unit.city}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </SelectContent>
    </Select>
  );
}
