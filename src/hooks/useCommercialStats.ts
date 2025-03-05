
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

export interface CommercialUnitStats {
  unit_id: string;
  unit_name: string;
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
}

export function useCommercialUnitStats(selectedMonth: Date) {
  return useQuery({
    queryKey: ['commercial-unit-stats', selectedMonth],
    queryFn: async () => {
      const startDate = startOfMonth(selectedMonth);
      const endDate = endOfMonth(selectedMonth);

      const { data, error } = await supabase
        .from('commercial_unit_stats')
        .select('*')
        .gte('month_year', startDate.toISOString())
        .lte('month_year', endDate.toISOString());

      if (error) throw error;
      return data as CommercialUnitStats[];
    }
  });
}
