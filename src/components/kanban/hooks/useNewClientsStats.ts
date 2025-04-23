
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { createSafeDate } from "@/utils/date";

export interface DailyNewClientStats {
  date: string;
  totalNewClients: number;
}

/**
 * Hook para buscar estatísticas de novos clientes por dia
 * 
 * Responsável por: Contar novos clientes cadastrados no período, agrupados por dia
 * Filtro: created_at entre as datas de início e fim do mês selecionado
 */
export function useNewClientsStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.time('[NEW CLIENTS STATS] Tempo total de execução');
  
  return useQuery<DailyNewClientStats[]>({
    queryKey: ['new-clients-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      if (!selectedMonth || !selectedYear) {
        console.error('[NEW CLIENTS STATS] Mês ou ano não selecionados');
        return [];
      }
      
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[NEW CLIENTS STATS] Valores inválidos:', { selectedMonth, selectedYear });
        return [];
      }
      
      // Datas para filtro usando startOf/endOf month
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      // Adicionamos um dia extra ao final do mês para garantir que capturemos todas as atividades
      const endDate = addDays(endOfMonth(createSafeDate(yearNum, monthNum)), 1);
      
      // Converter para ISO strings para query com informação de timezone
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();
      
      // Log detalhado das datas e parâmetros de consulta
      console.log(`[NEW CLIENTS STATS] Período de consulta: ${format(startDate, 'yyyy-MM-dd')} até ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`[NEW CLIENTS STATS] Período ISO: ${startDateIso} até ${endDateIso}`);

      // Unidades para filtro
      let unitIds: string[] = [];
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[NEW CLIENTS STATS] Nenhuma unidade para filtro');
        return [];
      }
      
      console.time('[NEW CLIENTS STATS] Consulta de novos clientes');
      let newClientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDateIso)
        .lt('created_at', endDateIso);

      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;
      console.timeEnd('[NEW CLIENTS STATS] Consulta de novos clientes');
      
      if (newClientsError) {
        console.error('[NEW CLIENTS STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }
      
      console.log(`[NEW CLIENTS STATS] Total de clientes encontrados: ${newClients?.length || 0}`);
      
      // Log de data mais recente e mais antiga para verificar o range
      if (newClients && newClients.length > 0) {
        const dates = newClients.map(c => new Date(c.created_at)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[NEW CLIENTS STATS] Data mais antiga de cliente: ${dates[0].toISOString()}`);
        console.log(`[NEW CLIENTS STATS] Data mais recente de cliente: ${dates[dates.length - 1].toISOString()}`);
      }

      // Agrupar por data (yyyy-MM-dd)
      const statsMap: Record<string, number> = {};
      
      newClients?.forEach(client => {
        if (!client.created_at) {
          console.warn('[NEW CLIENTS STATS] Cliente sem data de criação:', client);
          return;
        }
        
        const dateKey = new Date(client.created_at).toISOString().split('T')[0];
        statsMap[dateKey] = (statsMap[dateKey] || 0) + 1;
      });
      
      // Converter para array de objetos { date, totalNewClients }
      const result = Object.entries(statsMap).map(([date, totalNewClients]) => ({ 
        date, 
        totalNewClients 
      }));
      
      console.log(`[NEW CLIENTS STATS] Estatísticas processadas por dia: ${result.length} dias`);
      console.timeEnd('[NEW CLIENTS STATS] Tempo total de execução');
      
      return result;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
