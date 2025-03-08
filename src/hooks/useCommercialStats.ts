
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CommercialStats {
  id: string;
  name: string;
  newClients: number;
  contactAttempts: number;
  effectiveContacts: number;
  ceConversionRate: number;
  scheduledVisits: number;
  agConversionRate: number;
  awaitingVisits: number;
  completedVisits: number;
  atConversionRate: number;
  enrollments: number;
}

interface StatsResponse {
  unit_id?: string;
  unit_name?: string;
  user_id?: string;
  user_name?: string;
  lead_source?: string;
  source_name?: string;
  new_clients: number;
  contact_attempts: number;
  effective_contacts: number;
  ce_conversion_rate: number;
  scheduled_visits: number;
  ag_conversion_rate: number;
  awaiting_visits: number;
  completed_visits: number;
  at_conversion_rate: number;
  enrollments: number;
}

const transformStats = (stats: StatsResponse[]): CommercialStats[] => {
  return stats.map(stat => ({
    id: stat.unit_id || stat.user_id || stat.lead_source || '',
    name: stat.unit_name || stat.user_name || stat.source_name || '',
    newClients: stat.new_clients,
    contactAttempts: stat.contact_attempts,
    effectiveContacts: stat.effective_contacts,
    ceConversionRate: stat.ce_conversion_rate,
    scheduledVisits: stat.scheduled_visits,
    agConversionRate: stat.ag_conversion_rate,
    awaitingVisits: stat.awaiting_visits,
    completedVisits: stat.completed_visits,
    atConversionRate: stat.at_conversion_rate,
    enrollments: stat.enrollments
  }));
};

export const useCommercialStats = (month: string, year: string) => {
  const { data: unitStatsData, isLoading: isLoadingUnit } = useQuery({
    queryKey: ['commercial-unit-stats', month, year],
    queryFn: async () => {
      console.log('Fetching unit stats:', { month, year });
      
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (isNaN(monthNum) || isNaN(yearNum)) {
        console.error('Invalid month or year values:', { month, year });
        throw new Error('Invalid month or year values');
      }

      const { data, error } = await supabase
        .from('commercial_unit_stats')
        .select('*')
        .eq('month_year', `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-01`);

      if (error) {
        console.error('Error fetching unit stats:', error);
        throw error;
      }

      return transformStats(data);
    }
  });

  const { data: userStatsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['commercial-user-stats', month, year],
    queryFn: async () => {
      console.log('Fetching user stats:', { month, year });
      
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      const { data, error } = await supabase
        .from('commercial_user_stats')
        .select('*')
        .eq('month_year', `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-01`);

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return transformStats(data);
    }
  });

  const { data: sourceStatsData, isLoading: isLoadingSource } = useQuery({
    queryKey: ['commercial-source-stats', month, year],
    queryFn: async () => {
      console.log('Fetching source stats:', { month, year });
      
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);

      const { data, error } = await supabase
        .from('commercial_source_stats')
        .select('*')
        .eq('month_year', `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-01`);

      if (error) {
        console.error('Error fetching source stats:', error);
        throw error;
      }

      return transformStats(data);
    }
  });

  return {
    unitStats: unitStatsData || [],
    userStats: userStatsData || [],
    sourceStats: sourceStatsData || [],
    isLoading: isLoadingUnit || isLoadingUser || isLoadingSource
  };
};
