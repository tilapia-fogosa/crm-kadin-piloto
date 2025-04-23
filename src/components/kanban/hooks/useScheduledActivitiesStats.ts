
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, addDays } from "date-fns";
import { createSafeDate } from "@/utils/date";

export interface DailyScheduledActivityStats {
  date: string;
  activityCountsByType: Record<string, number>;
}

/**
 * Hook para buscar estatísticas de atividades agendadas por dia
 * 
 * Responsável por: Contar atividades agendadas para cada dia do período
 * Filtro: scheduled_date entre as datas de início e fim do mês selecionado
 */
export function useScheduledActivitiesStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.time('[SCHEDULED ACTIVITIES STATS] Tempo total de execução');
  
  return useQuery<DailyScheduledActivityStats[]>({
    queryKey: ['scheduled-activities-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      if (!selectedMonth || !selectedYear) {
        console.error('[SCHEDULED ACTIVITIES STATS] Mês ou ano não selecionados');
        return [];
      }
      
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[SCHEDULED ACTIVITIES STATS] Valores inválidos:', { selectedMonth, selectedYear });
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
      console.log(`[SCHEDULED ACTIVITIES STATS] Período de consulta: ${format(startDate, 'yyyy-MM-dd')} até ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`[SCHEDULED ACTIVITIES STATS] Período ISO: ${startDateIso} até ${endDateIso}`);

      // Unidades para filtro
      let unitIds: string[] = [];
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[SCHEDULED ACTIVITIES STATS] Nenhuma unidade para filtro');
        return [];
      }
      
      console.time('[SCHEDULED ACTIVITIES STATS] Consulta de atividades agendadas');
      let scheduledActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, scheduled_date, client_id, clients!inner(lead_source)')
        .eq('active', true)
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startDateIso)
        .lt('scheduled_date', endDateIso);

      if (selectedSource !== 'todos') {
        scheduledActivitiesQuery = scheduledActivitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: scheduledActivities, error: scheduledActivitiesError } = await scheduledActivitiesQuery;
      console.timeEnd('[SCHEDULED ACTIVITIES STATS] Consulta de atividades agendadas');
      
      if (scheduledActivitiesError) {
        console.error('[SCHEDULED ACTIVITIES STATS] Erro ao buscar atividades agendadas:', scheduledActivitiesError);
        throw scheduledActivitiesError;
      }
      
      console.log(`[SCHEDULED ACTIVITIES STATS] Atividades agendadas encontradas: ${scheduledActivities?.length || 0}`);
      
      // Log de data mais recente e mais antiga para verificar o range
      if (scheduledActivities && scheduledActivities.length > 0) {
        const dates = scheduledActivities.map(a => new Date(a.scheduled_date)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[SCHEDULED ACTIVITIES STATS] Data mais antiga de agendamento: ${dates[0].toISOString()}`);
        console.log(`[SCHEDULED ACTIVITIES STATS] Data mais recente de agendamento: ${dates[dates.length - 1].toISOString()}`);
      }

      // Agrupar por data (yyyy-MM-dd) e tipo de atividade
      const statsMap: Record<string, Record<string, number>> = {};
      
      scheduledActivities?.forEach(activity => {
        if (!activity.scheduled_date) {
          console.warn('[SCHEDULED ACTIVITIES STATS] Atividade sem data de agendamento:', activity);
          return;
        }
        
        const dateKey = new Date(activity.scheduled_date).toISOString().split('T')[0];
        const tipo = activity.tipo_atividade || 'desconhecido';
        
        // Inicializar para a data se não existir
        statsMap[dateKey] = statsMap[dateKey] || {};
        
        // Incrementar contador para este tipo
        statsMap[dateKey][tipo] = (statsMap[dateKey][tipo] || 0) + 1;
      });
      
      // Converter para array de objetos { date, activityCountsByType }
      const result = Object.entries(statsMap).map(([date, activityCountsByType]) => ({ 
        date, 
        activityCountsByType 
      }));
      
      console.log(`[SCHEDULED ACTIVITIES STATS] Estatísticas processadas por dia: ${result.length} dias`);
      console.timeEnd('[SCHEDULED ACTIVITIES STATS] Tempo total de execução');
      
      return result;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
