
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/date";

/**
 * Hook para buscar estatísticas de atividades filtradas por mês, ano, origem e unidade
 * O processamento é feito dia a dia para garantir precisão nas métricas
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
      // 1. Validação inicial dos parâmetros
      if (!selectedMonth || !selectedYear) {
        console.error('[ACTIVITY STATS] Mês ou ano não selecionados');
        return [];
      }

      console.log('[ACTIVITY STATS] Iniciando busca com parâmetros:', {
        selectedMonth,
        selectedYear,
        selectedSource,
        selectedUnitId,
        userUnits: userUnits?.map(u => ({ id: u.unit_id, name: u.units.name }))
      });

      // 2. Converter parâmetros e calcular período
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);

      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[ACTIVITY STATS] Valores inválidos para mês ou ano:', { selectedMonth, selectedYear });
        return [];
      }

      // 3. Calcular datas de início e fim do mês, formatando para SQL
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      console.log('[ACTIVITY STATS] Período calculado para consulta:', {
        início: format(startDate, 'dd/MM/yyyy'),
        fim: format(endDate, 'dd/MM/yyyy'),
        startISO,
        endISO
      });

      // 4. Determinar IDs das unidades para filtro
      let unitIds: string[] = [];

      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }

      if (unitIds.length === 0) {
        console.error('[ACTIVITY STATS] Nenhuma unidade disponível para filtro');
        return [];
      }

      // 5. CONSULTA 1: Buscar novos clientes do período
      // Aplicando filtro diretamente na query SQL para melhor desempenho
      let newClientsQuery = supabase
        .from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      // Aplicar filtro de origem se especificado
      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;

      if (newClientsError) {
        console.error('[ACTIVITY STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }

      console.log(`[ACTIVITY STATS] Total de ${newClients?.length || 0} novos clientes encontrados no período`);

      // 6. Preparar ID dos clientes filtrados por origem (se necessário)
      // Para uso nas consultas subsequentes quando há filtro de origem
      let clientIds: string[] = [];
      if (selectedSource !== 'todos' && newClients) {
        clientIds = newClients.map(client => client.id);
        console.log(`[ACTIVITY STATS] Filtrando por ${clientIds.length} clientes da origem: ${selectedSource}`);
        
        // Se não houver clientes com a origem selecionada, já retornamos dados vazios
        if (clientIds.length === 0) {
          console.log('[ACTIVITY STATS] Nenhum cliente encontrado com a origem selecionada');
          return [];
        }
      }

      // 7. CONSULTA 2: Buscar atividades do período
      let activitiesQuery = supabase
        .from('client_activities')
        .select('id, tipo_atividade, created_at, scheduled_date, client_id')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      // Aplicar filtro de cliente se tiver filtro de origem
      if (selectedSource !== 'todos' && clientIds.length > 0) {
        activitiesQuery = activitiesQuery.in('client_id', clientIds);
      }

      const { data: activities, error: activitiesError } = await activitiesQuery;

      if (activitiesError) {
        console.error('[ACTIVITY STATS] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }

      console.log(`[ACTIVITY STATS] Total de ${activities?.length || 0} atividades encontradas no período`);

      // 8. CONSULTA 3: Buscar agendamentos (visitas aguardadas) do período
      let scheduledVisitsQuery = supabase
        .from('client_activities')
        .select('id, client_id, scheduled_date')
        .eq('active', true)
        .eq('tipo_atividade', 'Agendamento')
        .in('unit_id', unitIds)
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);

      // Aplicar filtro de cliente se tiver filtro de origem
      if (selectedSource !== 'todos' && clientIds.length > 0) {
        scheduledVisitsQuery = scheduledVisitsQuery.in('client_id', clientIds);
      }

      const { data: scheduledVisits, error: scheduledError } = await scheduledVisitsQuery;

      if (scheduledError) {
        console.error('[ACTIVITY STATS] Erro ao buscar visitas agendadas:', scheduledError);
        throw scheduledError;
      }

      console.log(`[ACTIVITY STATS] Total de ${scheduledVisits?.length || 0} visitas agendadas encontradas no período`);

      // 9. Processar estatísticas por dia
      // Geramos um array com todos os dias do mês para garantir que todos sejam representados
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[ACTIVITY STATS] Processando estatísticas para ${allDates.length} dias do mês`);

      // 10. Mapear cada dia e processar estatísticas
      const dailyStats: DailyStats[] = allDates.map(date => {
        return processDailyStats(
          date,
          activities || [],
          newClients || [],
          scheduledVisits || []
        );
      });

      console.log('[ACTIVITY STATS] Processamento concluído com sucesso');
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
