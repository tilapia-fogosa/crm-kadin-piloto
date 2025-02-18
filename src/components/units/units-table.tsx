
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnitActions } from "./unit-actions";
import { UnitEditDialog } from "./unit-edit-sheet";
import { useState } from "react";

interface UnitsTableProps {
  units: any[];
}

export function UnitsTable({ units }: UnitsTableProps) {
  const [editingUnit, setEditingUnit] = useState<any>(null);

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Região</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell>{unit.name}</TableCell>
                <TableCell>{unit.cnpj}</TableCell>
                <TableCell>{unit.region?.name}</TableCell>
                <TableCell>{unit.email || '-'}</TableCell>
                <TableCell>{unit.phone || '-'}</TableCell>
                <TableCell className="text-right">
                  <UnitActions 
                    unit={unit} 
                    onEdit={() => setEditingUnit(unit)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UnitEditDialog
        unit={editingUnit}
        open={!!editingUnit}
        onOpenChange={(open) => !open && setEditingUnit(null)}
      />
    </>
  );
}
