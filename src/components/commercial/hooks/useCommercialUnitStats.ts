
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
          .eq(selectedSource !== 'todos' ? 'lead_source' : '', selectedSource !== 'todos' ? selectedSource : ''),
        
        supabase
          .from('client_activities')
          .select('unit_id, tipo_atividade')
          .eq('active', true)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
      ]);

      if (clientsResult.error) throw clientsResult.error;
      if (activitiesResult.error) throw activitiesResult.error;

      console.log('Dados brutos obtidos:', {
        clients: clientsResult.data,
        activities: activitiesResult.data
      });

      // Inicializar stats para todas as unidades disponíveis com valores zerados
      const unitStats: UnitStats[] = availableUnits.map(unit => ({
        unit_id: unit.unit_id,
        unit_name: unit.units.name,
        newClients: 0,
        contactAttempts: 0,
        effectiveContacts: 0,
        scheduledVisits: 0,
        awaitingVisits: 0,
        completedVisits: 0,
        enrollments: 0,
        ceConversionRate: 0,
        agConversionRate: 0,
        atConversionRate: 0
      }));

      // Mapear os resultados para cada unidade
      unitStats.forEach(unitStat => {
        const unitClients = clientsResult.data.filter(c => c.unit_id === unitStat.unit_id).length;
        const unitActivities = activitiesResult.data.filter(a => a.unit_id === unitStat.unit_id);

        unitStat.newClients = unitClients;
        unitStat.contactAttempts = unitActivities.filter(a => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        unitStat.effectiveContacts = unitActivities.filter(a => 
          ['Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        unitStat.scheduledVisits = unitActivities.filter(a => 
          a.tipo_atividade === 'Agendamento'
        ).length;

        unitStat.awaitingVisits = unitStat.scheduledVisits;

        unitStat.completedVisits = unitActivities.filter(a => 
          a.tipo_atividade === 'Atendimento'
        ).length;

        unitStat.enrollments = unitActivities.filter(a => 
          a.tipo_atividade === 'Matrícula'
        ).length;

        // Calcular taxas de conversão
        unitStat.ceConversionRate = unitStat.contactAttempts > 0 
          ? (unitStat.effectiveContacts / unitStat.contactAttempts) * 100 
          : 0;

        unitStat.agConversionRate = unitStat.effectiveContacts > 0 
          ? (unitStat.scheduledVisits / unitStat.effectiveContacts) * 100 
          : 0;

        unitStat.atConversionRate = unitStat.scheduledVisits > 0 
          ? (unitStat.completedVisits / unitStat.scheduledVisits) * 100 
          : 0;
      });

      console.log('Estatísticas calculadas por unidade:', unitStats);
      return unitStats;
    },
  });
}
