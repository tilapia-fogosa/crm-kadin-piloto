
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

      console.log('Buscando estatísticas por unidade:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource
      });

      // Buscar dados agregados por unidade
      const [clientsResult, activitiesResult] = await Promise.all([
        supabase.from('clients')
          .select('unit_id, count(*)')
          .eq('active', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : '')
          .groupBy('unit_id'),
        
        supabase.from('client_activities')
          .select(`
            unit_id,
            tipo_atividade,
            count(*)
          `)
          .eq('active', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .groupBy('unit_id, tipo_atividade')
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Resultados agrupados por unidade:', {
        clients: clientsResult.data,
        activities: activitiesResult.data
      });

      // Mapear os resultados para cada unidade disponível
      const unitStats: UnitStats[] = availableUnits.map(unit => {
        const clients = clientsResult.data.find(c => c.unit_id === unit.unit_id)?.count || 0;
        const activities = activitiesResult.data.filter(a => a.unit_id === unit.unit_id);

        const contactAttempts = activities.filter(a => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).reduce((sum, a) => sum + a.count, 0);

        const effectiveContacts = activities.filter(a => 
          ['Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).reduce((sum, a) => sum + a.count, 0);

        const scheduledVisits = activities.filter(a => 
          a.tipo_atividade === 'Agendamento'
        ).reduce((sum, a) => sum + a.count, 0);

        const completedVisits = activities.filter(a => 
          a.tipo_atividade === 'Atendimento'
        ).reduce((sum, a) => sum + a.count, 0);

        const enrollments = activities.filter(a => 
          a.tipo_atividade === 'Matrícula'
        ).reduce((sum, a) => sum + a.count, 0);

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
