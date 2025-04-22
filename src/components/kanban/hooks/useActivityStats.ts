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
      
      // Criação de datas de início e fim do mês usando a nova função
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      // Gerar strings ISO para query SQL direta
      const startISO = startDate.toISOString();
      const endISO = endDate.toISOString();
      
      console.log('[STATS QUERY] Período calculado para SQL:', {
        startDate: startISO,
        endDate: endISO,
        ano: yearNum,
        mes: monthNum
      });

      // Determinar IDs das unidades para filtro
      let unitIds: string[] = [];
      
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
        console.log('[STATS QUERY] Buscando para todas as unidades:', unitIds);
      } else {
        unitIds = [selectedUnitId];
        console.log('[STATS QUERY] Buscando para unidade específica:', selectedUnitId);
      }
      
      if (unitIds.length === 0) {
        console.error('[STATS QUERY] Nenhuma unidade disponível para filtro');
        return [];
      }

      // 1. Buscar novos clientes usando BETWEEN para range preciso
      let newClientsQuery = supabase
        .from('clients')
        .select('*')
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

      // 2. Buscar atividades do período usando BETWEEN para range preciso
      let activitiesQuery = supabase
        .from('client_activities')
        .select('*, clients!inner(*)')
        .eq('active', true)
        .eq('clients.active', true)
        .in('unit_id', unitIds)
        .gte('created_at', startISO)
        .lte('created_at', endISO);

      if (selectedSource !== 'todos') {
        activitiesQuery = activitiesQuery.eq('clients.lead_source', selectedSource);
      }

      const { data: activities, error: activitiesError } = await activitiesQuery;

      if (activitiesError) {
        console.error('[STATS QUERY] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }

      // 3. Buscar visitas aguardadas usando BETWEEN para range preciso
      let scheduledVisitsQuery = supabase
        .from('clients')
        .select('*')
        .eq('active', true)
        .in('unit_id', unitIds)
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);

      if (selectedSource !== 'todos') {
        scheduledVisitsQuery = scheduledVisitsQuery.eq('lead_source', selectedSource);
      }

      const { data: scheduledClients, error: scheduledError } = await scheduledVisitsQuery;

      if (scheduledError) {
        console.error('[STATS QUERY] Erro ao buscar visitas agendadas:', scheduledError);
        throw scheduledError;
      }

      // Log detalhado de diagnóstico
      console.log(`[STATS QUERY] Dados coletados do banco:
        Novos Clientes: ${newClients?.length || 0}
        Atividades: ${activities?.length || 0} 
        Tipos: ${activities?.map(a => a.tipo_atividade).join(', ')}
        Visitas Aguardadas: ${scheduledClients?.length || 0}
        Unidades: ${unitIds.join(', ')}
      `);
      
      // Log detalhado para atividades após 15/04
      const activitiesAfter15 = activities?.filter(a => {
        const aDate = new Date(a.created_at);
        return aDate.getDate() >= 15 && aDate.getMonth() === 3; // Abril = 3
      }) || [];
      
      console.log(`[STATS QUERY] Análise de atividades após 15/04: ${activitiesAfter15.length} atividades`);
      activitiesAfter15.forEach(a => {
        console.log(`Atividade ${a.id}: ${a.tipo_atividade} criada em ${a.created_at}`);
      });

      // Gerar array com todas as datas do mês
      const allDates = eachDayOfInterval({ start: startDate, end: endDate });
      console.log(`[STATS QUERY] Processando ${allDates.length} dias do mês`);
      
      // Processar estatísticas para cada dia
      const dailyStats: DailyStats[] = allDates.map(date => {
        return processDailyStats(date, activities || [], newClients || [], scheduledClients || []);
      });

      console.log(`[STATS QUERY] Processamento concluído. Retornando estatísticas de ${dailyStats.length} dias`);
      return dailyStats;
    },
    enabled: !!userUnits && userUnits.length > 0,
  });
}
