
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getDaysInMonth, getMonthDateRange } from "../../utils/v2/dateUtils";
import type { DailyStatsV2 } from "../../types/v2/activity-dashboard-v2.types";

/**
 * Hook para buscar estatísticas de atividades com abordagem otimizada
 */
export function useActivityStatsV2(
  selectedSource: string,
  selectedMonth: string,
  selectedYear: string,
  selectedUnitId: string
) {
  return useQuery({
    queryKey: ['activity-stats-v2', selectedSource, selectedMonth, selectedYear, selectedUnitId],
    queryFn: async () => {
      // Converter strings para números
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      
      console.log(`[V2] Buscando estatísticas para: Mês=${month}, Ano=${year}, Unidade=${selectedUnitId}, Origem=${selectedSource}`);
      
      // Obter intervalo de datas para o mês/ano selecionado
      const { startISO, endISO } = getMonthDateRange(year, month);
      
      // Gerar todos os dias do mês
      const daysInMonth = getDaysInMonth(year, month);
      
      // 1. Buscar novos clientes criados no período
      console.log(`[V2] Buscando novos clientes entre ${startISO} e ${endISO}`);
      
      const clientsQuery = supabase
        .from('clients')
        .select('id, created_at, unit_id')
        .eq('active', true)
        .gte('created_at', startISO)
        .lte('created_at', endISO);
      
      // Aplicar filtro de unidade se selecionado
      if (selectedUnitId !== 'todas') {
        clientsQuery.eq('unit_id', selectedUnitId);
      }
      
      // Aplicar filtro de origem se selecionado
      if (selectedSource !== 'todos') {
        clientsQuery.eq('lead_source', selectedSource);
      }
      
      const { data: newClients, error: clientsError } = await clientsQuery;
      
      if (clientsError) {
        console.error('[V2] Erro ao buscar novos clientes:', clientsError);
        throw clientsError;
      }
      
      console.log(`[V2] Encontrados ${newClients.length} novos clientes no período`);
      
      // 2. Buscar atividades no período
      console.log(`[V2] Buscando atividades entre ${startISO} e ${endISO}`);
      
      const activitiesQuery = supabase
        .from('client_activities')
        .select(`
          id, 
          tipo_atividade, 
          created_at, 
          scheduled_date,
          unit_id,
          clients!inner(
            id,
            lead_source
          )
        `)
        .eq('active', true)
        .gte('created_at', startISO)
        .lte('created_at', endISO);
      
      // Aplicar filtro de unidade se selecionado
      if (selectedUnitId !== 'todas') {
        activitiesQuery.eq('unit_id', selectedUnitId);
      }
      
      const { data: activities, error: activitiesError } = await activitiesQuery;
      
      if (activitiesError) {
        console.error('[V2] Erro ao buscar atividades:', activitiesError);
        throw activitiesError;
      }
      
      // Filtrar atividades por origem se necessário
      const filteredActivities = selectedSource !== 'todos'
        ? activities.filter(activity => activity.clients?.lead_source === selectedSource)
        : activities;
      
      console.log(`[V2] Encontradas ${filteredActivities.length} atividades no período`);
      
      // 3. Buscar visitas aguardadas no período (scheduled_date dentro do mês)
      console.log(`[V2] Buscando visitas aguardadas para o período`);
      
      const awaitingVisitsQuery = supabase
        .from('client_activities')
        .select(`
          id, 
          scheduled_date,
          unit_id,
          clients!inner(
            id,
            lead_source
          )
        `)
        .eq('active', true)
        .eq('tipo_atividade', 'Agendamento')
        .gte('scheduled_date', startISO)
        .lte('scheduled_date', endISO);
      
      // Aplicar filtro de unidade se selecionado
      if (selectedUnitId !== 'todas') {
        awaitingVisitsQuery.eq('unit_id', selectedUnitId);
      }
      
      const { data: awaitingVisits, error: awaitingError } = await awaitingVisitsQuery;
      
      if (awaitingError) {
        console.error('[V2] Erro ao buscar visitas aguardadas:', awaitingError);
        throw awaitingError;
      }
      
      // Filtrar visitas aguardadas por origem se necessário
      const filteredAwaitingVisits = selectedSource !== 'todos'
        ? awaitingVisits.filter(activity => activity.clients?.lead_source === selectedSource)
        : awaitingVisits;
      
      console.log(`[V2] Encontradas ${filteredAwaitingVisits.length} visitas aguardadas no período`);
      
      // 4. Gerar estatísticas diárias
      // Inicializar array de resultados para todos os dias do mês
      const dailyStats: DailyStatsV2[] = daysInMonth.map(date => {
        const dateISO = date.toISOString();
        
        // Filtrar novos clientes do dia
        const dayClients = newClients.filter(client => {
          const clientDate = new Date(client.created_at);
          return clientDate.getUTCFullYear() === date.getUTCFullYear() 
                 && clientDate.getUTCMonth() === date.getUTCMonth() 
                 && clientDate.getUTCDate() === date.getUTCDate();
        });
        
        // Filtrar atividades do dia
        const dayActivities = filteredActivities.filter(activity => {
          const activityDate = new Date(activity.created_at);
          return activityDate.getUTCFullYear() === date.getUTCFullYear() 
                 && activityDate.getUTCMonth() === date.getUTCMonth() 
                 && activityDate.getUTCDate() === date.getUTCDate();
        });
        
        // Calcular estatísticas de contatos
        const contactAttempts = dayActivities.filter(activity => 
          ['Tentativa de Contato', 'Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length;
        
        const effectiveContacts = dayActivities.filter(activity => 
          ['Contato Efetivo', 'Agendamento'].includes(activity.tipo_atividade)
        ).length;
        
        const scheduledVisits = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Agendamento'
        ).length;
        
        // Calcular visitas aguardadas para o dia
        const dayAwaitingVisits = filteredAwaitingVisits.filter(activity => {
          const scheduledDate = new Date(activity.scheduled_date);
          return scheduledDate.getUTCFullYear() === date.getUTCFullYear() 
                 && scheduledDate.getUTCMonth() === date.getUTCMonth() 
                 && scheduledDate.getUTCDate() === date.getUTCDate();
        });
        
        const completedVisits = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Atendimento'
        ).length;
        
        const enrollments = dayActivities.filter(activity => 
          activity.tipo_atividade === 'Matrícula'
        ).length;
        
        // Calcular taxas de conversão com proteção contra divisão por zero
        const ceConversionRate = contactAttempts > 0 
          ? (effectiveContacts / contactAttempts) * 100 
          : 0;
          
        const agConversionRate = effectiveContacts > 0 
          ? (scheduledVisits / effectiveContacts) * 100 
          : 0;
          
        const atConversionRate = dayAwaitingVisits.length > 0 
          ? (completedVisits / dayAwaitingVisits.length) * 100 
          : 0;
          
        const maConversionRate = completedVisits > 0 
          ? (enrollments / completedVisits) * 100 
          : 0;
        
        if (date.getUTCDate() >= 14) {
          console.log(`[V2] Estatísticas para ${dateISO}:`, {
            newClients: dayClients.length,
            contactAttempts,
            effectiveContacts,
            scheduledVisits,
            awaitingVisits: dayAwaitingVisits.length,
            completedVisits,
            enrollments
          });
        }
        
        // Retornar estatísticas do dia
        return {
          date,
          newClients: dayClients.length,
          contactAttempts,
          effectiveContacts,
          scheduledVisits,
          awaitingVisits: dayAwaitingVisits.length,
          completedVisits,
          enrollments,
          ceConversionRate,
          agConversionRate, 
          atConversionRate,
          maConversionRate,
        };
      });
      
      return dailyStats;
    },
  });
}
