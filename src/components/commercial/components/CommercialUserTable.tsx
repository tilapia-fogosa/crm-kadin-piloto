
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserStats } from "../hooks/useCommercialUserStats";
import { TotalStats } from "../../kanban/types/activity-dashboard.types";

interface CommercialUserTableProps {
  stats: UserStats[] | undefined;
  totals: TotalStats | null;
  isLoading: boolean;
}

export function CommercialUserTable({ stats, totals, isLoading }: CommercialUserTableProps) {
  console.log('Renderizando tabela de indicadores comerciais por usuário:', { stats, totals });
  
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent [&>th]:px-2.5">
          <TableHead className="text-center bg-[#FEC6A1] text-xs font-semibold w-[18px]">Usuário</TableHead>
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
            {stats?.map(user => (
              <TableRow key={user.user_id} className="hover:bg-muted/50 [&>td]:px-2.5">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                  {user.user_name}
                </TableCell>
                <TableCell className="text-center text-xs py-0">{user.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{user.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{user.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{user.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{user.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{user.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{user.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{user.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{user.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-[5px]">{user.enrollments}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{user.maConversionRate.toFixed(1)}%</TableCell>
              </TableRow>
            ))}
            
            {/* Linha de totais */}
            {totals && (
              <TableRow className="hover:bg-muted/50 [&>td]:px-2.5 font-semibold">
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">
                  TOTAL
                </TableCell>
                <TableCell className="text-center text-xs py-0">{totals.newClients}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.contactAttempts}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.effectiveContacts}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.ceConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.scheduledVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.agConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.awaitingVisits}</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.completedVisits}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.atConversionRate.toFixed(1)}%</TableCell>
                <TableCell className="text-center text-xs py-0">{totals.enrollments}</TableCell>
                <TableCell className="text-center bg-[#FEC6A1] text-xs py-0">{totals.maConversionRate.toFixed(1)}%</TableCell>
              </TableRow>
            )}
            
            {stats?.length === 0 && (
              <TableRow>
                <TableCell colSpan={12} className="text-center text-xs py-3 px-2.5">Nenhum dado encontrado</TableCell>
              </TableRow>
            )}
          </>
        )}
      </TableBody>
    </Table>
  );
}
