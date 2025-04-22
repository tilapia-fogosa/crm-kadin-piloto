import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DailyStats, TotalStats } from "../../types/activity-dashboard.types";
import React from "react";

interface ActivityTableProps {
  stats: DailyStats[] | undefined;
  totals: TotalStats | null;
  isLoading: boolean;
}

export function ActivityTable({ stats, totals, isLoading }: ActivityTableProps) {
  React.useEffect(() => {
    if (stats) {
      console.log("[ACTIVITY TABLE] Dias recebidos para renderização:", stats.map(d => format(d.date, 'dd/MM/yyyy')));
      stats.forEach(day =>
        console.log(`[ACTIVITY TABLE] Dia: ${format(day.date, 'dd/MM/yyyy')}, Novos: ${day.newClients}, Contatos: ${day.contactAttempts}, Efetivos: ${day.effectiveContacts}, Agendamentos: ${day.scheduledVisits}, Realizadas: ${day.completedVisits}, Matrículas: ${day.enrollments}`)
      );
    }
  }, [stats]);

  return (
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
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% CE</TableHead>
          <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
            {"Visitas\nAgendadas"}
          </TableHead>
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AG</TableHead>
          <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
            {"Visitas\nAguardadas"}
          </TableHead>
          <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
            {"Visitas\nRealizadas"}
          </TableHead>
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% AT</TableHead>
          <TableHead className="text-center whitespace-pre-line text-xs font-semibold w-[12.6px]">
            {"Matrí-\nculas"}
          </TableHead>
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[10.8px]">% MA</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={12} className="text-center text-xs py-3 px-2.5">Carregando...</TableCell>
          </TableRow>
        ) : (
          <>
            {stats?.map(day => (
              <TableRow key={day.date.toISOString()} className="hover:bg-muted/50 [&>td]:px-2.5">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                  {format(day.date, 'dd/MM/yyyy', { locale: ptBR })}
                  <span className="block text-[10px] text-gray-400">(ISO: {day.date.toISOString().split('T')[0]})</span>
                </TableCell>
                <TableCell className="text-center text-xs py-0">{day.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{day.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{day.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{day.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{day.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{day.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-[5px]">{day.enrollments}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{day.maConversionRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            
            {totals && (
              <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-bold border-t-2">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">TOTAL</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-[5px]">{totals.enrollments}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.maConversionRate.toFixed(1)}%</TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
}
