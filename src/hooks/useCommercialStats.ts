
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

export const useCommercialStats = (month: string, year: string, unitId?: string | null) => {
  console.log('Fetching stats with unit_id:', unitId);
  
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const monthYear = `${yearNum}-${String(monthNum + 1).padStart(2, '0')}-01`;

  const { data: unitStatsData, isLoading: isLoadingUnit } = useQuery({
    queryKey: ['commercial-unit-stats', monthYear, unitId],
    queryFn: async () => {
      console.log('Fetching unit stats:', { monthYear, unitId });
      
      let query = supabase
        .from('commercial_unit_stats')
        .select('*')
        .eq('month_year', monthYear);

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching unit stats:', error);
        throw error;
      }

      return data.map(stat => ({
        id: stat.unit_id,
        name: stat.unit_name,
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
  });

  const { data: userStatsData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['commercial-user-stats', monthYear, unitId],
    queryFn: async () => {
      console.log('Fetching user stats:', { monthYear, unitId });
      
      let query = supabase
        .from('commercial_user_stats')
        .select('*')
        .eq('month_year', monthYear);

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user stats:', error);
        throw error;
      }

      return data.map(stat => ({
        id: stat.id,
        name: stat.user_name,
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
  });

  const { data: sourceStatsData, isLoading: isLoadingSource } = useQuery({
    queryKey: ['commercial-source-stats', monthYear, unitId],
    queryFn: async () => {
      console.log('Fetching source stats:', { monthYear, unitId });
      
      let query = supabase
        .from('commercial_source_stats')
        .select('*')
        .eq('month_year', monthYear);

      if (unitId) {
        query = query.eq('unit_id', unitId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching source stats:', error);
        throw error;
      }

      return data.map(stat => ({
        id: stat.id,
        name: stat.source_name,
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
  });

  return {
    unitStats: unitStatsData || [],
    userStats: userStatsData || [],
    sourceStats: sourceStatsData || [],
    isLoading: isLoadingUnit || isLoadingUser || isLoadingSource
  };
};
