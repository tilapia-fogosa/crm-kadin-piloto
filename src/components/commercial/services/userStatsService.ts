
import { supabase } from "@/integrations/supabase/client";
import { filterActiveUsers, prepareUserStats } from "../utils/userStatsUtils";
import { UserStats } from "../types/stats.types";

/**
 * Busca perfis de usuários para unidades especificadas
 * @param unitFilter - IDs das unidades para filtrar
 * @returns Perfis de usuários únicos
 */
export const fetchUniqueUserProfiles = async (unitFilter: string[]) => {
  console.log(`Buscando perfis de usuários para ${unitFilter.length} unidades`);
  
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
  
  return uniqueUserProfiles;
};

/**
 * Busca clientes ativos criados no período selecionado
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @param unitFilter - IDs das unidades para filtrar
 * @param selectedSource - Filtro de fonte do lead
 * @returns Clientes encontrados
 */
export const fetchActiveClientsInPeriod = async (
  startDate: Date, 
  endDate: Date, 
  unitFilter: string[], 
  selectedSource: string
) => {
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
  
  return clientsResult.data;
};

/**
 * Busca todos os clientes ativos para filtragem
 * @param unitFilter - IDs das unidades para filtrar
 * @returns IDs dos clientes ativos
 */
export const fetchAllActiveClientIds = async (unitFilter: string[]) => {
  const { data: activeClients, error: activeClientsError } = await supabase
    .from('clients')
    .select('id')
    .eq('active', true)
    .in('unit_id', unitFilter);
    
  if (activeClientsError) throw activeClientsError;
  
  const activeClientIds = activeClients.map(client => client.id);
  console.log(`Total de ${activeClientIds.length} clientes ativos para filtro de atividades`);
  
  return activeClientIds;
};

/**
 * Busca atividades de clientes no período
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @param activeClientIds - IDs dos clientes ativos
 * @param unitFilter - IDs das unidades para filtrar
 * @param selectedSource - Filtro de fonte do lead
 * @returns Atividades filtradas
 */
export const fetchClientActivities = async (
  startDate: Date, 
  endDate: Date, 
  activeClientIds: string[],
  unitFilter: string[],
  selectedSource: string
) => {
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
  
  return filteredActivities;
};

/**
 * Processa dados e retorna estatísticas por usuário
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @param unitFilter - IDs das unidades para filtrar
 * @param selectedSource - Filtro de fonte do lead
 * @returns Estatísticas de usuários processadas
 */
export const getUserStats = async (
  startDate: Date,
  endDate: Date,
  unitFilter: string[],
  selectedSource: string
): Promise<UserStats[]> => {
  // Buscar perfis de usuários
  const uniqueUserProfiles = await fetchUniqueUserProfiles(unitFilter);
  
  // Buscar clientes no período
  const clientsData = await fetchActiveClientsInPeriod(startDate, endDate, unitFilter, selectedSource);
  
  // Buscar IDs de clientes ativos
  const activeClientIds = await fetchAllActiveClientIds(unitFilter);
  
  // Buscar atividades
  const filteredActivities = await fetchClientActivities(startDate, endDate, activeClientIds, unitFilter, selectedSource);

  // Inicializar estatísticas para todos os usuários encontrados
  const userStats = uniqueUserProfiles.map(userProfile => {
    // Calcular novos clientes por criador
    const newClientCount = clientsData.filter(
      client => client.created_by === userProfile.user_id
    ).length;

    // Atividades deste usuário
    const userActivities = filteredActivities.filter(
      activity => activity.created_by === userProfile.user_id
    );

    return prepareUserStats(
      userProfile,
      newClientCount,
      userActivities,
      startDate,
      endDate
    );
  });

  // Filtrar usuários sem atividades e ordenar por nome
  return filterActiveUsers(userStats);
};
