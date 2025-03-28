
import { UserStats } from "../types/stats.types";

/**
 * Processa atividades para calcular estatísticas do usuário
 * @param userActivities - Atividades do usuário
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @returns Estatísticas calculadas
 */
export const calculateUserActivityStats = (
  userActivities: any[],
  startDate: Date,
  endDate: Date
) => {
  // Log para rastreamento do processamento
  console.log(`Calculando estatísticas para ${userActivities.length} atividades de usuário`);

  const stats = {
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
  };

  // Calcular estatísticas de atividades
  stats.contactAttempts = userActivities.filter(activity => 
    ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;

  stats.effectiveContacts = userActivities.filter(activity => 
    ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
  ).length;

  stats.scheduledVisits = userActivities.filter(activity => 
    activity.tipo_atividade === 'Agendamento'
  ).length;

  // Para visitas aguardadas, usamos agendamentos planejados para o período
  stats.awaitingVisits = userActivities.filter(activity => 
    activity.tipo_atividade === 'Agendamento' && 
    activity.scheduled_date && 
    new Date(activity.scheduled_date) >= startDate && 
    new Date(activity.scheduled_date) <= endDate
  ).length;

  stats.completedVisits = userActivities.filter(activity => 
    activity.tipo_atividade === 'Atendimento'
  ).length;

  stats.enrollments = userActivities.filter(activity => 
    activity.tipo_atividade === 'Matrícula'
  ).length;

  // Calcular taxas de conversão
  stats.ceConversionRate = stats.contactAttempts > 0 
    ? (stats.effectiveContacts / stats.contactAttempts) * 100 
    : 0;

  stats.agConversionRate = stats.effectiveContacts > 0 
    ? (stats.scheduledVisits / stats.effectiveContacts) * 100 
    : 0;

  stats.atConversionRate = stats.awaitingVisits > 0 
    ? (stats.completedVisits / stats.awaitingVisits) * 100 
    : 0;
    
  stats.maConversionRate = stats.completedVisits > 0 
    ? (stats.enrollments / stats.completedVisits) * 100 
    : 0;

  return stats;
};

/**
 * Prepara estatísticas de um usuário combinando seus dados pessoais com estatísticas de atividades
 * @param userProfile - Perfil do usuário
 * @param newClientCount - Contagem de novos clientes
 * @param userActivities - Atividades do usuário
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @returns Estatísticas completas do usuário
 */
export const prepareUserStats = (
  userProfile: any,
  newClientCount: number,
  userActivities: any[],
  startDate: Date,
  endDate: Date
): UserStats => {
  // Calcular estatísticas de atividades
  const activityStats = calculateUserActivityStats(userActivities, startDate, endDate);

  // Combinar com dados de perfil e contagem de clientes
  return {
    user_id: userProfile.user_id,
    user_name: userProfile.profiles.full_name,
    newClients: newClientCount,
    ...activityStats
  };
};

/**
 * Filtra usuários ativos com base em suas estatísticas
 * @param userStats - Estatísticas de usuários
 * @returns Lista filtrada e ordenada de usuários ativos
 */
export const filterActiveUsers = (userStats: UserStats[]): UserStats[] => {
  return userStats
    .filter(user => user.newClients > 0 || user.contactAttempts > 0)
    .sort((a, b) => a.user_name.localeCompare(b.user_name));
};
