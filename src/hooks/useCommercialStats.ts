
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, endOfMonth } from "date-fns";

interface CommercialStats {
  unit_id: string;
  unit_name: string;
  total_leads: number;
  total_attendances: number;
  total_enrollments: number;
  conversion_rate: number;
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
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());

      if (error) throw error;
      return data as CommercialStats[];
    }
  });
}
