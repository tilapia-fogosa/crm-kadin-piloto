
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subYears } from "date-fns";
import { useUnit } from "@/contexts/UnitContext";

/**
 * Estrutura dos dados de usuário para taxa de comparecimento
 */
export interface AttendanceRateUserStats {
  user_id: string;
  user_name: string;
  schedulings: number;
  attendances: number;
  attendanceRate: number;
}

/**
 * Estrutura dos dados de período para taxa de comparecimento
 */
export interface AttendanceRatePeriod {
  totalSchedulings: number;
  totalAttendances: number;
  overallAttendanceRate: number;
  userStats: AttendanceRateUserStats[];
  comparison: {
    totalSchedulings: number;
    totalAttendances: number;
    overallAttendanceRate: number;
    userStats: AttendanceRateUserStats[];
  };
}

/**
 * Estrutura dos dados de taxa de comparecimento por período para o Dashboard
 */
export interface DashboardAttendanceRateData {
  oneMonth: AttendanceRatePeriod;
  threeMonths: AttendanceRatePeriod;
  sixMonths: AttendanceRatePeriod;
  twelveMonths: AttendanceRatePeriod;
}

/**
 * Formato da resposta da função RPC get_attendance_rate_stats
 */
interface AttendanceRateResponse {
  current: {
    totalSchedulings: number;
    totalAttendances: number;
    overallAttendanceRate: number;
    userStats: AttendanceRateUserStats[];
  };
  comparison: {
    totalSchedulings: number;
    totalAttendances: number;
    overallAttendanceRate: number;
    userStats: AttendanceRateUserStats[];
  };
}

/**
 * Hook para buscar estatísticas de taxa de comparecimento para o Dashboard
 * 
 * Calcula a taxa de conversão de agendamentos para atendimentos por usuário,
 * medindo quantos dos clientes agendados por cada usuário efetivamente compareceram.
 * 
 * @param unitIds IDs das unidades selecionadas ou null para todas as unidades
 */
export function useAttendanceRateStats(unitIds: string[] | null) {
  console.log('Iniciando useAttendanceRateStats para unidades:', unitIds);
  const { availableUnits } = useUnit();
  
  return useQuery({
    queryKey: ['attendance-rate-stats', unitIds, availableUnits?.map(u => u.unit_id)],
    queryFn: async (): Promise<DashboardAttendanceRateData | null> => {
      console.time('[ATTENDANCE RATE STATS] Tempo total de execução');
      console.log('Buscando estatísticas de taxa de comparecimento para unidades:', unitIds);
      
      if (!unitIds || unitIds.length === 0) {
        console.log('Nenhuma unidade selecionada, retornando null');
        return null;
      }

      // Determina as unidades para filtro
      let finalUnitIds: string[] = unitIds;
      
      // Se nenhuma unidade específica foi fornecida, usa todas as disponíveis
      if (unitIds.length === 0 || unitIds[0] === 'todas') {
        finalUnitIds = availableUnits?.map(u => u.unit_id) || [];
      }
      
      if (finalUnitIds.length === 0) {
        console.error('[ATTENDANCE RATE STATS] Nenhuma unidade para filtro');
        return null;
      }

      const now = new Date();
      
      // Função para calcular estatísticas para um período específico
      const getStatsForPeriod = async (
        monthsAgo: number
      ): Promise<AttendanceRatePeriod> => {
        console.time(`[ATTENDANCE RATE STATS] Cálculo para período de ${monthsAgo} meses`);
        
        // Período atual
        const endDate = endOfMonth(now);
        const startDate = startOfMonth(subMonths(now, monthsAgo - 1));

        // Mesmo período do ano anterior
        const previousEndDate = endOfMonth(subYears(endDate, 1));
        const previousStartDate = startOfMonth(subYears(startDate, 1));

        console.log(`Calculando taxa de comparecimento para período de ${monthsAgo} meses:`, {
          atual: `${startDate.toISOString()} até ${endDate.toISOString()}`,
          anterior: `${previousStartDate.toISOString()} até ${previousEndDate.toISOString()}`
        });

        // Chama a função RPC no Supabase que faz os cálculos no servidor
        const { data, error } = await supabase.rpc(
          'get_attendance_rate_stats' as any,
          {
            p_start_date: startDate.toISOString(),
            p_end_date: endDate.toISOString(),
            p_prev_start_date: previousStartDate.toISOString(),
            p_prev_end_date: previousEndDate.toISOString(),
            p_unit_ids: finalUnitIds
          }
        );

        if (error) {
          console.error(`[ATTENDANCE RATE STATS] Erro no cálculo para ${monthsAgo} meses:`, error);
          throw error;
        }

        console.log(`[ATTENDANCE RATE STATS] Dados obtidos para ${monthsAgo} meses:`, data);
        
        // Extrai e tipifica os dados retornados
        const typedData = data as AttendanceRateResponse;
        
        const result: AttendanceRatePeriod = {
          totalSchedulings: typedData.current.totalSchedulings,
          totalAttendances: typedData.current.totalAttendances,
          overallAttendanceRate: typedData.current.overallAttendanceRate,
          userStats: typedData.current.userStats || [],
          comparison: {
            totalSchedulings: typedData.comparison.totalSchedulings,
            totalAttendances: typedData.comparison.totalAttendances,
            overallAttendanceRate: typedData.comparison.overallAttendanceRate,
            userStats: typedData.comparison.userStats || []
          }
        };
        
        console.timeEnd(`[ATTENDANCE RATE STATS] Cálculo para período de ${monthsAgo} meses`);
        return result;
      };

      try {
        // Busca dados para todos os períodos em paralelo
        console.time('[ATTENDANCE RATE STATS] Busca de todos os períodos');
        const [oneMonth, threeMonths, sixMonths, twelveMonths] = await Promise.all([
          getStatsForPeriod(1),
          getStatsForPeriod(3),
          getStatsForPeriod(6),
          getStatsForPeriod(12)
        ]);
        console.timeEnd('[ATTENDANCE RATE STATS] Busca de todos os períodos');

        console.log('[ATTENDANCE RATE STATS] Todos os períodos calculados com sucesso');
        
        const result: DashboardAttendanceRateData = {
          oneMonth,
          threeMonths,
          sixMonths,
          twelveMonths
        };
        
        console.timeEnd('[ATTENDANCE RATE STATS] Tempo total de execução');
        return result;
      } catch (error) {
        console.error('[ATTENDANCE RATE STATS] Erro ao calcular estatísticas:', error);
        throw error;
      }
    },
    enabled: !!unitIds && unitIds.length > 0 && (!availableUnits || availableUnits.length > 0),
    staleTime: 5 * 60 * 1000, // 5 minutos de cache
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
