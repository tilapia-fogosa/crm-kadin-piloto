
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";
import type { UnitStats, UserStats } from "../types/stats.types";

interface UseCommercialStatsProps {
  selectedSource: string;
  selectedMonth: string;
  selectedYear: string;
  selectedUnitId: string | null;
  availableUnitIds: string[];
}

export function useCommercialStats({
  selectedSource,
  selectedMonth,
  selectedYear,
  selectedUnitId,
  availableUnitIds
}: UseCommercialStatsProps) {
  console.log('useCommercialStats hook iniciado com params:', {
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
    availableUnitIds
  });

  // Converter datas
  const monthNum = parseInt(selectedMonth);
  const yearNum = parseInt(selectedYear);
  const startDate = startOfMonth(createSafeDate(yearNum, monthNum));
  const endDate = endOfMonth(createSafeDate(yearNum, monthNum));

  // Preparar array de unidades para filtro
  const unitIds = selectedUnitId ? [selectedUnitId] : availableUnitIds;

  // Query para estatísticas por unidade
  const unitStatsQuery = useQuery({
    queryKey: ['commercial-unit-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      console.log('Buscando estatísticas por unidade:', {
        startDate,
        endDate,
        unitIds,
        selectedSource
      });

      const { data, error } = await supabase.rpc('get_commercial_unit_stats', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_unit_ids: unitIds,
        p_source_id: selectedSource
      });

      if (error) throw error;
      return data as UnitStats[];
    }
  });

  // Query para estatísticas por usuário
  const userStatsQuery = useQuery({
    queryKey: ['commercial-user-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      console.log('Buscando estatísticas por usuário:', {
        startDate,
        endDate,
        unitIds,
        selectedSource
      });

      const { data, error } = await supabase.rpc('get_commercial_user_stats', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_unit_ids: unitIds,
        p_source_id: selectedSource
      });

      if (error) throw error;
      return data as UserStats[];
    }
  });

  return {
    unitStats: unitStatsQuery.data,
    userStats: userStatsQuery.data,
    isLoadingUnitStats: unitStatsQuery.isLoading,
    isLoadingUserStats: userStatsQuery.isLoading,
    error: unitStatsQuery.error || userStatsQuery.error
  };
}
