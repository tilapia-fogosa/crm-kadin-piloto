
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";
import type { UnitStats, UserStats } from "../types/stats.types";

interface UseCommercialStatsProps {
  selectedSources: string[];
  selectedMonths: string[];
  selectedYears: string[];
  selectedUnitIds: string[];
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
  selectedSources,
  selectedMonths,
  selectedYears,
  selectedUnitIds,
  availableUnitIds
}: UseCommercialStatsProps) {
  console.log('useCommercialStats hook iniciado com params:', {
    selectedSources,
    selectedMonths,
    selectedYears,
    selectedUnitIds,
    availableUnitIds
  });

  // Coletar todas as combinações de mês/ano solicitadas
  const dateRanges = [];
  for (const yearStr of selectedYears.includes('todos') ? [new Date().getFullYear().toString()] : selectedYears) {
    const year = parseInt(yearStr);
    for (const monthStr of selectedMonths.includes('todos') ? Array.from({ length: 12 }, (_, i) => i.toString()) : selectedMonths) {
      const month = parseInt(monthStr);
      const startDate = startOfMonth(createSafeDate(year, month));
      const endDate = endOfMonth(createSafeDate(year, month));
      dateRanges.push({ startDate, endDate });
    }
  }

  // Se não houver combinações, usar o mês atual como fallback
  if (dateRanges.length === 0) {
    const currentDate = new Date();
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    dateRanges.push({ startDate, endDate });
  }

  // Determinar as unidades para filtro
  const unitIds = selectedUnitIds.includes('todos') ? availableUnitIds : selectedUnitIds;
  
  // Determinar a fonte para filtro (usar 'todos' se incluído ou array vazio)
  const sourceId = selectedSources.includes('todos') ? 'todos' : selectedSources.join(',');

  // Calcular intervalos de datas geral
  const minDate = dateRanges.reduce((min, current) => 
    current.startDate < min ? current.startDate : min, dateRanges[0].startDate);
  
  const maxDate = dateRanges.reduce((max, current) => 
    current.endDate > max ? current.endDate : max, dateRanges[0].endDate);

  // Query para estatísticas por unidade
  const unitStatsQuery = useQuery({
    queryKey: ['commercial-unit-stats', sourceId, selectedMonths.join(','), selectedYears.join(','), selectedUnitIds.join(',')],
    queryFn: async () => {
      console.log('Buscando estatísticas por unidade:', {
        minDate,
        maxDate,
        unitIds,
        sourceId
      });

      const { data, error } = await supabase.rpc('get_commercial_unit_stats', {
        p_start_date: minDate.toISOString(),
        p_end_date: maxDate.toISOString(),
        p_unit_ids: unitIds,
        p_source_id: sourceId
      });

      if (error) throw error;
      return (data as RawStats[]).map(transformToUnitStats);
    }
  });

  // Query para estatísticas por usuário
  const userStatsQuery = useQuery({
    queryKey: ['commercial-user-stats', sourceId, selectedMonths.join(','), selectedYears.join(','), selectedUnitIds.join(',')],
    queryFn: async () => {
      console.log('Buscando estatísticas por usuário:', {
        minDate,
        maxDate,
        unitIds,
        sourceId
      });

      const { data, error } = await supabase.rpc('get_commercial_user_stats', {
        p_start_date: minDate.toISOString(),
        p_end_date: maxDate.toISOString(),
        p_unit_ids: unitIds,
        p_source_id: sourceId
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
