
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
      console.log('[ACTIVITY STATS] Iniciando busca com:', {selectedMonth, selectedYear, selectedSource, selectedUnitId});
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
      // SQL de clientes (garantir sempre data >= início <= fim)
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
      console.log('[ACTIVITY STATS] Clientes carregados:', newClients?.length);

      // IDs para filtrar atividades (apenas se fonte não for todos)
      let clientIds: string[] = [];
      if (selectedSource !== 'todos' && newClients) {
        clientIds = newClients.map((client: any) => client.id);
        if (clientIds.length === 0) {
          console.log('[ACTIVITY STATS] Nenhum cliente para fonte');
          return [];
        }
      }
      // Atividades do período
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
      console.log('[ACTIVITY STATS] Atividades carregadas:', activities?.length);

      // Agendadas "aguardadas" do período (scheduled_date)
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
      console.log('[ACTIVITY STATS] Agendadas carregadas:', scheduledVisits?.length);

      // Array de todos os dias do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log('[ACTIVITY STATS] Dias do mês:', allDates.length);

      // Processar por dia e logar detalhadamente
      const dailyStats: DailyStats[] = allDates.map(date => {
        const stats = processDailyStats(
          date,
          activities || [],
          newClients || [],
          scheduledVisits || []
        );
        console.log(`[ACTIVITY STATS] Stats processado para dia ${format(date, 'dd/MM/yyyy')}:`, stats);
        return stats;
      });

      console.log('[ACTIVITY STATS] Processamento completo! Dias processados:', dailyStats.length);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
