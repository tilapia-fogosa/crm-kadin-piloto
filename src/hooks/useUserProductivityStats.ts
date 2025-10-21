/**
 * Hook para buscar estatísticas de produtividade do usuário
 * 
 * @description
 * Consome função RPC do backend que calcula médias diárias de atividades.
 * A lógica de segurança e regras de negócio estão no banco de dados.
 * 
 * REGRAS DE SEGURANÇA (aplicadas no backend):
 * - Consultores veem apenas seus próprios dados
 * - Franqueados/Admins podem ver todos usuários ou filtrar específicos
 * - "Todos usuários" inclui usuários bloqueados (quando autorizado)
 * 
 * @param selectedUnitIds - Array de IDs das unidades selecionadas
 * @param selectedUserIds - Array de IDs dos usuários para filtrar (opcional)
 * @returns Estatísticas de produtividade e estado de loading
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { ProductivityStats } from "@/types/productivity.types";

interface UseUserProductivityStatsProps {
  selectedUnitIds: string[];
  selectedUserIds?: string[];
}

export function useUserProductivityStats({ 
  selectedUnitIds, 
  selectedUserIds 
}: UseUserProductivityStatsProps) {
  console.log('📊 [useUserProductivityStats] Chamando RPC com:', {
    unidades: selectedUnitIds,
    usuarios: selectedUserIds
  });
  
  const queryClient = useQueryClient();

  /**
   * Busca estatísticas via função RPC do banco
   * Toda lógica de segurança e cálculo é feita no backend
   */
  const fetchProductivityStats = async (): Promise<ProductivityStats> => {
    console.log('📊 [fetchProductivityStats] Iniciando chamada RPC');
    
    const { data, error } = await supabase.rpc('get_user_productivity_stats', {
      p_unit_ids: selectedUnitIds.length > 0 ? selectedUnitIds : null,
      p_user_ids: selectedUserIds && selectedUserIds.length > 0 ? selectedUserIds : null,
      p_days_back: 15
    });

    if (error) {
      console.error('📊 [fetchProductivityStats] Erro ao buscar estatísticas:', error);
      throw error;
    }

    console.log('📊 [fetchProductivityStats] Estatísticas retornadas do RPC:', data);

    // RPC retorna jsonb que já está no formato correto ProductivityStats
    return data as ProductivityStats;
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
