
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { useUnit } from "@/contexts/UnitContext";

// Interface específica para stats por unidade
export interface UnitStats extends Omit<DailyStats, 'date'> {
  unit_id: string;
  unit_name: string;
}

export function useCommercialUnitStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
) {
  const { availableUnits } = useUnit();
  
  console.log('Iniciando busca de estatísticas por unidade:', {
    selectedSource,
    selectedMonth,
    selectedYear,
    availableUnits
  });

  return useQuery({
    queryKey: ['commercial-unit-stats', selectedSource, selectedMonth, selectedYear],
    queryFn: async () => {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      // Get array of accessible unit IDs
      const availableUnitIds = availableUnits.map(unit => unit.unit_id);

      console.log('Buscando estatísticas por unidade:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        availableUnitIds
      });

      // Buscar dados agregados por unidade, filtrando apenas unidades acessíveis
      const [clientsResult, activitiesResult] = await Promise.all([
        supabase
          .from('clients')
          .select('unit_id')
          .eq('active', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .in('unit_id', availableUnitIds)
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase
          .from('client_activities')
          .select('unit_id, tipo_atividade')
          .eq('active', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .in('unit_id', availableUnitIds)
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Resultados filtrados por unidades acessíveis:', {
        clients: clientsResult.data,
        activities: activitiesResult.data
      });

      // Mapear os resultados para cada unidade disponível
      const unitStats: UnitStats[] = availableUnits.map(unit => {
        const clients = clientsResult.data.filter(c => c.unit_id === unit.unit_id).length;
        const activities = activitiesResult.data.filter(a => a.unit_id === unit.unit_id);

        const contactAttempts = activities.filter(a => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        const effectiveContacts = activities.filter(a => 
          ['Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        const scheduledVisits = activities.filter(a => 
          a.tipo_atividade === 'Agendamento'
        ).length;

        const completedVisits = activities.filter(a => 
          a.tipo_atividade === 'Atendimento'
        ).length;

        const enrollments = activities.filter(a => 
          a.tipo_atividade === 'Matrícula'
        ).length;

        return {
          unit_id: unit.unit_id,
          unit_name: unit.units.name,
          newClients: Number(clients),
          contactAttempts,
          effectiveContacts,
          scheduledVisits,
          awaitingVisits: scheduledVisits, // Consideramos agendadas como aguardando
          completedVisits,
          enrollments,
          ceConversionRate: contactAttempts > 0 ? (effectiveContacts / contactAttempts) * 100 : 0,
          agConversionRate: effectiveContacts > 0 ? (scheduledVisits / effectiveContacts) * 100 : 0,
          atConversionRate: scheduledVisits > 0 ? (completedVisits / scheduledVisits) * 100 : 0
        };
      });

      console.log('Estatísticas calculadas por unidade:', unitStats);
      return unitStats;
    },
  });
}
