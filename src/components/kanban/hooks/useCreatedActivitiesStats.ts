
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { createSafeDate } from "@/utils/date";

export interface DailyCreatedActivityStats {
  date: string;
  activitiesCountByType: Record<string, number>;
}

/**
 * Hook para buscar estatísticas de atividades criadas por dia
 * 
 * Responsável por: Contar atividades criadas no período, agrupadas por dia e tipo
 * Filtro: created_at entre as datas de início e fim do mês selecionado
 */
export function useCreatedActivitiesStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.time('[CREATED ACTIVITIES STATS] Tempo total de execução');
  
  return useQuery<DailyCreatedActivityStats[]>({
    queryKey: ['created-activities-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      if (!selectedMonth || !selectedYear) {
        console.error('[CREATED ACTIVITIES STATS] Mês ou ano não selecionados');
        return [];
      }
      
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[CREATED ACTIVITIES STATS] Valores inválidos:', { selectedMonth, selectedYear });
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
      console.log(`[CREATED ACTIVITIES STATS] Período de consulta: ${format(startDate, 'yyyy-MM-dd')} até ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`[CREATED ACTIVITIES STATS] Período ISO: ${startDateIso} até ${endDateIso}`);

      // Unidades para filtro
      let unitIds: string[] = [];
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[CREATED ACTIVITIES STATS] Nenhuma unidade para filtro');
        return [];
      }
      
      console.time('[CREATED ACTIVITIES STATS] Consulta de atividades criadas');
      let createdActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, client_id, clients!inner(lead_source)')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startDateIso)
        .lt('created_at', endDateIso);

      if (selectedSource !== 'todos') {
        createdActivitiesQuery = createdActivitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: createdActivities, error: createdActivitiesError } = await createdActivitiesQuery;
      console.timeEnd('[CREATED ACTIVITIES STATS] Consulta de atividades criadas');
      
      if (createdActivitiesError) {
        console.error('[CREATED ACTIVITIES STATS] Erro ao buscar atividades criadas:', createdActivitiesError);
        throw createdActivitiesError;
      }
      
      console.log(`[CREATED ACTIVITIES STATS] Atividades criadas encontradas: ${createdActivities?.length || 0}`);
      
      // Log de data mais recente e mais antiga para verificar o range
      if (createdActivities && createdActivities.length > 0) {
        const dates = createdActivities.map(a => new Date(a.created_at)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[CREATED ACTIVITIES STATS] Data mais antiga de atividade criada: ${dates[0].toISOString()}`);
        console.log(`[CREATED ACTIVITIES STATS] Data mais recente de atividade criada: ${dates[dates.length - 1].toISOString()}`);
      }

      // Agrupar por data (yyyy-MM-dd) e tipo de atividade
      const statsMap: Record<string, Record<string, number>> = {};
      
      createdActivities?.forEach(activity => {
        if (!activity.created_at) {
          console.warn('[CREATED ACTIVITIES STATS] Atividade sem data de criação:', activity);
          return;
        }
        
        const dateKey = new Date(activity.created_at).toISOString().split('T')[0];
        const tipo = activity.tipo_atividade || 'desconhecido';
        
        // Inicializar para a data se não existir
        statsMap[dateKey] = statsMap[dateKey] || {};
        
        // Incrementar contador para este tipo
        statsMap[dateKey][tipo] = (statsMap[dateKey][tipo] || 0) + 1;
      });
      
      // Converter para array de objetos { date, activitiesCountByType }
      const result = Object.entries(statsMap).map(([date, activitiesCountByType]) => ({ 
        date, 
        activitiesCountByType 
      }));
      
      console.log(`[CREATED ACTIVITIES STATS] Estatísticas processadas por dia: ${result.length} dias`);
      console.timeEnd('[CREATED ACTIVITIES STATS] Tempo total de execução');
      
      return result;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
