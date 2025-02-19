
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Unit {
  id: string;
  name: string;
}

interface MultipleUnitSelectProps {
  units: Unit[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultipleUnitSelect({ units, value, onChange }: MultipleUnitSelectProps) {
  const [search, setSearch] = useState("");

  const selectedUnits = units.filter((unit) => value.includes(unit.id));
  const availableUnits = units.filter(
    (unit) => 
      !value.includes(unit.id) && 
      unit.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (unitId: string) => {
    onChange([...value, unitId]);
  };

  const handleRemove = (unitId: string) => {
    onChange(value.filter((id) => id !== unitId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedUnits.map((unit) => (
          <div
            key={unit.id}
            className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1"
          >
            <span className="text-sm">{unit.name}</span>
            <button
              type="button"
              onClick={() => handleRemove(unit.id)}
              className="text-primary/60 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Input
          type="search"
          placeholder="Buscar unidades..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ScrollArea className="h-[200px] rounded-md border">
          <div className="p-4 space-y-2">
            {availableUnits.map((unit) => (
              <Button
                key={unit.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleSelect(unit.id)}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value.includes(unit.id) ? "opacity-100" : "opacity-0"
                  }`}
                />
                {unit.name}
              </Button>
            ))}
            {availableUnits.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma unidade encontrada
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
