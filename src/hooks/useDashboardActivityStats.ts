
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subYears } from "date-fns";
import { useUnit } from "@/contexts/UnitContext";

/**
 * Estrutura dos dados de período para o funil de atividades
 */
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

/**
 * Estrutura dos dados de atividades por período para o Dashboard
 */
export interface DashboardActivityData {
  oneMonth: ActivityFunnelPeriod;
  threeMonths: ActivityFunnelPeriod;
  sixMonths: ActivityFunnelPeriod;
  twelveMonths: ActivityFunnelPeriod;
}

/**
 * Formato da resposta da função RPC get_dashboard_activity_funnel_stats
 */
interface DashboardActivityResponse {
  current: {
    totalContacts: string;
    effectiveContacts: string;
    scheduledVisits: string;
    completedVisits: string;
    enrollments: string;
    effectiveContactsRate: string;
    scheduledVisitsRate: string;
    completedVisitsRate: string;
    enrollmentsRate: string;
  };
  comparison: {
    totalContacts: string;
    effectiveContacts: string;
    scheduledVisits: string;
    completedVisits: string;
    enrollments: string;
    effectiveContactsRate: string;
    scheduledVisitsRate: string;
    completedVisitsRate: string;
    enrollmentsRate: string;
  };
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
        // Com type assertion para garantir o tipo correto
        const { data, error } = await supabase.rpc(
          'get_dashboard_activity_funnel_stats' as any,
          {
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString(),
            p_prev_start_date: previousStartDate.toISOString(),
            p_prev_end_date: previousEndDate.toISOString(),
            p_unit_ids: unitIds
          }
        );

        if (error) {
          console.error(`[DASHBOARD ACTIVITY STATS] Erro no cálculo para ${monthsAgo} meses:`, error);
          throw error;
        }

        console.log(`[DASHBOARD ACTIVITY STATS] Dados obtidos para ${monthsAgo} meses:`, data);
        
        // Extrai e tipifica os dados retornados
        // Usando type assertion para garantir que o TypeScript reconheça o formato
        const typedData = data as unknown as DashboardActivityResponse;
        
        const result: ActivityFunnelPeriod = {
          totalContacts: parseInt(typedData.current.totalContacts),
          effectiveContacts: parseInt(typedData.current.effectiveContacts),
          scheduledVisits: parseInt(typedData.current.scheduledVisits),
          completedVisits: parseInt(typedData.current.completedVisits),
          enrollments: parseInt(typedData.current.enrollments),
          effectiveContactsRate: parseFloat(typedData.current.effectiveContactsRate),
          scheduledVisitsRate: parseFloat(typedData.current.scheduledVisitsRate),
          completedVisitsRate: parseFloat(typedData.current.completedVisitsRate),
          enrollmentsRate: parseFloat(typedData.current.enrollmentsRate),
          comparison: {
            totalContacts: parseInt(typedData.comparison.totalContacts),
            effectiveContacts: parseInt(typedData.comparison.effectiveContacts),
            scheduledVisits: parseInt(typedData.comparison.scheduledVisits),
            completedVisits: parseInt(typedData.comparison.completedVisits),
            enrollments: parseInt(typedData.comparison.enrollments),
            effectiveContactsRate: parseFloat(typedData.comparison.effectiveContactsRate),
            scheduledVisitsRate: parseFloat(typedData.comparison.scheduledVisitsRate),
            completedVisitsRate: parseFloat(typedData.comparison.completedVisitsRate),
            enrollmentsRate: parseFloat(typedData.comparison.enrollmentsRate)
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
    gcTime: 10 * 60 * 1000, // 10 minutos (substituiu o cacheTime nas versões mais recentes)
  });
}
