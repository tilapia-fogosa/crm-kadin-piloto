
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface StatsTableProps {
  data: any[];
  nameKey: string;
  title: string;
}

export function CommercialStatsTable({ data, nameKey, title }: StatsTableProps) {
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (date: string) => format(new Date(date), 'MMM/yyyy', { locale: ptBR });

  if (!data?.length) {
    return <div>Nenhum dado encontrado</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{title}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Novos Leads</TableHead>
              <TableHead>Tentativas</TableHead>
              <TableHead>Efetivos</TableHead>
              <TableHead>Agendamentos</TableHead>
              <TableHead>Aguardando</TableHead>
              <TableHead>Realizados</TableHead>
              <TableHead>Taxa CE</TableHead>
              <TableHead>Taxa AG</TableHead>
              <TableHead>Taxa AT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={`${row[nameKey]}-${row.month_year}-${index}`}>
                <TableCell>{row[nameKey]}</TableCell>
                <TableCell>{formatDate(row.month_year)}</TableCell>
                <TableCell>{row.new_clients}</TableCell>
                <TableCell>{row.contact_attempts}</TableCell>
                <TableCell>{row.effective_contacts}</TableCell>
                <TableCell>{row.scheduled_visits}</TableCell>
                <TableCell>{row.awaiting_visits}</TableCell>
                <TableCell>{row.completed_visits}</TableCell>
                <TableCell>{formatPercentage(row.ce_conversion_rate)}</TableCell>
                <TableCell>{formatPercentage(row.ag_conversion_rate)}</TableCell>
                <TableCell>{formatPercentage(row.at_conversion_rate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
