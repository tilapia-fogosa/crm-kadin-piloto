
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DailyStats } from "../../kanban/types/activity-dashboard.types";
import { useUnit } from "@/contexts/UnitContext";

// Interface específica para estatísticas por usuário
export interface UserStats extends Omit<DailyStats, 'date'> {
  user_id: string;
  user_name: string;
}

export function useCommercialUserStats(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string | null
) {
  const { availableUnits } = useUnit();
  
  console.log('Iniciando busca de estatísticas por usuário:', {
    selectedSource,
    selectedMonth,
    selectedYear,
    selectedUnitId,
    availableUnits
  });

  return useQuery({
    queryKey: ['commercial-user-stats', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      const startDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), 1);
      const endDate = new Date(parseInt(selectedYear), parseInt(selectedMonth) + 1, 0);

      // Get array of accessible unit IDs
      const availableUnitIds = availableUnits.map(unit => unit.unit_id);
      
      // Se uma unidade específica foi selecionada, filtra apenas por ela
      const unitFilter = selectedUnitId 
        ? [selectedUnitId]
        : availableUnitIds;

      console.log('Buscando estatísticas por usuário:', { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        selectedSource,
        unitFilter
      });

      // Buscar perfis de usuários únicos para as unidades acessíveis
      const { data: userProfiles, error: profilesError } = await supabase
        .from('unit_users')
        .select(`
          user_id,
          profiles!inner (
            id,
            full_name
          )
        `)
        .eq('active', true)
        .in('unit_id', unitFilter);

      if (profilesError) throw profilesError;

      // Deduplicar userProfiles por user_id para garantir que cada usuário apareça apenas uma vez
      const uniqueUserProfiles = Array.from(
        new Map(userProfiles.map(profile => [profile.user_id, profile])).values()
      );

      console.log(`Encontrados ${userProfiles.length} perfis de usuários, ${uniqueUserProfiles.length} perfis únicos`);

      // Mapear IDs de usuários únicos
      const userIds = uniqueUserProfiles.map(up => up.user_id);

      // Buscar clientes ativos criados no período e unidade selecionados
      const clientsQuery = supabase
        .from('clients')
        .select('id, created_by')
        .eq('active', true)
        .in('unit_id', unitFilter)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      // Adicionar filtro de origem se necessário
      if (selectedSource !== 'todos') {
        clientsQuery.eq('lead_source', selectedSource);
      }
      
      const clientsResult = await clientsQuery;
      
      if (clientsResult.error) throw clientsResult.error;
      
      console.log(`Encontrados ${clientsResult.data.length} clientes ativos no período`);

      // Buscar atividades de clientes ativos no período
      // Primeiro obtemos todos os clients ativos
      const { data: activeClients, error: activeClientsError } = await supabase
        .from('clients')
        .select('id')
        .eq('active', true)
        .in('unit_id', unitFilter);
        
      if (activeClientsError) throw activeClientsError;
      
      const activeClientIds = activeClients.map(client => client.id);
      console.log(`Total de ${activeClientIds.length} clientes ativos para filtro de atividades`);
      
      // Agora buscamos as atividades desses clientes
      const activitiesQuery = supabase
        .from('client_activities')
        .select(`
          id, 
          tipo_atividade, 
          client_id, 
          created_by,
          scheduled_date,
          clients!inner(
            id,
            lead_source
          )
        `)
        .eq('active', true)
        .in('client_id', activeClientIds)
        .in('unit_id', unitFilter)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());
      
      const activitiesResult = await activitiesQuery;
      
      if (activitiesResult.error) throw activitiesResult.error;
      
      // Filtrar atividades pelo lead_source se necessário
      const filteredActivities = selectedSource !== 'todos'
        ? activitiesResult.data.filter(activity => 
            activity.clients?.lead_source === selectedSource
          )
        : activitiesResult.data;

      console.log(`Atividades encontradas: ${activitiesResult.data.length}, após filtro: ${filteredActivities.length}`);

      // Inicializar estatísticas para todos os usuários encontrados
      const userStats: UserStats[] = uniqueUserProfiles.map(userProfile => ({
        user_id: userProfile.user_id,
        user_name: userProfile.profiles.full_name,
        newClients: 0,
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

      // Mapear resultados para cada usuário
      userStats.forEach(userStat => {
        // Calcular novos clientes por criador
        userStat.newClients = clientsResult.data.filter(
          client => client.created_by === userStat.user_id
        ).length;

        // Atividades deste usuário
        const userActivities = filteredActivities.filter(
          activity => activity.created_by === userStat.user_id
        );

        userStat.contactAttempts = userActivities.filter(activity => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length;

        userStat.effectiveContacts = userActivities.filter(activity => 
          ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length;

        userStat.scheduledVisits = userActivities.filter(activity => 
          activity.tipo_atividade === 'Agendamento'
        ).length;

        // Para visitas aguardadas, usamos agendamentos planejados para o período
        userStat.awaitingVisits = filteredActivities.filter(activity => 
          activity.created_by === userStat.user_id &&
          activity.tipo_atividade === 'Agendamento' && 
          activity.scheduled_date && 
          new Date(activity.scheduled_date) >= startDate && 
          new Date(activity.scheduled_date) <= endDate
        ).length;

        userStat.completedVisits = userActivities.filter(activity => 
          activity.tipo_atividade === 'Atendimento'
        ).length;

        userStat.enrollments = userActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;

        // Calcular taxas de conversão
        userStat.ceConversionRate = userStat.contactAttempts > 0 
          ? (userStat.effectiveContacts / userStat.contactAttempts) * 100 
          : 0;

        userStat.agConversionRate = userStat.effectiveContacts > 0 
          ? (userStat.scheduledVisits / userStat.effectiveContacts) * 100 
          : 0;

        userStat.atConversionRate = userStat.awaitingVisits > 0 
          ? (userStat.completedVisits / userStat.awaitingVisits) * 100 
          : 0;
          
        userStat.maConversionRate = userStat.completedVisits > 0 
          ? (userStat.enrollments / userStat.completedVisits) * 100 
          : 0;
      });

      // Filtrar usuários sem atividades e ordenar por nome
      const activeUserStats = userStats
        .filter(user => user.newClients > 0 || user.contactAttempts > 0)
        .sort((a, b) => a.user_name.localeCompare(b.user_name));

      console.log(`Estatísticas calculadas por usuário: ${activeUserStats.length} usuários ativos`);
      return activeUserStats;
    },
  });
}
