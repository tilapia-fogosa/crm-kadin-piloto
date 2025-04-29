
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from "date-fns";
import { DateRangeType } from "./useLeadFunnelStats";

export interface LeadFunnelStats {
  leads: number;
  contatos_efetivos: number;
  agendamentos: number;
  atendimentos: number;
  matriculas: number;
}

export function useLeadFunnelConversion(
  unitIds: string[] | null,
  dateRange: DateRangeType,
  startDate?: Date,
  endDate?: Date
) {
  console.log('Using lead funnel conversion hook with:', { unitIds, dateRange, startDate, endDate });

  return useQuery({
    queryKey: ['lead-funnel-conversion', unitIds, dateRange, startDate, endDate],
    queryFn: async (): Promise<LeadFunnelStats | null> => {
      console.log('Fetching funnel conversion data');
      
      if (!unitIds || unitIds.length === 0) {
        console.log('No units selected, returning null');
        return null;
      }

      // Calculate date range
      let queryStartDate: Date;
      let queryEndDate: Date = endOfMonth(new Date()); // Hoje por padrão
      const today = new Date();
      
      if (dateRange === 'custom' && startDate && endDate) {
        queryStartDate = startOfDay(startDate);
        queryEndDate = endOfDay(endDate);
      } else if (dateRange === 'quarter') {
        queryStartDate = startOfMonth(subMonths(today, 3));
      } else if (dateRange === 'current-month') {
        queryStartDate = startOfMonth(today);
      } else {
        // Mês anterior (padrão)
        queryStartDate = startOfMonth(subMonths(today, 1));
        queryEndDate = endOfMonth(subMonths(today, 1));
      }

      console.log('Querying funnel data for period:', {
        start: queryStartDate,
        end: queryEndDate,
        unitIds
      });

      const { data, error } = await supabase.rpc('rpc_funnel_conversion', {
        data_inicio: queryStartDate.toISOString(),
        data_fim: queryEndDate.toISOString(),
        unit_ids: unitIds
      });

      if (error) {
        console.error('Error fetching funnel data:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No funnel data returned');
        return null;
      }

      console.log('Funnel data received:', data[0]);
      return data[0] as LeadFunnelStats;
    },
    enabled: !!unitIds && unitIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}
