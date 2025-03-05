
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useCommercialUnitStats } from "@/hooks/useCommercialStats";

interface UnitsTableProps {
  selectedMonth: Date;
}

export function UnitsTable({ selectedMonth }: UnitsTableProps) {
  const { data: stats, isLoading } = useCommercialUnitStats(selectedMonth);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Unidade</TableHead>
          <TableHead>Novos Leads</TableHead>
          <TableHead>Tentativas de Contato</TableHead>
          <TableHead>Contatos Efetivos</TableHead>
          <TableHead>Agendamentos</TableHead>
          <TableHead>Matrículas</TableHead>
          <TableHead>Taxa de Conversão</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {stats?.map((stat) => (
          <TableRow key={stat.unit_id}>
            <TableCell>{stat.unit_name}</TableCell>
            <TableCell>{stat.new_clients}</TableCell>
            <TableCell>{stat.contact_attempts}</TableCell>
            <TableCell>{stat.effective_contacts}</TableCell>
            <TableCell>{stat.scheduled_visits}</TableCell>
            <TableCell>{stat.enrollments}</TableCell>
            <TableCell>{stat.ce_conversion_rate}%</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
