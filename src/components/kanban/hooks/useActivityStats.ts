
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
      
      // Criação de datas de início e fim do mês usando a função segura
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      // Gerar strings ISO para query SQL
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
        .select('id, tipo_atividade, created_at, scheduled_date')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos') {
        // Subconsulta para filtrar apenas atividades de clientes com a fonte desejada
        activitiesQuery = activitiesQuery.in('client_id', 
          supabase
            .from('clients')
            .select('id')
            .eq('active', true)
            .eq('lead_source', selectedSource)
        );
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

      if (selectedSource !== 'todos') {
        // Subconsulta para filtrar apenas agendamentos de clientes com a fonte desejada
        scheduledVisitsQuery = scheduledVisitsQuery.in('client_id', 
          supabase
            .from('clients')
            .select('id')
            .eq('active', true)
            .eq('lead_source', selectedSource)
        );
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
      
      // Gerar array com todas as datas do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[STATS QUERY] Processando ${allDates.length} dias do mês`);
      
      // Processar estatísticas para cada dia
      const dailyStats: DailyStats[] = allDates.map(date => {
        return processDailyStats(date, activities || [], newClients || [], scheduledVisits || []);
      });

      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
