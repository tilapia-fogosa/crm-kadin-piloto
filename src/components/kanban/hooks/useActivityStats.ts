
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, addDays } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/dateUtils";

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
      // Importante: O mês em JavaScript é 0-indexed (0-11, 0 = Janeiro)
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      console.log('[STATS QUERY] Período calculado:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ano: yearNum,
        mes: monthNum,
        diaInicio: startDate.getDate(),
        diaFim: endDate.getDate(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
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
      
      // Buscar atividades no período
      const { data: activities, error: activitiesError } = await supabase
        .from('client_activities')
        .select(`
          *,
          clients(*)
        `)
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (activitiesError) {
        console.error('[STATS QUERY] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      console.log(`[STATS QUERY] Encontradas ${activities?.length || 0} atividades no período`);
      
      // Detalhamento por unidade para debug
      const activityByUnit = activities.reduce((acc: Record<string, number>, activity) => {
        acc[activity.unit_id] = (acc[activity.unit_id] || 0) + 1;
        return acc;
      }, {});
      console.log('[STATS QUERY] Distribuição de atividades por unidade:', activityByUnit);
      
      // Detalhamento por tipo de atividade para debug
      const activityByType = activities.reduce((acc: Record<string, number>, activity) => {
        acc[activity.tipo_atividade] = (acc[activity.tipo_atividade] || 0) + 1;
        return acc;
      }, {});
      console.log('[STATS QUERY] Distribuição de atividades por tipo:', activityByType);
      
      // Filtrar atividades de clientes ativos e origem selecionada
      const filteredActivities = activities.filter(activity => {
        // Verificar se o cliente existe e está ativo
        if (!activity.clients) return selectedSource === 'todos'; // Se não tem cliente, inclui apenas se buscando todas origens
        
        // Verificar se a origem do cliente corresponde à selecionada (se não for 'todos')
        return selectedSource === 'todos' || activity.clients.lead_source === selectedSource;
      });
      
      console.log(`[STATS QUERY] Após filtro, ${filteredActivities.length} atividades serão processadas`);

      // Gerar array com todas as datas do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[STATS QUERY] Processando ${allDates.length} dias do mês`);
      
      // Processar estatísticas para cada dia
      const dailyStats: DailyStats[] = allDates.map(date => {
        // Log para rastreamento de processamento
        console.log(`[STATS QUERY] Processando estatísticas para ${format(date, 'dd/MM/yyyy')} (${date.toISOString()})`);
        
        // Calcular estatísticas do dia
        return processDailyStats(date, filteredActivities, clients || []);
      });

      console.log(`[STATS QUERY] Processamento concluído. Retornando estatísticas de ${dailyStats.length} dias`);
      
      // Verificar se há dias com matriculas
      const enrollmentDays = dailyStats.filter(day => day.enrollments > 0);
      if (enrollmentDays.length > 0) {
        console.log('[STATS QUERY] Dias com matrículas:', enrollmentDays.map(day => ({ 
          date: format(day.date, 'dd/MM/yyyy'), 
          enrollments: day.enrollments 
        })));
      }
      
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
