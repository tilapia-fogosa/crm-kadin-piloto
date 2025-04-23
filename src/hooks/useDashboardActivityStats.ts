
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subYears } from "date-fns";
import { useUnit } from "@/contexts/UnitContext";

export interface ActivityFunnelPeriod {
  totalContacts: number;
  effectiveContacts: number;
  scheduledVisits: number;
  completedVisits: number;
  enrollments: number;
  effectiveContactsRate: number;
  scheduledVisitsRate: number;
  completedVisitsRate: number;
  enrollmentsRate: number;
  comparison: {
    totalContacts: number;
    effectiveContacts: number;
    scheduledVisits: number;
    completedVisits: number;
    enrollments: number;
    effectiveContactsRate: number;
    scheduledVisitsRate: number;
    completedVisitsRate: number;
    enrollmentsRate: number;
  };
}

export interface DashboardActivityData {
  oneMonth: ActivityFunnelPeriod;
  threeMonths: ActivityFunnelPeriod;
  sixMonths: ActivityFunnelPeriod;
  twelveMonths: ActivityFunnelPeriod;
}

/**
 * Hook para buscar estatísticas de atividades de funil para o Dashboard
 * 
 * Esta versão usa uma função no banco de dados para agregar dados e evitar limitações
 * de paginação do Supabase. Melhora significativamente a performance e precisão dos dados.
 * 
 * @param unitId ID da unidade selecionada ou null para todas as unidades
 */
export function useDashboardActivityStats(unitId: string | null) {
  console.log('Iniciando useDashboardActivityStats para unidade:', unitId);
  const { availableUnits } = useUnit();
  
  return useQuery({
    queryKey: ['dashboard-activity-stats', unitId, availableUnits?.map(u => u.unit_id)],
    queryFn: async (): Promise<DashboardActivityData | null> => {
      console.time('[DASHBOARD ACTIVITY STATS] Tempo total de execução');
      console.log('Buscando estatísticas de funil de atividades para unidade:', unitId);
      
      if (!unitId) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }

      // Determina as unidades para filtro
      let unitIds: string[] = [];
      if (unitId === 'todas') {
        unitIds = availableUnits?.map(u => u.unit_id) || [];
      } else {
        unitIds = [unitId];
      }
      
      if (unitIds.length === 0) {
        console.error('[DASHBOARD ACTIVITY STATS] Nenhuma unidade para filtro');
        return null;
      }

      const now = new Date();
      
      // Função para calcular estatísticas para um período específico
      const getStatsForPeriod = async (
        monthsAgo: number
      ): Promise<ActivityFunnelPeriod> => {
        console.time(`[DASHBOARD ACTIVITY STATS] Cálculo para período de ${monthsAgo} meses`);
        
        // Período atual
        const endDate = endOfMonth(now);
        const startDate = startOfMonth(subMonths(now, monthsAgo - 1));

        // Mesmo período do ano anterior
        const previousEndDate = endOfMonth(subYears(endDate, 1));
        const previousStartDate = startOfMonth(subYears(startDate, 1));

        console.log(`Calculando estatísticas para período de ${monthsAgo} meses:`, {
          atual: `${startDate.toISOString()} até ${endDate.toISOString()}`,
          anterior: `${previousStartDate.toISOString()} até ${previousEndDate.toISOString()}`
        });

        // Chama a função RPC no Supabase que faz os cálculos no servidor
        const { data, error } = await supabase.rpc('get_dashboard_activity_funnel_stats', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
          p_prev_start_date: previousStartDate.toISOString(),
          p_prev_end_date: previousEndDate.toISOString(),
          p_unit_ids: unitIds
        });

        if (error) {
          console.error(`[DASHBOARD ACTIVITY STATS] Erro no cálculo para ${monthsAgo} meses:`, error);
          throw error;
        }

        console.log(`[DASHBOARD ACTIVITY STATS] Dados obtidos para ${monthsAgo} meses:`, data);
        
        // Extrai e tipifica os dados retornados
        const result: ActivityFunnelPeriod = {
          totalContacts: parseInt(data.current.totalContacts),
          effectiveContacts: parseInt(data.current.effectiveContacts),
          scheduledVisits: parseInt(data.current.scheduledVisits),
          completedVisits: parseInt(data.current.completedVisits),
          enrollments: parseInt(data.current.enrollments),
          effectiveContactsRate: parseFloat(data.current.effectiveContactsRate),
          scheduledVisitsRate: parseFloat(data.current.scheduledVisitsRate),
          completedVisitsRate: parseFloat(data.current.completedVisitsRate),
          enrollmentsRate: parseFloat(data.current.enrollmentsRate),
          comparison: {
            totalContacts: parseInt(data.comparison.totalContacts),
            effectiveContacts: parseInt(data.comparison.effectiveContacts),
            scheduledVisits: parseInt(data.comparison.scheduledVisits),
            completedVisits: parseInt(data.comparison.completedVisits),
            enrollments: parseInt(data.comparison.enrollments),
            effectiveContactsRate: parseFloat(data.comparison.effectiveContactsRate),
            scheduledVisitsRate: parseFloat(data.comparison.scheduledVisitsRate),
            completedVisitsRate: parseFloat(data.comparison.completedVisitsRate),
            enrollmentsRate: parseFloat(data.comparison.enrollmentsRate)
          }
        };
        
        console.timeEnd(`[DASHBOARD ACTIVITY STATS] Cálculo para período de ${monthsAgo} meses`);
        return result;
      };

      try {
        // Busca dados para todos os períodos em paralelo
        console.time('[DASHBOARD ACTIVITY STATS] Busca de todos os períodos');
        const [oneMonth, threeMonths, sixMonths, twelveMonths] = await Promise.all([
          getStatsForPeriod(1),
          getStatsForPeriod(3),
          getStatsForPeriod(6),
          getStatsForPeriod(12)
        ]);
        console.timeEnd('[DASHBOARD ACTIVITY STATS] Busca de todos os períodos');

        console.log('[DASHBOARD ACTIVITY STATS] Todos os períodos calculados com sucesso');
        
        const result: DashboardActivityData = {
          oneMonth,
          threeMonths,
          sixMonths,
          twelveMonths
        };
        
        console.timeEnd('[DASHBOARD ACTIVITY STATS] Tempo total de execução');
        return result;
      } catch (error) {
        console.error('[DASHBOARD ACTIVITY STATS] Erro ao calcular estatísticas:', error);
        throw error;
      }
    },
    enabled: !!unitId && (!availableUnits || availableUnits.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    cacheTime: 10 * 60 * 1000, // 10 minutos
  });
}
