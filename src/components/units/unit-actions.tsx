
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UnitActionsProps {
  unit: any;
  onEdit: () => void;
}

export function UnitActions({ unit, onEdit }: UnitActionsProps) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate(`/regions/units/${unit.id}/users`)}>
          <Users className="mr-2 h-4 w-4" />
          Usuários
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
