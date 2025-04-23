
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ActivityFunnelData, FunnelStatsResponse } from "@/components/dashboard/types/activity-funnel.types";

export function useActivityFunnelStats(unitId: string | null) {
  return useQuery({
    queryKey: ['activity-funnel-stats', unitId],
    queryFn: async (): Promise<ActivityFunnelData | null> => {
      console.log('Buscando estatísticas de funil de atividades para unidade:', unitId);
      
      if (!unitId) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }

      const now = new Date();
      
      // Função auxiliar para buscar estatísticas de um período
      const getStatsForPeriod = async (monthsAgo: number): Promise<FunnelStatsResponse> => {
        // Período atual
        const endDate = endOfMonth(now);
        const startDate = startOfMonth(subMonths(now, monthsAgo - 1));
        
        // Período anterior para comparação (mesmo período do ano passado)
        const previousEndDate = endOfMonth(subMonths(endDate, 12));
        const previousStartDate = startOfMonth(subMonths(startDate, 12));

        console.log(`Buscando estatísticas para período de ${monthsAgo} meses:`, {
          atual: `${startDate.toISOString()} até ${endDate.toISOString()}`,
          anterior: `${previousStartDate.toISOString()} até ${previousEndDate.toISOString()}`
        });

        const { data, error } = await supabase
          .rpc('get_activity_funnel_stats', {
            p_unit_id: unitId,
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString(),
            p_previous_start_date: previousStartDate.toISOString(),
            p_previous_end_date: previousEndDate.toISOString()
          });

        if (error) {
          console.error('Erro ao buscar estatísticas:', error);
          throw error;
        }

        // Converter o tipo de dados para FunnelStatsResponse
        return data as unknown as FunnelStatsResponse;
      };

      try {
        // Buscar estatísticas para cada período
        const [oneMonth, threeMonths, sixMonths, twelveMonths] = await Promise.all([
          getStatsForPeriod(1),
          getStatsForPeriod(3),
          getStatsForPeriod(6),
          getStatsForPeriod(12)
        ]);

        // Formatar resposta no formato esperado pelos componentes
        return {
          oneMonth: {
            ...oneMonth.current,
            comparison: oneMonth.comparison
          },
          threeMonths: {
            ...threeMonths.current,
            comparison: threeMonths.comparison
          },
          sixMonths: {
            ...sixMonths.current,
            comparison: sixMonths.comparison
          },
          twelveMonths: {
            ...twelveMonths.current,
            comparison: twelveMonths.comparison
          }
        };
      } catch (error) {
        console.error('Erro ao calcular estatísticas de funil:', error);
        throw error;
      }
    },
    enabled: !!unitId,
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    gcTime: 30 * 60 * 1000 // Manter no cache por 30 minutos (novo nome para cacheTime)
  });
}
