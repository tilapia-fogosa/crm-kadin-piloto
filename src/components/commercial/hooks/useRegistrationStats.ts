
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationGroup, RegistrationSourceStats } from "../types/registration-stats.types";
import { calculateTotals } from "../utils/stats.utils";
import { BaseStats } from "../types/stats.types";

export function useRegistrationStats({
  selectedSource,
  selectedMonth,
  selectedYear,
  selectedUnitId,
  availableUnitIds
}: {
  selectedSource: string;
  selectedMonth: string;
  selectedYear: string;
  selectedUnitId: string | null;
  availableUnitIds: string[];
}) {
  console.log("Fetching registration stats with params:", {
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
    availableUnitIds
  });

  const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
  const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

  const { data, isLoading, error } = useQuery({
    queryKey: ['registration-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      const unitIds = selectedUnitId ? [selectedUnitId] : availableUnitIds;
      
      console.log("Fetching registration stats for date range:", startDate, "to", endDate);
      
      const { data, error } = await supabase
        .rpc('get_registration_stats', {
          p_start_date: startDate.toISOString(),
          p_end_date: endDate.toISOString(),
          p_unit_ids: unitIds,
          p_source_id: selectedSource
        });

      if (error) {
        console.error("Error fetching registration stats:", error);
        throw error;
      }

      // Group data by registration_name
      const groupedData = data.reduce((acc: Record<string, RegistrationSourceStats[]>, curr) => {
        const { registration_name, ...rest } = curr;
        if (!acc[registration_name]) {
          acc[registration_name] = [];
        }
        acc[registration_name].push({
          registrationName: registration_name,
          leadSource: curr.lead_source,
          newClients: Number(curr.new_clients),
          contactAttempts: Number(curr.contact_attempts),
          effectiveContacts: Number(curr.effective_contacts),
          scheduledVisits: Number(curr.scheduled_visits),
          awaitingVisits: Number(curr.awaiting_visits),
          completedVisits: Number(curr.completed_visits),
          enrollments: Number(curr.enrollments),
          ceConversionRate: Number(curr.ce_conversion_rate),
          agConversionRate: Number(curr.ag_conversion_rate),
          atConversionRate: Number(curr.at_conversion_rate),
          maConversionRate: Number(curr.ma_conversion_rate),
        });
        return acc;
      }, {});

      // Convert to array of RegistrationGroup
      const registrationGroups: RegistrationGroup[] = Object.entries(groupedData).map(
        ([registrationName, sources]) => ({
          registrationName,
          sources,
          totals: calculateTotals(sources) as BaseStats
        })
      );

      console.log("Processed registration groups:", registrationGroups);
      return registrationGroups;
    }
  });

  return {
    registrationGroups: data || [],
    isLoading,
    error
  };
}
