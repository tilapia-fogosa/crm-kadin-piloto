
import { memo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Unit } from "../types/unit-select.types";

interface UnitListProps {
  units: Unit[];
  selectedUnits: string[];
  onToggleUnit: (unitId: string) => void;
}

function UnitListComponent({ units, selectedUnits, onToggleUnit }: UnitListProps) {
  return (
    <CommandGroup>
      {units.map((unit) => (
        <CommandItem
          key={unit.id}
          value={`${unit.name}-${unit.city}`}
          onSelect={(currentValue) => {
            onToggleUnit(unit.id);
          }}
          aria-selected={selectedUnits.includes(unit.id)}
          className="cursor-pointer"
        >
          <Check
            className={cn(
              "mr-2 h-4 w-4",
              selectedUnits.includes(unit.id) ? "opacity-100" : "opacity-0"
            )}
          />
          {unit.name} - {unit.city}
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

export const UnitList = memo(UnitListComponent);
