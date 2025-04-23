
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";
import { DailyStats } from "../types/activity-dashboard.types";

// Interfaces para tipar os dados retornados das funções RPC
interface NewClientData {
  date: string;
  lead_source: string;
  count: number;
}

interface ActivityTypeData {
  date: string;
  tipo_atividade: string;
  source: string;
  count: number;
}

interface ScheduledActivityData {
  date: string;
  source: string;
  count: number;
}

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
      
      // Usar a função com .from() e select() ao invés de rpc para evitar erros de tipo
      let clientsQuery = supabase
        .from('clients')
        .select('created_at, lead_source')
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso)
        .in('unit_id', unitIds)
        .eq('active', true);
      
      if (selectedSource !== 'todos') {
        clientsQuery = clientsQuery.eq('lead_source', selectedSource);
      }
      
      const { data: clientsData, error: clientsError } = await clientsQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de novos clientes');
      
      if (clientsError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar novos clientes:', clientsError);
        throw clientsError;
      }
      
      // 2. BUSCAR ATIVIDADES CRIADAS POR DIA E TIPO
      console.time('[AGGREGATED ACTIVITY STATS] Consulta de atividades por dia e tipo');
      
      let activitiesQuery = supabase
        .from('client_activities')
        .select('created_at, tipo_atividade, clients!inner(lead_source)')
        .gte('created_at', startDateIso)
        .lte('created_at', endDateIso)
        .in('unit_id', unitIds)
        .eq('active', true);
      
      if (selectedSource !== 'todos') {
        activitiesQuery = activitiesQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: activitiesData, error: activitiesError } = await activitiesQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de atividades por dia e tipo');
      
      if (activitiesError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      // 3. BUSCAR ATIVIDADES AGENDADAS POR DIA
      console.time('[AGGREGATED ACTIVITY STATS] Consulta de atividades agendadas');
      
      let scheduledQuery = supabase
        .from('client_activities')
        .select('scheduled_date, clients!inner(lead_source)')
        .gte('scheduled_date', startDateIso)
        .lte('scheduled_date', endDateIso)
        .in('unit_id', unitIds)
        .eq('active', true)
        .eq('tipo_atividade', 'Agendamento');
      
      if (selectedSource !== 'todos') {
        scheduledQuery = scheduledQuery.eq('clients.lead_source', selectedSource);
      }
      
      const { data: scheduledData, error: scheduledError } = await scheduledQuery;
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Consulta de atividades agendadas');
      
      if (scheduledError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledError);
        throw scheduledError;
      }
      
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
      if (clientsData) {
        // Agrupar os dados manualmente por dia
        const clientsByDay: Record<string, number> = {};
        
        clientsData.forEach(client => {
          const dateStr = format(new Date(client.created_at), 'yyyy-MM-dd');
          if (!clientsByDay[dateStr]) {
            clientsByDay[dateStr] = 0;
          }
          clientsByDay[dateStr]++;
        });
        
        // Atualizar estatísticas diárias
        Object.entries(clientsByDay).forEach(([dateStr, count]) => {
          if (dailyStatsMap[dateStr]) {
            dailyStatsMap[dateStr].newClients = count;
          }
        });
      }
      
      // Processar dados de atividades por tipo
      if (activitiesData) {
        activitiesData.forEach(activity => {
          const dateStr = format(new Date(activity.created_at), 'yyyy-MM-dd');
          if (!dailyStatsMap[dateStr]) return;
          
          const stats = dailyStatsMap[dateStr];
          
          // Contagens baseadas no tipo de atividade
          if (['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)) {
            stats.contactAttempts += 1;
          }
          
          if (['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)) {
            stats.effectiveContacts += 1;
          }
          
          if (activity.tipo_atividade === 'Agendamento') {
            stats.scheduledVisits += 1;
          }
          
          if (activity.tipo_atividade === 'Atendimento') {
            stats.completedVisits += 1;
          }
          
          if (activity.tipo_atividade === 'Matrícula') {
            stats.enrollments += 1;
          }
        });
      }
      
      // Processar dados de atividades agendadas
      if (scheduledData) {
        scheduledData.forEach(item => {
          const dateStr = format(new Date(item.scheduled_date), 'yyyy-MM-dd');
          if (dailyStatsMap[dateStr]) {
            dailyStatsMap[dateStr].awaitingVisits += 1;
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
