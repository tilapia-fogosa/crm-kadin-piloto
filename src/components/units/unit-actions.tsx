
import { Unit } from "@/types/unit";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";

interface UnitActionsProps {
  unit: Unit;
  onEdit: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}

export function UnitActions({ unit, onEdit, onDelete }: UnitActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onEdit(unit)}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => onDelete(unit)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
