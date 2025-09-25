import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AtividadeRealizada {
  id: string;
  atividade_pos_venda_id: string;
  atividade_config_id: string;
  realizada: boolean;
  data_realizacao?: string;
  usuario_realizou?: string;
  usuario_nome?: string; // Nome do usuário que realizou a atividade
  usuario_id?: string;
  created_at: string;
  updated_at: string;
}

export function useAtividadeRealizada(
  atividadePosVendaId: string,
  atividadeConfigId: string
) {
  const queryClient = useQueryClient();

  const { data: atividadeRealizada, isLoading, error } = useQuery({
    queryKey: ['atividade-realizada', atividadePosVendaId, atividadeConfigId],
    queryFn: async () => {
      console.log('LOG: Chamando função backend get_pos_venda_activity_status:', { atividadePosVendaId, atividadeConfigId });

      const { data, error } = await supabase.rpc('get_pos_venda_activity_status', {
        p_atividade_pos_venda_id: atividadePosVendaId,
        p_atividade_config_id: atividadeConfigId
      });

      if (error) {
        console.error('LOG: Erro ao chamar função backend get_pos_venda_activity_status:', error);
        throw error;
      }

      console.log('LOG: Status de atividade retornado pela função backend:', data ? 'Encontrado' : 'Não encontrado');
      return data;
    },
    enabled: !!(atividadePosVendaId && atividadeConfigId),
  });

  const updateAtividadeMutation = useMutation({
    mutationFn: async (realizada: boolean) => {
      console.log('LOG: Alterando status via função backend:', { 
        atividadePosVendaId, 
        atividadeConfigId, 
        realizada 
      });

      const { data, error } = await supabase.rpc('toggle_pos_venda_activity_status', {
        p_atividade_pos_venda_id: atividadePosVendaId,
        p_atividade_config_id: atividadeConfigId,
        p_realizada: realizada
      });

      if (error) {
        console.error('LOG: Erro ao alterar status via função backend:', error);
        throw error;
      }

      console.log('LOG: Status alterado com sucesso via backend:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['atividade-realizada', atividadePosVendaId, atividadeConfigId] 
      });
      // Não mostra toast de sucesso para melhor UX (ação muito frequente)
    },
    onError: (error) => {
      console.error('LOG: Erro na atualização de atividade realizada via backend:', error);
      toast({
        title: "Erro ao atualizar atividade",
        description: "Não foi possível atualizar o status da atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    atividadeRealizada: atividadeRealizada as unknown as AtividadeRealizada | null,
    isLoading,
    error,
    updateAtividade: updateAtividadeMutation.mutate,
    isUpdating: updateAtividadeMutation.isPending,
  };
}