
import { Unit } from "@/types/unit";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnitActions } from "./unit-actions";

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
}

export function UnitsTable({ units, onEdit, onDelete }: UnitsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow key={unit.id}>
              <TableCell>{unit.unit_number}</TableCell>
              <TableCell>{unit.name}</TableCell>
              <TableCell>{unit.cnpj}</TableCell>
              <TableCell>{unit.city}</TableCell>
              <TableCell>{unit.state}</TableCell>
              <TableCell>
                <UnitActions unit={unit} onEdit={onEdit} onDelete={onDelete} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
