
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

interface RawStats {
  unit_id?: string;
  unit_name?: string;
  user_id?: string;
  user_name?: string;
  new_clients: number;
  contact_attempts: number;
  effective_contacts: number;
  scheduled_visits: number;
  awaiting_visits: number;
  completed_visits: number;
  enrollments: number;
  ce_conversion_rate: number;
  ag_conversion_rate: number;
  at_conversion_rate: number;
  ma_conversion_rate: number;
}

const transformToUnitStats = (raw: RawStats): UnitStats => ({
  unit_id: raw.unit_id || '',
  unit_name: raw.unit_name || '',
  newClients: raw.new_clients,
  contactAttempts: raw.contact_attempts,
  effectiveContacts: raw.effective_contacts,
  scheduledVisits: raw.scheduled_visits,
  awaitingVisits: raw.awaiting_visits,
  completedVisits: raw.completed_visits,
  enrollments: raw.enrollments,
  ceConversionRate: raw.ce_conversion_rate,
  agConversionRate: raw.ag_conversion_rate,
  atConversionRate: raw.at_conversion_rate,
  maConversionRate: raw.ma_conversion_rate
});

const transformToUserStats = (raw: RawStats): UserStats => ({
  user_id: raw.user_id || '',
  user_name: raw.user_name || '',
  newClients: raw.new_clients,
  contactAttempts: raw.contact_attempts,
  effectiveContacts: raw.effective_contacts,
  scheduledVisits: raw.scheduled_visits,
  awaitingVisits: raw.awaiting_visits,
  completedVisits: raw.completed_visits,
  enrollments: raw.enrollments,
  ceConversionRate: raw.ce_conversion_rate,
  agConversionRate: raw.ag_conversion_rate,
  atConversionRate: raw.at_conversion_rate,
  maConversionRate: raw.ma_conversion_rate
});

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
      return (data as RawStats[]).map(transformToUnitStats);
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
      return (data as RawStats[]).map(transformToUserStats);
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
