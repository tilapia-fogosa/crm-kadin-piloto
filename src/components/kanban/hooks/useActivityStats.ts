
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/date";

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
      
      // Datas para filtro usando startOf/endOf month
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      // Adicionamos um dia extra ao final do mês para garantir que capturemos todas as atividades
      const endDate = addDays(endOfMonth(createSafeDate(yearNum, monthNum)), 1);
      
      // Converter para ISO strings para query com informação de timezone
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();
      
      // Log detalhado das datas e parâmetros de consulta
      console.log(`[ACTIVITY STATS] Período de consulta: ${format(startDate, 'yyyy-MM-dd')} até ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`[ACTIVITY STATS] Período ISO: ${startDateIso} até ${endDateIso}`);
      console.log(`[ACTIVITY STATS] Timezone offset local: ${new Date().getTimezoneOffset() / -60}h`);

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
        .gte('created_at', startDateIso)
        .lt('created_at', endDateIso);

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
      
      // Log de data mais recente e mais antiga para verificar o range
      if (newClients && newClients.length > 0) {
        const dates = newClients.map(c => new Date(c.created_at)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[ACTIVITY STATS] Data mais antiga de cliente: ${dates[0].toISOString()}`);
        console.log(`[ACTIVITY STATS] Data mais recente de cliente: ${dates[dates.length - 1].toISOString()}`);
      }

      // CONSULTA 2: ATIVIDADES CRIADAS
      console.time('[ACTIVITY STATS] Consulta 2 - Atividades criadas');
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
      console.timeEnd('[ACTIVITY STATS] Consulta 2 - Atividades criadas');
      
      if (createdActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades criadas:', createdActivitiesError);
        throw createdActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades criadas encontradas: ${createdActivities?.length || 0}`);
      
      // Log de data mais recente e mais antiga para verificar o range
      if (createdActivities && createdActivities.length > 0) {
        const dates = createdActivities.map(a => new Date(a.created_at)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[ACTIVITY STATS] Data mais antiga de atividade criada: ${dates[0].toISOString()}`);
        console.log(`[ACTIVITY STATS] Data mais recente de atividade criada: ${dates[dates.length - 1].toISOString()}`);
      }

      // CONSULTA 3: ATIVIDADES AGENDADAS
      console.time('[ACTIVITY STATS] Consulta 3 - Atividades agendadas');
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
      console.timeEnd('[ACTIVITY STATS] Consulta 3 - Atividades agendadas');
      
      if (scheduledActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledActivitiesError);
        throw scheduledActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades agendadas encontradas: ${scheduledActivities?.length || 0}`);
      
      // Log de data mais recente e mais antiga para verificar o range
      if (scheduledActivities && scheduledActivities.length > 0) {
        const dates = scheduledActivities.map(a => new Date(a.scheduled_date)).sort((a, b) => a.getTime() - b.getTime());
        console.log(`[ACTIVITY STATS] Data mais antiga de agendamento: ${dates[0].toISOString()}`);
        console.log(`[ACTIVITY STATS] Data mais recente de agendamento: ${dates[dates.length - 1].toISOString()}`);
      }

      // Processamento diário
      console.time('[ACTIVITY STATS] Processamento de dias');
      const allDates = eachDayOfInterval({ start: startDate, end: endOfMonth(startDate) });
      console.log(`[ACTIVITY STATS] Processando ${allDates.length} dias no intervalo`);

      const dailyStats: DailyStats[] = allDates.map(date => {
        console.log(`[ACTIVITY STATS] === Processando stats para ${format(date, 'dd/MM/yyyy')} ===`);
        
        return processDailyStats(
          date,
          createdActivities || [],
          newClients || [],
          scheduledActivities || []
        );
      });

      console.log(`[ACTIVITY STATS] Processamento completo! ${dailyStats.length} dias processados.`);
      console.timeEnd('[ACTIVITY STATS] Tempo total de execução');
      
      return dailyStats;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
