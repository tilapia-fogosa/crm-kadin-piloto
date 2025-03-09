
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailyStats, TotalStats } from "../../../kanban/types/activity-dashboard.types";

interface CommercialTableOneProps {
  stats: DailyStats[] | undefined;
  totals: TotalStats | null;
  isLoading: boolean;
}

export function CommercialTableOne({ stats, totals, isLoading }: CommercialTableOneProps) {
  console.log('Renderizando Tabela 1 de indicadores comerciais:', { stats, totals });
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Tabela 1 - Visão Geral</h2>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent [&>th]:px-2.5">
            <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[18px]">Data</TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
              {"Novos\nClientes"}
            </TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[14.4px]">
              {"Total de\nContatos"}
            </TableHead>
            <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
              {"Contatos\nEfetivos"}
            </TableHead>
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
                  <TableCell className="text-center text-xs py-0">{day.newClients}</TableCell>
                  <TableCell className="text-center text-xs py-0">{day.contactAttempts}</TableCell>
                  <TableCell className="text-center text-xs py-0">{day.effectiveContacts}</TableCell>
                </TableRow>
              ))}
              
              {totals && (
                <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-bold border-t-2">
                  <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">TOTAL</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.newClients}</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.contactAttempts}</TableCell>
                  <TableCell className="text-center text-xs py-0">{totals.effectiveContacts}</TableCell>
                </TableRow>
              )}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
