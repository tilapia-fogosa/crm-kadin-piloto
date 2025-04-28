
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BaseStats } from "../types/stats.types";
import { RegistrationGroup, RegistrationSourceStats, TableSortConfig } from "../types/registration-stats.types";
import { Button } from "@/components/ui/button";

interface CommercialTableByRegistrationProps {
  stats: RegistrationGroup[];
  isLoading: boolean;
}

export function CommercialTableByRegistration({ stats, isLoading }: CommercialTableByRegistrationProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<TableSortConfig>({
    field: 'registrationName',
    direction: 'asc'
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 200;

  console.log("Rendering CommercialTableByRegistration", { stats, isLoading });

  // Função para alternar a expansão/colapso de um grupo
  const toggleGroup = (registrationName: string) => {
    console.log("Alternando grupo:", registrationName);
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(registrationName)) {
      newExpanded.delete(registrationName);
    } else {
      newExpanded.add(registrationName);
    }
    setExpandedGroups(newExpanded);
  };

  // Função para ordenar a tabela
  const handleSort = (field: keyof RegistrationSourceStats) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Ordenação dos dados
  const sortedStats = [...stats].sort((a, b) => {
    const aValue = sortConfig.field === 'registrationName' 
      ? a.registrationName 
      : a.totals[sortConfig.field as keyof BaseStats];
    const bValue = sortConfig.field === 'registrationName' 
      ? b.registrationName 
      : b.totals[sortConfig.field as keyof BaseStats];
    
    return sortConfig.direction === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

  // Paginação
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStats = sortedStats.slice(startIndex, endIndex);
  const totalPages = Math.ceil(stats.length / itemsPerPage);

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="cursor-pointer bg-[#FEC6A1] text-[11px] font-semibold w-48">
              Cadastrante / Origem
            </TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-24">Novos Clientes</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-28">Total de Contatos</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-28">Contatos Efetivos</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold w-16">% CE</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-24">Visitas Agendadas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold w-16">% AG</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-24">Visitas Aguardadas</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-24">Visitas Realizadas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold w-16">% AT</TableHead>
            <TableHead className="text-center text-[11px] font-semibold w-24">Matrículas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold w-16">% MA</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center py-4">
                Carregando...
              </TableCell>
            </TableRow>
          ) : (
            paginatedStats.map(group => (
              <>
                {/* Linha do grupo principal */}
                <TableRow key={group.registrationName} className="hover:bg-muted/50">
                  <TableCell 
                    className="bg-[#FEC6A1] cursor-pointer py-2"
                    onClick={() => toggleGroup(group.registrationName)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedGroups.has(group.registrationName) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                      <span className="font-semibold text-[11px]">{group.registrationName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-24">{group.totals.newClients}</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-28">{group.totals.contactAttempts}</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-28">{group.totals.effectiveContacts}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{group.totals.ceConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-24">{group.totals.scheduledVisits}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{group.totals.agConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-24">{group.totals.awaitingVisits}</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-24">{group.totals.completedVisits}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{group.totals.atConversionRate.toFixed(1)}%</TableCell>
                  <TableCell className="text-center text-[11px] py-2 w-24">{group.totals.enrollments}</TableCell>
                  <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{group.totals.maConversionRate.toFixed(1)}%</TableCell>
                </TableRow>

                {/* Linhas dos subgrupos (origens dentro do cadastrante) */}
                {expandedGroups.has(group.registrationName) && group.sources.map(source => (
                  <TableRow key={`${group.registrationName}-${source.leadSource}`} className="hover:bg-muted/50">
                    <TableCell className="text-[11px] py-2 pl-8 w-48">{source.leadSource}</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-24">{source.newClients}</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-28">{source.contactAttempts}</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-28">{source.effectiveContacts}</TableCell>
                    <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{source.ceConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-24">{source.scheduledVisits}</TableCell>
                    <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{source.agConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-24">{source.awaitingVisits}</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-24">{source.completedVisits}</TableCell>
                    <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{source.atConversionRate.toFixed(1)}%</TableCell>
                    <TableCell className="text-center text-[11px] py-2 w-24">{source.enrollments}</TableCell>
                    <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2 w-16">{source.maConversionRate.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="py-2">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
