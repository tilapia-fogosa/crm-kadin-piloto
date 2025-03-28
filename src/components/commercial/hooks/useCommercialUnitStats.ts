
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
  selectedUnitId: string | null = null
) {
  const { availableUnits } = useUnit();
  
  console.log('Iniciando busca de estatísticas por unidade:', {
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
    availableUnits
  });

  return useQuery({
    queryKey: ['commercial-unit-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      // Get array of accessible unit IDs
      const availableUnitIds = availableUnits.map(unit => unit.unit_id);
      
      // Se uma unidade específica foi selecionada, filtra apenas por ela
      const unitFilter = selectedUnitId 
        ? [selectedUnitId]
        : availableUnitIds;

      console.log('Buscando estatísticas por unidade:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        unitFilter
      });

      // Obter IDs de clientes ativos para filtrar atividades
      const clientsQuery = supabase
        .from('clients')
        .select('id, unit_id')
        .eq('active', true)
        .in('unit_id', unitFilter);
      
      // Adicionar filtro de origem se necessário
      if (selectedSource !== 'todos') {
        clientsQuery.eq('lead_source', selectedSource);
      }
      
      const clientsResult = await clientsQuery;
      
      if (clientsResult.error) throw clientsResult.error;
      
      // Agrupar clientes por unidade para contagens
      const clientsByUnit: Record<string, number> = {};
      unitFilter.forEach(unitId => {
        clientsByUnit[unitId] = 0;
      });
      
      // Contar novos clientes por unidade no período
      const newClientsQuery = supabase
        .from('clients')
        .select('unit_id')
        .eq('active', true)
        .in('unit_id', unitFilter)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
        
      // Adicionar filtro de origem se necessário
      if (selectedSource !== 'todos') {
        newClientsQuery.eq('lead_source', selectedSource);
      }
      
      const newClientsResult = await newClientsQuery;
      if (newClientsResult.error) throw newClientsResult.error;
      
      // Contar novos clientes por unidade
      const newClientsByUnit: Record<string, number> = {};
      unitFilter.forEach(unitId => {
        newClientsByUnit[unitId] = 0;
      });
      
      newClientsResult.data.forEach(client => {
        if (client.unit_id) {
          newClientsByUnit[client.unit_id] = (newClientsByUnit[client.unit_id] || 0) + 1;
        }
      });

      // Mapear cliente IDs para usar na filtragem de atividades
      const activeClientIds = clientsResult.data.map(client => client.id);
      
      console.log(`Encontrados ${activeClientIds.length} clientes ativos para filtrar atividades`);

      // Buscar atividades de clientes ativos no período selecionado
      const activitiesQuery = supabase
        .from('client_activities')
        .select('id, tipo_atividade, unit_id, scheduled_date')
        .eq('active', true)
        .in('client_id', activeClientIds)
        .in('unit_id', unitFilter)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const activitiesResult = await activitiesQuery;
      
      if (activitiesResult.error) throw activitiesResult.error;

      console.log(`Encontradas ${activitiesResult.data.length} atividades no período`);

      // Filtrar unidades disponíveis com base no unitFilter
      const filteredUnits = availableUnits.filter(unit => unitFilter.includes(unit.unit_id));

      // Initialize stats for filtered units with zero values
      const unitStats: UnitStats[] = filteredUnits.map(unit => ({
        unit_id: unit.unit_id,
        unit_name: unit.units.name,
        newClients: newClientsByUnit[unit.unit_id] || 0,
        contactAttempts: 0,
        effectiveContacts: 0,
        scheduledVisits: 0,
        awaitingVisits: 0,
        completedVisits: 0,
        enrollments: 0,
        ceConversionRate: 0,
        agConversionRate: 0,
        atConversionRate: 0,
        maConversionRate: 0
      }));

      // Map activities to each unit
      unitStats.forEach(unitStat => {
        const unitActivities = activitiesResult.data.filter(a => a.unit_id === unitStat.unit_id);

        unitStat.contactAttempts = unitActivities.filter(a => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        unitStat.effectiveContacts = unitActivities.filter(a => 
          ['Contato Efetivo', 'Agendamento'].includes(a.tipo_atividade)
        ).length;

        unitStat.scheduledVisits = unitActivities.filter(a => 
          a.tipo_atividade === 'Agendamento'
        ).length;

        // Para visitas aguardadas, usamos agendamentos planejados para o período
        unitStat.awaitingVisits = unitActivities.filter(a => 
          a.tipo_atividade === 'Agendamento' && 
          a.scheduled_date && 
          new Date(a.scheduled_date) >= startDate && 
          new Date(a.scheduled_date) <= endDate
        ).length;

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

        unitStat.atConversionRate = unitStat.awaitingVisits > 0 
          ? (unitStat.completedVisits / unitStat.awaitingVisits) * 100 
          : 0;
          
        unitStat.maConversionRate = unitStat.completedVisits > 0 
          ? (unitStat.enrollments / unitStat.completedVisits) * 100 
          : 0;
      });

      console.log('Estatísticas calculadas por unidade:', unitStats);
      return unitStats;
    },
  });
}
