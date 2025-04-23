import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/date";

/**
 * Hook para buscar estatísticas de atividades filtradas por mês, ano, origem e unidade
 * Implementa três consultas separadas para maior precisão dos dados:
 * 1. Novos clientes (filtrados por created_at)
 * 2. Atividades criadas no período (filtradas por created_at)
 * 3. Atividades agendadas para o período (filtradas por scheduled_date)
 */
export function useActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.time('[ACTIVITY STATS] Tempo total de execução');
  
  return useQuery({
    queryKey: ['activity-dashboard', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      if (!selectedMonth || !selectedYear) {
        console.error('[ACTIVITY STATS] Mês ou ano não selecionados');
        return [];
      }
      
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[ACTIVITY STATS] Valores inválidos:', { selectedMonth, selectedYear });
        return [];
      }
      
      // Datas para filtro usando DATE()
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      
      console.log(`[ACTIVITY STATS] Intervalo de datas: ${format(startDate, 'dd/MM/yyyy')} até ${format(endDate, 'dd/MM/yyyy')}`);

      // Unidades para filtro
      let unitIds: string[] = [];
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[ACTIVITY STATS] Nenhuma unidade para filtro');
        return [];
      }
      
      console.log(`[ACTIVITY STATS] Unidades para filtro: ${unitIds.join(', ')}`);

      // CONSULTA 1: NOVOS CLIENTES
      console.time('[ACTIVITY STATS] Consulta 1 - Novos clientes');
      let newClientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('DATE(created_at)', startISO.split('T')[0])
        .lte('DATE(created_at)', endISO.split('T')[0]);

      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;
      console.timeEnd('[ACTIVITY STATS] Consulta 1 - Novos clientes');
      
      if (newClientsError) {
        console.error('[ACTIVITY STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }
      
      console.log(`[ACTIVITY STATS] Clientes encontrados: ${newClients?.length || 0}`);

      // CONSULTA 2: ATIVIDADES CRIADAS
      console.time('[ACTIVITY STATS] Consulta 2 - Atividades criadas');
      let createdActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, client_id, clients!inner(lead_source)')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('DATE(created_at)', startISO.split('T')[0])
        .lte('DATE(created_at)', endISO.split('T')[0]);

      if (selectedSource !== 'todos') {
        createdActivitiesQuery = createdActivitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: createdActivities, error: createdActivitiesError } = await createdActivitiesQuery;
      console.timeEnd('[ACTIVITY STATS] Consulta 2 - Atividades criadas');
      
      if (createdActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades criadas:', createdActivitiesError);
        throw createdActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades criadas encontradas: ${createdActivities?.length || 0}`);
      
      // Amostra de dados para depuração
      if (createdActivities && createdActivities.length > 0) {
        console.log('[ACTIVITY STATS] Amostra de atividade criada:', createdActivities[0]);
      }

      // CONSULTA 3: ATIVIDADES AGENDADAS
      console.time('[ACTIVITY STATS] Consulta 3 - Atividades agendadas');
      let scheduledActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, scheduled_date, client_id, clients!inner(lead_source)')
        .eq('active', true)
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitIds)
        .gte('DATE(scheduled_date)', startISO.split('T')[0])
        .lte('DATE(scheduled_date)', endISO.split('T')[0]);

      if (selectedSource !== 'todos') {
        scheduledActivitiesQuery = scheduledActivitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: scheduledActivities, error: scheduledActivitiesError } = await scheduledActivitiesQuery;
      console.timeEnd('[ACTIVITY STATS] Consulta 3 - Atividades agendadas');
      
      if (scheduledActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledActivitiesError);
        throw scheduledActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades agendadas encontradas: ${scheduledActivities?.length || 0}`);
      
      // Amostra de dados para depuração
      if (scheduledActivities && scheduledActivities.length > 0) {
        console.log('[ACTIVITY STATS] Amostra de atividade agendada:', scheduledActivities[0]);
      }

      // Array de todos os dias do mês para processamento
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[ACTIVITY STATS] Processando ${allDates.length} dias no intervalo`);

      // Processamento diário com os três conjuntos de dados separados
      console.time('[ACTIVITY STATS] Processamento de dias');
      const dailyStats: DailyStats[] = allDates.map(date => {
        console.log(`[ACTIVITY STATS] === Processando stats para ${format(date, 'dd/MM/yyyy')} ===`);
        
        const stats = processDailyStats(
          date,
          createdActivities || [],
          newClients || [],
          scheduledActivities || []
        );
        
        console.log(`[ACTIVITY STATS] Stats calculados para dia ${format(date, 'dd/MM/yyyy')}:`, stats);
        return stats;
      });
      console.timeEnd('[ACTIVITY STATS] Processamento de dias');

      console.log(`[ACTIVITY STATS] Processamento completo! ${dailyStats.length} dias processados.`);
      console.timeEnd('[ACTIVITY STATS] Tempo total de execução');
      return dailyStats;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
