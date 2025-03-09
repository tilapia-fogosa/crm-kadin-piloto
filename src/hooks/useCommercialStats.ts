
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Base interfaces for strong typing
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

type ViewType = 'commercial_unit_stats' | 'commercial_user_stats' | 'commercial_source_stats';

// Query options type to avoid deep inference
interface CommercialQueryOptions {
  queryKey: readonly [string, string, string | null | undefined];
  queryFn: () => Promise<RawCommercialStats[]>;
}

// Transformation function with explicit null handling
function transformStats(data: RawCommercialStats[] | null): CommercialStats[] {
  if (!data) return [];
  
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
}

// Query function with explicit return type
async function fetchCommercialStats(
  view: ViewType,
  monthYear: string,
  unitId?: string | null
): Promise<RawCommercialStats[]> {
  console.log(`Fetching ${view} data for ${monthYear}, unit: ${unitId || 'all'}`);
  
  const { data, error } = await supabase
    .from(view)
    .select('*')
    .eq('month_year', monthYear)
    .eq('unit_id', unitId || '')
    .returns<RawCommercialStats[]>();

  if (error) {
    console.error(`Error fetching ${view} data:`, error);
    throw error;
  }

  return data || [];
}

// Main hook with simplified query configuration
export function useCommercialStats(month: string, year: string, unitId?: string | null) {
  const monthYear = `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`;

  // Define query options explicitly to avoid type inference issues
  const unitStatsOptions: CommercialQueryOptions = {
    queryKey: ['commercial-unit-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_unit_stats', monthYear, unitId),
  };

  const userStatsOptions: CommercialQueryOptions = {
    queryKey: ['commercial-user-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_user_stats', monthYear, unitId),
  };

  const sourceStatsOptions: CommercialQueryOptions = {
    queryKey: ['commercial-source-stats', monthYear, unitId],
    queryFn: () => fetchCommercialStats('commercial_source_stats', monthYear, unitId),
  };

  const unitStats = useQuery<RawCommercialStats[], Error>(unitStatsOptions);
  const userStats = useQuery<RawCommercialStats[], Error>(userStatsOptions);
  const sourceStats = useQuery<RawCommercialStats[], Error>(sourceStatsOptions);

  return {
    unitStats: transformStats(unitStats.data),
    userStats: transformStats(userStats.data),
    sourceStats: transformStats(sourceStats.data),
    isLoading: unitStats.isLoading || userStats.isLoading || sourceStats.isLoading
  };
}
