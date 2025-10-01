/**
 * LOG: Hook customizado para gerenciar dados comerciais pós-venda
 * Implementa busca, salvamento e validação via funções do banco
 * Atualizado para usar ENUM kit_type
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CommercialData } from "../types/commercial-data.types";

/**
 * Hook principal para gerenciar dados comerciais
 * LOG: Encapsula toda a lógica de backend para dados comerciais
 */
export function useCommercialData(activityId: string, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  // LOG: Query para buscar dados comerciais existentes
  const {
    data: commercialData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['commercial-data', activityId],
    queryFn: async (): Promise<CommercialData> => {
      console.log('LOG: Buscando dados comerciais para atividade:', activityId);
      
      const { data, error } = await supabase.rpc('get_pos_venda_commercial_data', {
        p_activity_id: activityId
      });

      if (error) {
        console.error('LOG: Erro ao buscar dados comerciais:', error);
        throw error;
      }

      console.log('LOG: Dados comerciais obtidos:', data);
      // LOG: Garantir que sempre retornamos um objeto CommercialData válido
      return (data as CommercialData) || {};
    },
    enabled: !!activityId
  });

  // LOG: Query para verificar se dados estão completos
  const {
    data: isComplete,
    isLoading: isLoadingComplete
  } = useQuery({
    queryKey: ['commercial-data-complete', activityId],
    queryFn: async (): Promise<boolean> => {
      console.log('LOG: Verificando completude dos dados comerciais para:', activityId);
      
      const { data, error } = await supabase.rpc('check_commercial_data_complete', {
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

  // LOG: Mutation para salvar dados comerciais
  const saveCommercialDataMutation = useMutation({
    mutationFn: async (data: CommercialData) => {
      console.log('LOG: Salvando dados comerciais:', data);
      
      const { data: result, error } = await supabase.rpc('save_pos_venda_commercial_data', {
        p_activity_id: activityId,
        p_kit_type: data.kit_type || null,
        p_enrollment_amount: data.enrollment_amount || null,
        p_enrollment_payment_date: data.enrollment_payment_date || null,
        p_enrollment_payment_method: data.enrollment_payment_method || null,
        p_enrollment_installments: data.enrollment_installments || null,
        p_monthly_fee_amount: data.monthly_fee_amount || null,
        p_first_monthly_fee_date: data.first_monthly_fee_date || null,
        p_monthly_fee_payment_method: data.monthly_fee_payment_method || null,
        p_material_amount: data.material_amount || null,
        p_material_payment_date: data.material_payment_date || null,
        p_material_payment_method: data.material_payment_method || null,
        p_material_installments: data.material_installments || null,
        p_enrollment_payment_confirmed: data.enrollment_payment_confirmed || false,
        p_material_payment_confirmed: data.material_payment_confirmed || false
      });

      if (error) {
        console.error('LOG: Erro ao salvar dados comerciais:', error);
        throw error;
      }

      console.log('LOG: Dados comerciais salvos com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      // LOG: Invalidar queries para atualizar dados
      console.log('LOG: Invalidando queries após salvamento');
      queryClient.invalidateQueries({ queryKey: ['commercial-data', activityId] });
      queryClient.invalidateQueries({ queryKey: ['commercial-data-complete', activityId] });
      
      toast.success('Dados comerciais salvos com sucesso!');
      
      // LOG: Executar callback de sucesso se fornecido
      if (onSuccess) {
        console.log('LOG: Executando callback de sucesso');
        onSuccess();
      }
    },
    onError: (error) => {
      console.error('LOG: Erro na mutation de salvamento:', error);
      toast.error('Erro ao salvar dados comerciais. Tente novamente.');
    }
  });

  /**
   * Função para salvar dados comerciais
   * LOG: Interface pública do hook para salvar dados
   */
  const saveCommercialData = (data: CommercialData) => {
    console.log('LOG: Iniciando salvamento via hook:', data);
    saveCommercialDataMutation.mutate(data);
  };

  return {
    // Dados
    commercialData,
    isComplete: isComplete || false,
    
    // Estados de loading
    isLoading: isLoading || isLoadingComplete,
    isLoadingComplete,
    
    // Estados de mutation
    isSaving: saveCommercialDataMutation.isPending,
    
    // Erro
    error,
    
    // Ações
    saveCommercialData
  };
}