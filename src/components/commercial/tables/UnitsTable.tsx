
import { useCommercialUnitStats } from "@/hooks/useCommercialStats";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UnitsTableProps {
  selectedMonth: Date;
}

export function UnitsTable({ selectedMonth }: UnitsTableProps) {
  const { data: stats, isLoading } = useCommercialUnitStats(selectedMonth);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Unidade</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Atendimentos</TableHead>
            <TableHead>Matrículas</TableHead>
            <TableHead>Taxa de Conversão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats?.map((stat) => (
            <TableRow key={stat.unit_id}>
              <TableCell>{stat.unit_name}</TableCell>
              <TableCell>{stat.total_leads}</TableCell>
              <TableCell>{stat.total_attendances}</TableCell>
              <TableCell>{stat.total_enrollments}</TableCell>
              <TableCell>{(stat.conversion_rate * 100).toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
