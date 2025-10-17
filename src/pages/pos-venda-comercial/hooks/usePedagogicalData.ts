/**
 * LOG: Hook customizado para gerenciar dados pedagógicos pós-venda
 * Implementa busca, salvamento e validação via funções do banco
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PedagogicalData } from "../types/pedagogical-data.types";

export function usePedagogicalData(activityId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  // LOG: Query para buscar dados pedagógicos existentes
  const {
    data: pedagogicalData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['pedagogical-data', activityId],
    queryFn: async (): Promise<PedagogicalData> => {
      console.log('LOG: Buscando dados pedagógicos para atividade:', activityId);
      
      const { data, error } = await supabase.rpc('get_pos_venda_pedagogical_data', {
        p_activity_id: activityId
      });

      if (error) {
        console.error('LOG: Erro ao buscar dados pedagógicos:', error);
        throw error;
      }

      console.log('LOG: Dados pedagógicos obtidos:', data);
      return (data as PedagogicalData) || {};
    },
    enabled: !!activityId
  });

  // LOG: Query para verificar se dados estão completos
  const {
    data: isComplete,
    isLoading: isLoadingComplete
  } = useQuery({
    queryKey: ['pedagogical-data-complete', activityId],
    queryFn: async (): Promise<boolean> => {
      console.log('LOG: Verificando completude dos dados pedagógicos para:', activityId);
      
      const { data, error } = await supabase.rpc('check_pedagogical_data_complete', {
        p_activity_id: activityId
      });

      if (error) {
        console.error('LOG: Erro ao verificar completude:', error);
        throw error;
      }

      console.log('LOG: Status de completude:', data);
      return data || false;
    },
    enabled: !!activityId
  });

  // LOG: Mutation para salvar dados pedagógicos
  const savePedagogicalDataMutation = useMutation({
    mutationFn: async (data: PedagogicalData) => {
      console.log('LOG: Salvando dados pedagógicos:', data);
      
      const { data: result, error } = await supabase.rpc('save_pos_venda_pedagogical_data', {
        p_activity_id: activityId,
        p_turma_id: data.turma_id || null,
        p_data_aula_inaugural: data.data_aula_inaugural || null,
        p_informacoes_onboarding: data.informacoes_onboarding || null
      });

      if (error) {
        console.error('LOG: Erro ao salvar dados pedagógicos:', error);
        throw error;
      }

      console.log('LOG: Dados pedagógicos salvos com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedagogical-data', activityId] });
      queryClient.invalidateQueries({ queryKey: ['pedagogical-data-complete', activityId] });
      
      toast.success("Dados pedagógicos salvos com sucesso!");
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('LOG: Erro na mutation de dados pedagógicos:', error);
      toast.error("Erro ao salvar dados pedagógicos. Tente novamente.");
    }
  });

  return {
    pedagogicalData,
    isComplete,
    isLoading,
    isLoadingComplete,
    error,
    savePedagogicalData: savePedagogicalDataMutation.mutate,
    isSaving: savePedagogicalDataMutation.isPending
  };
}
