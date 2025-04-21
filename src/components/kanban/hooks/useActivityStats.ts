
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/dateUtils";

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
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      console.log('[STATS QUERY] Período calculado:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ano: yearNum,
        mes: monthNum
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

      // Buscar clientes e atividades com filtros otimizados
      let query = supabase
        .from('clients')
        .select('*, client_activities(*)')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (selectedSource !== 'todos') {
        query = query.eq('lead_source', selectedSource);
      }

      const { data: clients, error: clientsError } = await query;

      if (clientsError) {
        console.error('[STATS QUERY] Erro ao buscar clientes:', clientsError);
        throw clientsError;
      }

      // Extrair todas as atividades dos clientes
      const activities = clients?.flatMap(client => 
        client.client_activities?.filter((activity: any) => activity.active) || []
      );

      console.log(`[STATS QUERY] Dados coletados:
        Clientes: ${clients?.length || 0}
        Atividades: ${activities?.length || 0}
        Unidades: ${unitIds.join(', ')}
      `);

      // Gerar array com todas as datas do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[STATS QUERY] Processando ${allDates.length} dias do mês`);
      
      // Processar estatísticas para cada dia
      const dailyStats: DailyStats[] = allDates.map(date => {
        return processDailyStats(date, activities, clients || []);
      });

      console.log(`[STATS QUERY] Processamento concluído. Retornando estatísticas de ${dailyStats.length} dias`);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
