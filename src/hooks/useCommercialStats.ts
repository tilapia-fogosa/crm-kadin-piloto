
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";

interface CommercialStats {
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
  month_year: string;
}

interface UnitStats extends CommercialStats {
  unit_name: string;
  unit_id: string;
}

interface UserStats extends CommercialStats {
  user_name: string;
  user_id: string;
}

interface SourceStats extends CommercialStats {
  source_name: string;
  lead_source: string;
}

export function useCommercialStats() {
  const { selectedUnitId } = useUnit();

  const { data: unitStats, isLoading: isLoadingUnitStats } = useQuery({
    queryKey: ['commercial-unit-stats', selectedUnitId],
    queryFn: async () => {
      console.log('Fetching unit stats');
      const { data, error } = await supabase
        .from('commercial_unit_stats')
        .select('*')
        .eq('unit_id', selectedUnitId)
        .order('month_year', { ascending: false });

      if (error) {
        console.error('Error fetching unit stats:', error);
        throw error;
      }

      return data as UnitStats[];
    },
    enabled: !!selectedUnitId
  });

  const { data: userStats, isLoading: isLoadingUserStats } = useQuery({
    queryKey: ['commercial-user-stats', selectedUnitId],
    queryFn: async () => {
      console.log('Fetching user stats');
      const { data, error } = await supabase
        .from('commercial_user_stats')
        .select('*')
        .order('month_year', { ascending: false });

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data as UserStats[];
    },
    enabled: !!selectedUnitId
  });

  const { data: sourceStats, isLoading: isLoadingSourceStats } = useQuery({
    queryKey: ['commercial-source-stats', selectedUnitId],
    queryFn: async () => {
      console.log('Fetching source stats');
      const { data, error } = await supabase
        .from('commercial_source_stats')
        .select('*')
        .order('month_year', { ascending: false });

      if (error) {
        console.error('Error fetching source stats:', error);
        throw error;
      }

      return data as SourceStats[];
    },
    enabled: !!selectedUnitId
  });

  return {
    unitStats,
    userStats,
    sourceStats,
    isLoading: isLoadingUnitStats || isLoadingUserStats || isLoadingSourceStats
  };
}
