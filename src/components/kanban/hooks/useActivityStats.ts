
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { DailyStats } from "../types/activity-dashboard.types";
import { processDailyStats } from "../utils/activity/activityStatsProcessor";
import { createSafeDate } from "@/utils/date";

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
        console.error('[STATS QUERY] Mês ou ano não selecionados');
        return [];
      }

      console.log('[STATS QUERY] Iniciando busca com parâmetros:', {
        selectedMonth,
        selectedYear,
        selectedSource,
        selectedUnitId,
        userUnits: userUnits?.map(u => ({ id: u.unit_id, name: u.units.name }))
      });

      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);

      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[STATS QUERY] Valores inválidos para mês ou ano:', { selectedMonth, selectedYear });
        return [];
      }

      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();

      console.log('[STATS QUERY] Período calculado para consulta:', {
        início: format(startDate, 'dd/MM/yyyy'),
        fim: format(endDate, 'dd/MM/yyyy'),
        startISO,
        endISO
      });

      // Determinar IDs das unidades para filtro
      let unitIds: string[] = [];

      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }

      if (unitIds.length === 0) {
        console.error('[STATS QUERY] Nenhuma unidade disponível para filtro');
        return [];
      }

      // 1. Buscar novos clientes do período com filtro na query
      let newClientsQuery = supabase
        .from('clients')
        .select('id, created_at')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos') {
        newClientsQuery = newClientsQuery.eq('lead_source', selectedSource);
      }

      const { data: newClients, error: newClientsError } = await newClientsQuery;

      if (newClientsError) {
        console.error('[STATS QUERY] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }

      // 2. Buscar atividades do período com filtro na query
      let activitiesQuery = supabase
        .from('client_activities')
        .select('id, tipo_atividade, created_at, scheduled_date, client_id')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      // >>>> CORREÇÃO AQUI <<<<
      if (selectedSource !== 'todos' && newClients && Array.isArray(newClients)) {
        // Extrai somente os IDs dos clientes filtrados
        const allowedClientIds = newClients.map(client => client.id).filter(Boolean);
        console.log("[STATS QUERY] Filtrando atividades dos clientes das origens selecionadas. Total de IDs:", allowedClientIds.length);

        // Aplica filtro se houver clientes válidos, senão retorna vazio
        if (allowedClientIds.length > 0) {
          activitiesQuery = activitiesQuery.in('client_id', allowedClientIds);
        } else {
          // Não há clientes, portanto, não há atividades
          console.warn("[STATS QUERY] Nenhum cliente da origem selecionada, retornando lista vazia de atividades.");
          return [];
        }
      }

      const { data: activities, error: activitiesError } = await activitiesQuery;

      if (activitiesError) {
        console.error('[STATS QUERY] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }

      // 3. Buscar visitas aguardadas do período com filtro na query
      let scheduledVisitsQuery = supabase
        .from('client_activities')
        .select('id, client_id, scheduled_date')
        .eq('active', true)
        .eq('tipo_atividade', 'Agendamento')
        .in('unit_id', unitIds)
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);

      // >>>> CORREÇÃO AQUI <<<<
      if (selectedSource !== 'todos' && newClients && Array.isArray(newClients)) {
        const allowedClientIds = newClients.map(client => client.id).filter(Boolean);
        console.log("[STATS QUERY] Filtrando agendamentos dos clientes das origens selecionadas. Total de IDs:", allowedClientIds.length);

        if (allowedClientIds.length > 0) {
          scheduledVisitsQuery = scheduledVisitsQuery.in('client_id', allowedClientIds);
        } else {
          // Não há clientes, portanto, não há visitas agendadas
          console.warn("[STATS QUERY] Nenhum cliente da origem selecionada, retornando lista vazia de agendamentos.");
          return [];
        }
      }

      const { data: scheduledVisits, error: scheduledError } = await scheduledVisitsQuery;

      if (scheduledError) {
        console.error('[STATS QUERY] Erro ao buscar visitas agendadas:', scheduledError);
        throw scheduledError;
      }

      console.log(`[STATS QUERY] Dados coletados do banco:
        Novos Clientes: ${newClients?.length || 0}
        Atividades: ${activities?.length || 0}
        Visitas Aguardadas: ${scheduledVisits?.length || 0}
      `);

      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[STATS QUERY] Processando ${allDates.length} dias do mês`);

      const dailyStats: DailyStats[] = allDates.map(date => {
        return processDailyStats(date, activities || [], newClients || [], scheduledVisits || []);
      });

      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
