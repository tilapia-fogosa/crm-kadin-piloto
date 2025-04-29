
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationGroup, RegistrationSourceStats } from "../types/registration-stats.types";
import { calculateTotals } from "../utils/stats.utils";
import { BaseStats } from "../types/stats.types";
import { startOfMonth, endOfMonth } from "date-fns";
import { createSafeDate } from "@/utils/date";

export function useRegistrationStats({
  selectedSources,
  selectedMonths,
  selectedYears,
  selectedUnitIds,
  availableUnitIds
}: {
  selectedSources: string[];
  selectedMonths: string[];
  selectedYears: string[];
  selectedUnitIds: string[];
  availableUnitIds: string[];
}) {
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

  // Calcular intervalos de datas geral
  const startDate = dateRanges.reduce((min, current) => 
    current.startDate < min ? current.startDate : min, dateRanges[0].startDate);
  
  const endDate = dateRanges.reduce((max, current) => 
    current.endDate > max ? current.endDate : max, dateRanges[0].endDate);

  // Determinar as unidades para filtro
  const unitIds = selectedUnitIds.includes('todos') ? availableUnitIds : selectedUnitIds;
  
  // Determinar a fonte para filtro (usar 'todos' se incluído ou array vazio)
  const sourceId = selectedSources.includes('todos') ? 'todos' : selectedSources.join(',');

  const { data, isLoading, error } = useQuery({
    queryKey: ['registration-stats', sourceId, selectedMonths.join(','), selectedYears.join(','), selectedUnitIds.join(',')],
    queryFn: async () => {
      console.log('Fetching registration stats', {
        startDate,
        endDate,
        unitIds,
        sourceId
      });
      
      const { data, error } = await supabase.rpc('get_registration_stats', {
        p_start_date: startDate.toISOString(),
        p_end_date: endDate.toISOString(),
        p_unit_ids: unitIds,
        p_source_id: sourceId
      });

      if (error) {
        console.error('Error fetching registration stats:', error);
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

      console.log('Processed registration groups:', registrationGroups);
      return registrationGroups;
    }
  });

  return {
    registrationGroups: data || [],
    isLoading,
    error
  };
}
