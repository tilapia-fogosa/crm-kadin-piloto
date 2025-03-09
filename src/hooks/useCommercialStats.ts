
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Base interfaces
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

interface RawCommercialStats {
  unit_id?: string;
  id?: string;
  name: string;
  month_year: string;
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

// Type-safe transformation function
const transformStats = (data: RawCommercialStats[]): CommercialStats[] => {
  return data.map(stat => ({
    id: stat.unit_id || stat.id || '',
    name: stat.name,
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

// Type-safe query function
const fetchCommercialStats = async (
  view: 'commercial_unit_stats' | 'commercial_user_stats' | 'commercial_source_stats',
  monthYear: string,
  unitId?: string | null
): Promise<RawCommercialStats[]> => {
  console.log(`Fetching ${view}:`, { monthYear, unitId });
  
  let query = supabase
    .from(view)
    .select('*')
    .eq('month_year', monthYear);

  if (unitId) {
    query = query.eq('unit_id', unitId);
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${view}:`, error);
    throw error;
  }

  console.log(`${view} data:`, data);
  return data;
};

export const useCommercialStats = (month: string, year: string, unitId?: string | null) => {
  console.log('Fetching stats with unit_id:', unitId);
  
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const monthYear = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-01`;

  const { data: unitStatsData, isLoading: isLoadingUnit } = useQuery<RawCommercialStats[], Error>({
    queryKey: ['commercial-unit-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_unit_stats', monthYear, unitId)
  });

  const { data: userStatsData, isLoading: isLoadingUser } = useQuery<RawCommercialStats[], Error>({
    queryKey: ['commercial-user-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_user_stats', monthYear, unitId)
  });

  const { data: sourceStatsData, isLoading: isLoadingSource } = useQuery<RawCommercialStats[], Error>({
    queryKey: ['commercial-source-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_source_stats', monthYear, unitId)
  });

  return {
    unitStats: unitStatsData ? transformStats(unitStatsData) : [],
    userStats: userStatsData ? transformStats(userStatsData) : [],
    sourceStats: sourceStatsData ? transformStats(sourceStatsData) : [],
    isLoading: isLoadingUnit || isLoadingUser || isLoadingSource
  };
};
