
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, addDays } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";

/**
 * Hook para buscar e processar estatísticas de atividades
 */
export function useActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string
) {
  return useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      // Validação de entrada
      if (!selectedMonth || !selectedYear) {
        console.error('[STATS QUERY] Mês ou ano não selecionados');
        return [];
      }
      
      // Log inicial para debug
      console.log('[STATS QUERY] Iniciando busca com parâmetros:', {
        selectedMonth,
        selectedYear,
        selectedSource,
        selectedUnitId,
        userUnits: userUnits?.map(u => ({ id: u.unit_id, name: u.units.name }))
      });

      // Conversão segura de strings para números
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[STATS QUERY] Valores inválidos para mês ou ano:', { selectedMonth, selectedYear });
        return [];
      }
      
      // Criação de datas de início e fim do mês
      const startDate = startOfMonth(new Date(yearNum, monthNum));
      const endDate = endOfMonth(new Date(yearNum, monthNum));
      
      console.log('[STATS QUERY] Período calculado:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      // Determinar IDs das unidades para filtro
      let unitIds: string[] = [];
      
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
        console.log('[STATS QUERY] Buscando para todas as unidades:', unitIds);
      } else {
        unitIds = [selectedUnitId];
        console.log('[STATS QUERY] Buscando para unidade específica:', selectedUnitId);
      }
      
      if (unitIds.length === 0) {
        console.error('[STATS QUERY] Nenhuma unidade disponível para filtro');
        return [];
      }

      // Buscar clientes no período
      const clientsQuery = supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      // Aplicar filtro de origem se necessário
      if (selectedSource !== 'todos') {
        clientsQuery.eq('lead_source', selectedSource);
      }
      
      const { data: clients, error: clientsError } = await clientsQuery;

      if (clientsError) {
        console.error('[STATS QUERY] Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }
      
      console.log(`[STATS QUERY] Encontrados ${clients?.length || 0} clientes no período`);
      
      // Buscar atividades no período com join para clientes
      const activitiesQuery = supabase
        .from('client_activities')
        .select(`
          *,
          clients!inner(*)
        `)
        .eq('active', true)
        .eq('clients.active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      // Aplicar filtro de origem se necessário
      if (selectedSource !== 'todos') {
        activitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: activities, error: activitiesError } = await activitiesQuery;

      if (activitiesError) {
        console.error('[STATS QUERY] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      console.log(`[STATS QUERY] Encontradas ${activities?.length || 0} atividades no período`);

      // Gerar array com todas as datas do mês
      const dailyStats: DailyStats[] = [];
      let currentDate = new Date(startDate);
      
      // Validação extra para evitar loops infinitos
      const maxDays = 31;
      let dayCount = 0;
      
      while (currentDate <= endDate && dayCount < maxDays) {
        const dateClone = new Date(currentDate);
        const dayStats = processDailyStats(
          dateClone, 
          activities || [], 
          clients || []
        );
        
        dailyStats.push(dayStats);
        currentDate = addDays(currentDate, 1);
        dayCount++;
      }

      console.log(`[STATS QUERY] Processadas estatísticas para ${dailyStats.length} dias`);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
