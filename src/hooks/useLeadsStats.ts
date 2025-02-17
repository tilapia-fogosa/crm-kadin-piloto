
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"

interface PeriodStats {
  total: number
  comparison: number
  period: '1M' | '3M' | '6M' | '12M'
}

export function useLeadsStats() {
  return useQuery({
    queryKey: ['leads-stats'],
    queryFn: async () => {
      const now = new Date()
      
      // Função para buscar leads em um intervalo de datas
      const getLeadsInPeriod = async (startDate: Date, endDate: Date) => {
        const { data, error } = await supabase
          .from('clients')
          .select('created_at')
          .eq('active', true) // Filtra apenas clientes ativos
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())

        if (error) throw error
        return data?.length || 0
      }

      // Função para calcular estatísticas de um período
      const calculatePeriodStats = async (monthsAgo: number): Promise<PeriodStats> => {
        // Período atual
        const periodEnd = endOfMonth(now)
        const periodStart = startOfMonth(subMonths(now, monthsAgo - 1))
        
        // Mesmo período do ano anterior
        const lastYearEnd = endOfMonth(subMonths(now, 12))
        const lastYearStart = startOfMonth(subMonths(now, monthsAgo + 11))

        const [currentTotal, lastYearTotal] = await Promise.all([
          getLeadsInPeriod(periodStart, periodEnd),
          getLeadsInPeriod(lastYearStart, lastYearEnd)
        ])

        return {
          total: currentTotal,
          comparison: currentTotal - lastYearTotal,
          period: `${monthsAgo}M` as PeriodStats['period']
        }
      }

      // Calcular estatísticas para todos os períodos
      const [oneMonth, threeMonths, sixMonths, twelveMonths] = await Promise.all([
        calculatePeriodStats(1),
        calculatePeriodStats(3),
        calculatePeriodStats(6),
        calculatePeriodStats(12)
      ])

      return {
        oneMonth,
        threeMonths,
        sixMonths,
        twelveMonths
      }
    },
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
  })
}
