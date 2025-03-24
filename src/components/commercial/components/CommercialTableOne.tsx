
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TotalStats } from "../../kanban/types/activity-dashboard.types";
import { useCommercialUnitStats } from "../hooks/useCommercialUnitStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnit } from "@/contexts/UnitContext";

interface CommercialTableProps {
  selectedSource: string;
  selectedMonth: string;
  selectedYear: string;
  totals: TotalStats | null;
}

export function CommercialTableOne({ selectedSource, selectedMonth, selectedYear }: CommercialTableProps) {
  const { isLoading: isLoadingUnits } = useUnit();
  const { data: unitStats, isLoading: isLoadingStats } = useCommercialUnitStats(selectedSource, selectedMonth, selectedYear);
  
  const isLoading = isLoadingUnits || isLoadingStats;
  
  console.log('Renderizando Tabela 1:', { 
    isLoadingUnits,
    isLoadingStats,
    unitStats
  });

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent [&>th]:px-2.5">
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[18px]">Unidade</TableHead>
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
          <>
            {[1, 2, 3].map((i) => (
              <TableRow key={i}>
                <TableCell colSpan={12} className="p-2">
                  <Skeleton className="h-8 w-full" />
                </TableCell>
              </TableRow>
            ))}
          </>
        ) : (
          <>
            {unitStats?.map((unit) => (
              <TableRow key={unit.unit_id} className="hover:bg-muted/50 [&>td]:px-2.5">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                  {unit.unit_name}
                </TableCell>
                <TableCell className="text-center text-xs py-0">{unit.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{unit.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{unit.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{unit.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{unit.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{unit.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{unit.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{unit.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{unit.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-[5px]">{unit.enrollments}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{unit.maConversionRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
}
