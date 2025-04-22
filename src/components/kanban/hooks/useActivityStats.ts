
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
      
      // Datas para filtro
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

      // ===================================================
      // CONSULTA 1: NOVOS CLIENTES (filtro por created_at)
      // ===================================================
      console.log(`[ACTIVITY STATS] Executando consulta 1: Novos clientes no período`);
      
      let newClientsQuery = supabase.from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
        console.log(`[ACTIVITY STATS] Aplicando filtro de origem: ${selectedSource}`);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;
      
      if (newClientsError) {
        console.error('[ACTIVITY STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }
      
      console.log(`[ACTIVITY STATS] Clientes encontrados: ${newClients?.length || 0}`);
      
      // Array de client_ids para filtrar atividades por cliente (se tiver filtro de origem)
      let clientIds: string[] = [];
      if (selectedSource !== 'todos' && newClients) {
        clientIds = newClients.map((client: any) => client.id);
        console.log(`[ACTIVITY STATS] IDs de clientes para filtro: ${clientIds.length}`);
      }

      // ===================================================
      // CONSULTA 2: ATIVIDADES CRIADAS (filtro por created_at)
      // ===================================================
      console.log(`[ACTIVITY STATS] Executando consulta 2: Atividades criadas no período`);
      
      let createdActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, created_at, client_id')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos' && clientIds.length > 0) {
        createdActivitiesQuery = createdActivitiesQuery.in('client_id', clientIds);
        console.log(`[ACTIVITY STATS] Aplicando filtro de clientes para atividades criadas`);
      }
      
      const { data: createdActivities, error: createdActivitiesError } = await createdActivitiesQuery;
      
      if (createdActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades criadas:', createdActivitiesError);
        throw createdActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades criadas encontradas: ${createdActivities?.length || 0}`);

      // ===================================================
      // CONSULTA 3: ATIVIDADES AGENDADAS (filtro por scheduled_date)
      // ===================================================
      console.log(`[ACTIVITY STATS] Executando consulta 3: Atividades agendadas para o período`);
      
      let scheduledActivitiesQuery = supabase.from('client_activities')
        .select('id, tipo_atividade, scheduled_date, client_id')
        .eq('active', true)
        .not('scheduled_date', 'is', null)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);

      if (selectedSource !== 'todos' && clientIds.length > 0) {
        scheduledActivitiesQuery = scheduledActivitiesQuery.in('client_id', clientIds);
        console.log(`[ACTIVITY STATS] Aplicando filtro de clientes para atividades agendadas`);
      }
      
      const { data: scheduledActivities, error: scheduledActivitiesError } = await scheduledActivitiesQuery;
      
      if (scheduledActivitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledActivitiesError);
        throw scheduledActivitiesError;
      }
      
      console.log(`[ACTIVITY STATS] Atividades agendadas encontradas: ${scheduledActivities?.length || 0}`);

      // Array de todos os dias do mês para processamento
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[ACTIVITY STATS] Processando ${allDates.length} dias no intervalo`);

      // Processamento diário com os três conjuntos de dados separados
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

      console.log(`[ACTIVITY STATS] Processamento completo! ${dailyStats.length} dias processados.`);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
