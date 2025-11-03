/**
 * LOG: Hook customizado para gerenciar dados pedagógicos pós-venda
 * Implementa busca, salvamento e validação via funções do banco
 * Inclui bloqueio automático de professor e sala para aula inaugural
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PedagogicalData } from "../types/pedagogical-data.types";

interface PedagogicalDataWithAulaInaugural extends PedagogicalData {
  aula_inaugural_professor_id?: string;
  aula_inaugural_sala_id?: string;
  aula_inaugural_horario_inicio?: string;
  aula_inaugural_horario_fim?: string;
}

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

  // LOG: Mutation para salvar dados pedagógicos e bloquear aula inaugural
  const savePedagogicalDataMutation = useMutation({
    mutationFn: async (data: PedagogicalDataWithAulaInaugural) => {
      console.log('LOG: Salvando dados pedagógicos com aula inaugural:', data);
      
      // 1. Salvar dados pedagógicos básicos
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
      
      // 2. Bloquear professor e sala para aula inaugural (se informações fornecidas)
      if (data.aula_inaugural_professor_id && data.aula_inaugural_sala_id && data.data_aula_inaugural) {
        console.log('LOG: Bloqueando recursos para aula inaugural');
        
        // Buscar client_name e unit_id da atividade
        const { data: activity, error: activityError } = await supabase
          .from('atividade_pos_venda')
          .select('full_name, client_id')
          .eq('id', activityId)
          .single();
        
        if (activityError) {
          console.error('LOG: Erro ao buscar dados da atividade:', activityError);
          throw activityError;
        }
        
        // Buscar unit_id do cliente
        const { data: client, error: clientError } = await supabase
          .from('clients')
          .select('unit_id')
          .eq('id', activity.client_id)
          .single();
        
        if (clientError) {
          console.error('LOG: Erro ao buscar unit_id do cliente:', clientError);
          throw clientError;
        }
        
        // Chamar função para bloquear recursos
        const { data: blockResult, error: blockError } = await supabase.rpc('bloquear_aula_inaugural', {
          p_activity_id: activityId,
          p_data: data.data_aula_inaugural,
          p_horario_inicio: data.aula_inaugural_horario_inicio,
          p_horario_fim: data.aula_inaugural_horario_fim,
          p_professor_id: data.aula_inaugural_professor_id,
          p_sala_id: data.aula_inaugural_sala_id,
          p_client_name: activity.full_name,
          p_unit_id: client.unit_id
        });
        
        if (blockError) {
          console.error('LOG: Erro ao bloquear recursos:', blockError);
          throw blockError;
        }
        
        console.log('LOG: Recursos bloqueados com sucesso:', blockResult);
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedagogical-data', activityId] });
      queryClient.invalidateQueries({ queryKey: ['pedagogical-data-complete', activityId] });
      queryClient.invalidateQueries({ queryKey: ['agenda-professores'] });
      queryClient.invalidateQueries({ queryKey: ['agenda-sala'] });
      
      toast.success("Dados pedagógicos salvos e aula inaugural agendada com sucesso!");
      
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
