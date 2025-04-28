
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

  const toggleGroup = (registrationName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(registrationName)) {
      newExpanded.delete(registrationName);
    } else {
      newExpanded.add(registrationName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSort = (field: keyof RegistrationSourceStats) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStats = sortedStats.slice(startIndex, endIndex);
  const totalPages = Math.ceil(stats.length / itemsPerPage);

  // Render a row for stats
  const renderStatsRow = (stats: BaseStats, isSubRow = false, leadSource = '') => (
    <>
      <TableCell className={`text-[11px] py-2 ${isSubRow ? 'pl-8' : ''}`}>
        {leadSource || ''}
      </TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.newClients}</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.contactAttempts}</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.effectiveContacts}</TableCell>
      <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2">{stats.ceConversionRate.toFixed(1)}%</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.scheduledVisits}</TableCell>
      <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2">{stats.agConversionRate.toFixed(1)}%</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.awaitingVisits}</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.completedVisits}</TableCell>
      <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2">{stats.atConversionRate.toFixed(1)}%</TableCell>
      <TableCell className="text-center text-[11px] py-2">{stats.enrollments}</TableCell>
      <TableCell className="text-center bg-[#FEC6A1] text-[11px] py-2">{stats.maConversionRate.toFixed(1)}%</TableCell>
    </>
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="cursor-pointer bg-[#FEC6A1] text-[11px] font-semibold">
              Cadastrante / Origem
            </TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Novos Clientes</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Total de Contatos</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Contatos Efetivos</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold">% CE</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Visitas Agendadas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold">% AG</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Visitas Aguardadas</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Visitas Realizadas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold">% AT</TableHead>
            <TableHead className="text-center text-[11px] font-semibold">Matrículas</TableHead>
            <TableHead className="text-center bg-[#FEC6A1] text-[11px] font-semibold">% MA</TableHead>
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
                  {renderStatsRow(group.totals)}
                </TableRow>
                {expandedGroups.has(group.registrationName) && group.sources.map(source => (
                  <TableRow key={`${group.registrationName}-${source.leadSource}`} className="hover:bg-muted/50">
                    {renderStatsRow(source, true, source.leadSource)}
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
