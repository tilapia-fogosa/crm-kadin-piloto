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
import { ChevronDown, ChevronUp } from "lucide-react";

export function MultipleUnitSelect({ 
  selectedUnits: externalSelectedUnits, 
  onUnitsChange,
  disabled = false 
}: MultipleUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const { units, loading } = useUnits();
  const selectedUnits = externalSelectedUnits || [];

  const toggleUnit = (unitId: string) => {
    console.log('Toggling unit:', unitId);
    const newSelectedUnits = selectedUnits.includes(unitId)
      ? selectedUnits.filter(id => id !== unitId)
      : [...selectedUnits, unitId];
    
    onUnitsChange(newSelectedUnits);
  };

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
                  variant="default"
                  key={name}
                  className="mr-1 mb-1 bg-primary text-primary-foreground"
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
      <SelectContent 
        className="w-[400px]"
        align="start"
        position="popper"
        side="bottom"
      >
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">
            Carregando unidades...
          </div>
        ) : (
          <div className="relative">
            {units.length > 8 && (
              <div className="absolute right-2 top-0 z-10 flex flex-col gap-1 p-1">
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <ScrollArea className="h-[400px] pr-6">
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
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
