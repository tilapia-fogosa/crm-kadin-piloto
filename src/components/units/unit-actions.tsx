
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface UnitActionsProps {
  unit: any;
  onEdit: (unit: any) => void;
  onDelete: (unit: any) => void;
}

export function UnitActions({ unit, onEdit, onDelete }: UnitActionsProps) {
  return (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="icon" onClick={() => onEdit(unit)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(unit)}
      >
        <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
      </Button>
    </div>
  );
}
