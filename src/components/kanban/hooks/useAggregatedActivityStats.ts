
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";
import { DailyStats } from "../types/activity-dashboard.types";

interface DatabaseStat {
  date: string;
  tipo_atividade?: string;
  source?: string;
  lead_source?: string;
  count: number;
}

/**
 * Hook para buscar estatísticas de atividades agregadas usando funções do banco
 * 
 * Este hook substitui a abordagem anterior que buscava todos os registros e fazia
 * a agregação no frontend. A nova abordagem é mais eficiente e evita problemas
 * de limitação de dados.
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

      // Estrutura para armazenar dados agregados por dia
      const dailyStatsMap: Record<string, DailyStats> = {};
      
      // 1. BUSCAR NOVOS CLIENTES
      console.time('[AGGREGATED ACTIVITY STATS] Busca de novos clientes');
      const { data: newClientsData, error: newClientsError } = await supabase
        .rpc('get_daily_new_clients', {
          p_start_date: startDateIso,
          p_end_date: endDateIso,
          p_unit_ids: unitIds
        });
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Busca de novos clientes');

      if (newClientsError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar novos clientes:', newClientsError);
        throw newClientsError;
      }

      // 2. BUSCAR ATIVIDADES POR TIPO
      console.time('[AGGREGATED ACTIVITY STATS] Busca de atividades por tipo');
      const { data: activitiesData, error: activitiesError } = await supabase
        .rpc('get_daily_activities_by_type', {
          p_start_date: startDateIso,
          p_end_date: endDateIso,
          p_unit_ids: unitIds
        });
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Busca de atividades por tipo');

      if (activitiesError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }

      // 3. BUSCAR ATIVIDADES AGENDADAS
      console.time('[AGGREGATED ACTIVITY STATS] Busca de atividades agendadas');
      const { data: scheduledData, error: scheduledError } = await supabase
        .rpc('get_daily_scheduled_activities', {
          p_start_date: startDateIso,
          p_end_date: endDateIso,
          p_unit_ids: unitIds
        });
      console.timeEnd('[AGGREGATED ACTIVITY STATS] Busca de atividades agendadas');

      if (scheduledError) {
        console.error('[AGGREGATED ACTIVITY STATS] Erro ao buscar atividades agendadas:', scheduledError);
        throw scheduledError;
      }

      // Inicializar estrutura para todos os dias do mês
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
        newClientsData.forEach((stat: DatabaseStat) => {
          if (selectedSource === 'todos' || stat.lead_source === selectedSource) {
            if (dailyStatsMap[stat.date]) {
              dailyStatsMap[stat.date].newClients += stat.count;
            }
          }
        });
      }

      // Processar dados de atividades por tipo
      if (activitiesData) {
        activitiesData.forEach((stat: DatabaseStat) => {
          if (!stat.source || selectedSource === 'todos' || stat.source === selectedSource) {
            if (dailyStatsMap[stat.date]) {
              const dayStats = dailyStatsMap[stat.date];

              if (['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(stat.tipo_atividade || '')) {
                dayStats.contactAttempts += stat.count;
              }
              
              if (['Contato Efetivo', 'Agendamento'].includes(stat.tipo_atividade || '')) {
                dayStats.effectiveContacts += stat.count;
              }
              
              if (stat.tipo_atividade === 'Agendamento') {
                dayStats.scheduledVisits += stat.count;
              }
              
              if (stat.tipo_atividade === 'Atendimento') {
                dayStats.completedVisits += stat.count;
              }
              
              if (stat.tipo_atividade === 'Matrícula') {
                dayStats.enrollments += stat.count;
              }
            }
          }
        });
      }

      // Processar dados de atividades agendadas
      if (scheduledData) {
        scheduledData.forEach((stat: DatabaseStat) => {
          if (!stat.source || selectedSource === 'todos' || stat.source === selectedSource) {
            if (dailyStatsMap[stat.date]) {
              dailyStatsMap[stat.date].awaitingVisits += stat.count;
            }
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
