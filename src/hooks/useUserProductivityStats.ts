/**
 * Hook para buscar estatísticas de produtividade do usuário
 * 
 * @description
 * Calcula médias diárias de atividades (TC, CE, AG, AT) para períodos de 1, 3, 7 e 15 dias.
 * Filtra por unidades selecionadas e atualiza automaticamente via realtime.
 * 
 * @param selectedUnitIds - Array de IDs das unidades selecionadas
 * @returns Estatísticas de produtividade e estado de loading
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { ProductivityStats } from "@/types/productivity.types";

const ACTIVITY_TYPES = {
  TC: 'Tentativa de Contato',
  CE: 'Contato Efetivo',
  AG: 'Agendamento',
  AT: 'Atendimento'
} as const;

interface UseUserProductivityStatsProps {
  selectedUnitIds: string[];
  selectedUserIds?: string[]; // IDs dos usuários para filtrar (opcional)
}

export function useUserProductivityStats({ selectedUnitIds, selectedUserIds }: UseUserProductivityStatsProps) {
  console.log('📊 [useUserProductivityStats] Iniciando hook com unidades:', selectedUnitIds);
  console.log('📊 [useUserProductivityStats] Filtro de usuários:', selectedUserIds);
  
  const queryClient = useQueryClient();

  /**
   * Busca atividades do usuário para um período específico
   */
  const fetchActivitiesForPeriod = async (daysBack: number, activityType: string) => {
    console.log(`📊 [fetchActivitiesForPeriod] Buscando ${activityType} para ${daysBack} dias`);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn('📊 [fetchActivitiesForPeriod] Usuário não autenticado');
      return 0;
    }

    // Calcular data inicial (início do dia há N dias)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysBack - 1));
    startDate.setHours(0, 0, 0, 0);

    console.log(`📊 [fetchActivitiesForPeriod] Data inicial: ${startDate.toISOString()}`);

    // Determinar IDs de usuários para filtrar
    const userIdsToFilter = selectedUserIds && selectedUserIds.length > 0 
      ? selectedUserIds 
      : [user.id];

    console.log(`📊 [fetchActivitiesForPeriod] Filtrando por usuários:`, userIdsToFilter);

    // Query com filtros
    let query = supabase
      .from('client_activities')
      .select('id', { count: 'exact', head: true })
      .in('created_by', userIdsToFilter)
      .eq('tipo_atividade', activityType)
      .eq('active', true)
      .gte('created_at', startDate.toISOString());

    // Aplicar filtro de unidades se houver seleção específica
    if (selectedUnitIds.length > 0) {
      query = query.in('unit_id', selectedUnitIds);
    }

    const { count, error } = await query;

    if (error) {
      console.error(`📊 [fetchActivitiesForPeriod] Erro ao buscar ${activityType}:`, error);
      return 0;
    }

    const total = count || 0;
    const dailyAverage = Math.round(total / daysBack);

    console.log(`📊 [fetchActivitiesForPeriod] ${activityType} - Total: ${total}, Média diária: ${dailyAverage}`);

    return dailyAverage;
  };

  /**
   * Busca todas as estatísticas de produtividade
   */
  const fetchProductivityStats = async (): Promise<ProductivityStats> => {
    console.log('📊 [fetchProductivityStats] Iniciando busca de estatísticas');

    const stats: ProductivityStats = {
      tentativaContato: {
        day1: await fetchActivitiesForPeriod(1, ACTIVITY_TYPES.TC),
        day3: await fetchActivitiesForPeriod(3, ACTIVITY_TYPES.TC),
        day7: await fetchActivitiesForPeriod(7, ACTIVITY_TYPES.TC),
        day15: await fetchActivitiesForPeriod(15, ACTIVITY_TYPES.TC),
      },
      contatoEfetivo: {
        day1: await fetchActivitiesForPeriod(1, ACTIVITY_TYPES.CE),
        day3: await fetchActivitiesForPeriod(3, ACTIVITY_TYPES.CE),
        day7: await fetchActivitiesForPeriod(7, ACTIVITY_TYPES.CE),
        day15: await fetchActivitiesForPeriod(15, ACTIVITY_TYPES.CE),
      },
      agendamento: {
        day1: await fetchActivitiesForPeriod(1, ACTIVITY_TYPES.AG),
        day3: await fetchActivitiesForPeriod(3, ACTIVITY_TYPES.AG),
        day7: await fetchActivitiesForPeriod(7, ACTIVITY_TYPES.AG),
        day15: await fetchActivitiesForPeriod(15, ACTIVITY_TYPES.AG),
      },
      atendimento: {
        day1: await fetchActivitiesForPeriod(1, ACTIVITY_TYPES.AT),
        day3: await fetchActivitiesForPeriod(3, ACTIVITY_TYPES.AT),
        day7: await fetchActivitiesForPeriod(7, ACTIVITY_TYPES.AT),
        day15: await fetchActivitiesForPeriod(15, ACTIVITY_TYPES.AT),
      },
    };

    console.log('📊 [fetchProductivityStats] Estatísticas calculadas:', stats);

    return stats;
  };

  // Query principal
  const query = useQuery({
    queryKey: ['user-productivity-stats', selectedUnitIds, selectedUserIds],
    queryFn: fetchProductivityStats,
    staleTime: 0, // Sempre considerar dados stale
    gcTime: 30000, // 30s de cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  /**
   * Setup de realtime para atualização automática
   */
  useEffect(() => {
    console.log('📊 [useUserProductivityStats] Configurando realtime subscription');

    const channel = supabase
      .channel('productivity-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_activities',
        },
        (payload) => {
          console.log('📊 [Realtime] Atividade modificada:', payload);
          console.log('📊 [Realtime] Invalidando cache de produtividade para unidades:', selectedUnitIds);
          queryClient.invalidateQueries({ 
            queryKey: ['user-productivity-stats', selectedUnitIds] 
          });
        }
      )
      .subscribe();

    return () => {
      console.log('📊 [useUserProductivityStats] Removendo realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, selectedUnitIds]);

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
