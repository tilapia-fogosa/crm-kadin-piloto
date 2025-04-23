
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";
import { DailyStats } from "../types/activity-dashboard.types";

/**
 * Hook para buscar estatísticas de atividades agregadas diretamente no banco de dados
 * 
 * Este hook substitui a abordagem anterior que buscava todos os registros e fazia
 * a agregação no frontend. A nova abordagem é mais eficiente e evita problemas
 * de limitação de dados (1000 registros) do Supabase.
 */
export function useAggregatedActivityStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  userUnits: any[] | undefined,
  selectedUnitId: string,
  isOpen: boolean = false
) {
  console.time('[AGGREGATED ACTIVITY STATS] Tempo total de execução');
  
  return useQuery<DailyStats[]>({
    queryKey: ['aggregated-activity-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId, userUnits?.map(u => u.unit_id)],
    queryFn: async () => {
      if (!selectedMonth || !selectedYear) {
        console.error('[AGGREGATED ACTIVITY STATS] Mês ou ano não selecionados');
        return [];
      }
      
      const monthNum = parseInt(selectedMonth);
      const yearNum = parseInt(selectedYear);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('[AGGREGATED ACTIVITY STATS] Valores inválidos:', { selectedMonth, selectedYear });
        return [];
      }
      
      // Datas para filtro
      const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
      const endDate = endOfMonth(createSafeDate(yearNum, monthNum));
      
      // Converter para ISO strings para query
      const startDateIso = startDate.toISOString();
      const endDateIso = endDate.toISOString();
      
      // Log detalhado das datas e parâmetros
      console.log(`[AGGREGATED ACTIVITY STATS] Período de consulta: ${format(startDate, 'yyyy-MM-dd')} até ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`[AGGREGATED ACTIVITY STATS] Período ISO: ${startDateIso} até ${endDateIso}`);

      // Unidades para filtro
      let unitIds: string[] = [];
      if (selectedUnitId === 'todas') {
        unitIds = userUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [selectedUnitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[AGGREGATED ACTIVITY STATS] Nenhuma unidade para filtro');
        return [];
      }
      
      // Estrutura para armazenar os resultados agregados
      const dailyStatsMap: Record<string, DailyStats> = {};
      
      // 1. BUSCAR NOVOS CLIENTES POR DIA
      console.time('[AGGREGATED ACTIVITY STATS] Consulta de novos clientes');
      let clientsQuery = supabase.rpc('get_daily_new_clients', {
        p_start_date: startDateIso,
        p_end_date: endDateIso,
        p_unit_ids: unitIds
      });
      
      if (selectedSource !== 'todos') {
        clientsQuery = clientsQuery.eq('lead_source', selectedSource);
      }
      
      const { data: newClientsData, error: newClientsError } = await clientsQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de novos clientes');
      
      if (newClientsError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }
      
      console.log(`[AGGREGATED ACTIVITY STATS] Dados de novos clientes recebidos:`, newClientsData);
      
      // 2. BUSCAR ATIVIDADES CRIADAS POR DIA E TIPO
      console.time('[AGGREGATED ACTIVITY STATS] Consulta de atividades por dia e tipo');
      let activitiesQuery = supabase.rpc('get_daily_activities_by_type', {
        p_start_date: startDateIso,
        p_end_date: endDateIso,
        p_unit_ids: unitIds
      });
      
      if (selectedSource !== 'todos') {
        activitiesQuery = activitiesQuery.eq('source', selectedSource);
      }
      
      const { data: activitiesData, error: activitiesError } = await activitiesQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de atividades por dia e tipo');
      
      if (activitiesError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      console.log(`[AGGREGATED ACTIVITY STATS] Dados de atividades recebidos:`, activitiesData);
      
      // 3. BUSCAR ATIVIDADES AGENDADAS POR DIA
      console.time('[AGGREGATED ACTIVITY STATS] Consulta de atividades agendadas');
      let scheduledQuery = supabase.rpc('get_daily_scheduled_activities', {
        p_start_date: startDateIso,
        p_end_date: endDateIso,
        p_unit_ids: unitIds
      });
      
      if (selectedSource !== 'todos') {
        scheduledQuery = scheduledQuery.eq('source', selectedSource);
      }
      
      const { data: scheduledData, error: scheduledError } = await scheduledQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de atividades agendadas');
      
      if (scheduledError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledError);
        throw scheduledError;
      }
      
      console.log(`[AGGREGATED ACTIVITY STATS] Dados de atividades agendadas recebidos:`, scheduledData);
      
      // Processo de agregação diária dos dados
      console.time('[AGGREGATED ACTIVITY STATS] Processamento dos dados');
      
      // Inicializar estrutura com todas as datas do mês
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        dailyStatsMap[dateStr] = {
          date: new Date(currentDate),
          newClients: 0,
          contactAttempts: 0,
          effectiveContacts: 0,
          scheduledVisits: 0,
          awaitingVisits: 0,
          completedVisits: 0,
          enrollments: 0,
          ceConversionRate: 0,
          agConversionRate: 0,
          atConversionRate: 0,
          maConversionRate: 0
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Processar dados de novos clientes
      if (newClientsData) {
        newClientsData.forEach(item => {
          const dateStr = item.date;
          if (dailyStatsMap[dateStr]) {
            dailyStatsMap[dateStr].newClients = item.count || 0;
          }
        });
      }
      
      // Processar dados de atividades por tipo
      if (activitiesData) {
        activitiesData.forEach(item => {
          const dateStr = item.date;
          if (!dailyStatsMap[dateStr]) return;
          
          const stats = dailyStatsMap[dateStr];
          
          // Contagens baseadas no tipo de atividade
          if (['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(item.tipo_atividade)) {
            stats.contactAttempts += item.count || 0;
          }
          
          if (['Contato Efetivo', 'Agendamento'].includes(item.tipo_atividade)) {
            stats.effectiveContacts += item.count || 0;
          }
          
          if (item.tipo_atividade === 'Agendamento') {
            stats.scheduledVisits += item.count || 0;
          }
          
          if (item.tipo_atividade === 'Atendimento') {
            stats.completedVisits += item.count || 0;
          }
          
          if (item.tipo_atividade === 'Matrícula') {
            stats.enrollments += item.count || 0;
          }
        });
      }
      
      // Processar dados de atividades agendadas
      if (scheduledData) {
        scheduledData.forEach(item => {
          const dateStr = item.date;
          if (dailyStatsMap[dateStr]) {
            dailyStatsMap[dateStr].awaitingVisits += item.count || 0;
          }
        });
      }
      
      // Calcular taxas de conversão
      Object.values(dailyStatsMap).forEach(stats => {
        // Taxa de conversão de tentativas para contatos efetivos
        stats.ceConversionRate = stats.contactAttempts > 0 
          ? (stats.effectiveContacts / stats.contactAttempts) * 100 
          : 0;
          
        // Taxa de conversão de contatos efetivos para agendamentos
        stats.agConversionRate = stats.effectiveContacts > 0 
          ? (stats.scheduledVisits / stats.effectiveContacts) * 100 
          : 0;
          
        // Taxa de conversão de visitas aguardando para realizadas
        stats.atConversionRate = stats.awaitingVisits > 0 
          ? (stats.completedVisits / stats.awaitingVisits) * 100 
          : 0;
          
        // Taxa de conversão de visitas realizadas para matrículas
        stats.maConversionRate = stats.completedVisits > 0
          ? (stats.enrollments / stats.completedVisits) * 100
          : 0;
      });
      
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Processamento dos dados');
      
      // Converter para array e ordenar por data
      const result = Object.values(dailyStatsMap).sort((a, b) => 
        a.date.getTime() - b.date.getTime()
      );
      
      console.log(`[AGGREGATED ACTIVITY STATS] Total de ${result.length} dias processados`);
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Tempo total de execução');
      
      return result;
    },
    enabled: isOpen && !!userUnits && userUnits.length > 0,
  });
}
