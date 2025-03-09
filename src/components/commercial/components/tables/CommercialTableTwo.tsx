
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailyStats, TotalStats } from "../../../kanban/types/activity-dashboard.types";

interface CommercialTableTwoProps {
  stats: DailyStats[] | undefined;
  totals: TotalStats | null;
  isLoading: boolean;
}

export function CommercialTableTwo({ stats, totals, isLoading }: CommercialTableTwoProps) {
  console.log('Renderizando Tabela 2 de indicadores comerciais:', { stats, totals });
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Tabela 2 - Taxas de Conversão</h2>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent [&>th]:px-2.5">
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[18px]">Data</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% CE</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AG</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-xs py-3 px-2.5">Carregando...</TableCell>
            </TableRow>
          ) : (
            <>
              {stats?.map(day => (
                <TableRow key={day.date.toISOString()} className="hover:bg-muted/50 [&>td]:px-2.5">
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                    {format(day.date, 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="text-center text-xs py-0">{day.ceConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-0">{day.agConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-0">{day.atConversionRate.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
              
              {totals && (
                <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-bold border-t-2">
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">TOTAL</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.ceConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.agConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.atConversionRate.toFixed(1)}%</TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
