import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/date";

/**
 * Hook para buscar estatísticas de atividades filtradas por mês, ano, origem e unidade
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
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

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

      // FETCH de dados com logs detalhados em cada etapa

      // --- NOVOS CLIENTES
      let newClientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;
      if (newClientsError) throw newClientsError;
      console.log(`[ACTIVITY STATS] Clientes carregados: ${newClients?.length}`);
      if (newClients) {
        newClients.forEach(c => console.log(`[CLIENT] ${c.id} criado em ${c.created_at}`));
      }

      // --- ATIVIDADES
      let clientIds: string[] = [];
      if (selectedSource !== 'todos' && newClients) {
        clientIds = newClients.map((client: any) => client.id);
        if (clientIds.length === 0) {
          console.log('[ACTIVITY STATS] Nenhum cliente para fonte');
          return [];
        }
      }
      let activitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, scheduled_date, client_id')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos' && clientIds.length > 0) {
        activitiesQuery = activitiesQuery.in('client_id', clientIds);
      }
      const { data: activities, error: activitiesError } = await activitiesQuery;
      if (activitiesError) throw activitiesError;
      console.log(`[ACTIVITY STATS] Atividades carregadas: ${activities?.length}`);
      if (activities) {
        activities.forEach(a => console.log(`[ACTIVITY] ${a.id}, ${a.tipo_atividade}, criado em ${a.created_at}, client ${a.client_id}`));
      }

      // --- AGENDADAS (aguardadas)
      let scheduledVisitsQuery = supabase.from('client_activities')
        .select('id, client_id, scheduled_date')
        .eq('active', true)
        .eq('tipo_atividade', 'Agendamento')
        .in('unit_id', unitIds)
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);

      if (selectedSource !== 'todos' && clientIds.length > 0) {
        scheduledVisitsQuery = scheduledVisitsQuery.in('client_id', clientIds);
      }
      const { data: scheduledVisits, error: scheduledError } = await scheduledVisitsQuery;
      if (scheduledError) throw scheduledError;
      console.log(`[ACTIVITY STATS] Agendadas carregadas: ${scheduledVisits?.length}`);
      if (scheduledVisits) {
        scheduledVisits.forEach(sv => console.log(`[SCHEDULED] id: ${sv.id} client: ${sv.client_id} data: ${sv.scheduled_date}`));
      }

      // Array de todos os dias do mês (inclusive após 15)
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[ACTIVITY STATS] Dias do mês gerados (${allDates.length}):`, allDates.map(d => d.toISOString().split('T')[0]).join(', '));

      // Processamento detalhado com log por dia
      const dailyStats: DailyStats[] = allDates.map(date => {
        console.log(`[ACTIVITY STATS] === Processando stats para ${date.toISOString().split('T')[0]} ===`);
        const stats = processDailyStats(
          date,
          activities || [],
          newClients || [],
          scheduledVisits || []
        );
        // Loga estatísticas por dia
        console.log(`[ACTIVITY STATS] Stats calculados para dia ${date.toISOString().split('T')[0]}:`, stats);
        return stats;
      });

      console.log(`[ACTIVITY STATS] Processamento completo! Dias processados: ${dailyStats.length}`);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
