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
  created_at: string;
  updated_at: string;
}

export function useAtividadeRealizada(
  atividadePosVendaId: string,
  atividadeConfigId: string
) {
  const queryClient = useQueryClient();

  const { data: atividadeRealizada, isLoading } = useQuery({
    queryKey: ['atividade-realizada', atividadePosVendaId, atividadeConfigId],
    queryFn: async () => {
      console.log('LOG: Buscando atividade realizada:', { atividadePosVendaId, atividadeConfigId });

      const { data, error } = await supabase
        .from('pos_venda_atividades_realizadas')
        .select('*')
        .eq('atividade_pos_venda_id', atividadePosVendaId)
        .eq('atividade_config_id', atividadeConfigId)
        .maybeSingle();

      if (error) {
        console.error('LOG: Erro ao buscar atividade realizada:', error);
        throw error;
      }

      console.log('LOG: Atividade realizada encontrada:', data ? 'Sim' : 'Não');
      return data;
    },
    enabled: !!(atividadePosVendaId && atividadeConfigId),
  });

  const updateAtividadeMutation = useMutation({
    mutationFn: async (realizada: boolean) => {
      console.log('LOG: Atualizando atividade realizada:', { 
        atividadePosVendaId, 
        atividadeConfigId, 
        realizada 
      });

      if (atividadeRealizada) {
        // Atualizar registro existente
        const { data, error } = await supabase
          .from('pos_venda_atividades_realizadas')
          .update({
            realizada,
            data_realizacao: realizada ? new Date().toISOString() : null,
            usuario_realizou: realizada ? 'Usuario Atual' : null, // TODO: Pegar usuário atual
          })
          .eq('id', atividadeRealizada.id)
          .select()
          .single();

        if (error) {
          console.error('LOG: Erro ao atualizar atividade realizada:', error);
          throw error;
        }

        return data;
      } else {
        // Criar novo registro
        const { data, error } = await supabase
          .from('pos_venda_atividades_realizadas')
          .insert({
            atividade_pos_venda_id: atividadePosVendaId,
            atividade_config_id: atividadeConfigId,
            realizada,
            data_realizacao: realizada ? new Date().toISOString() : null,
            usuario_realizou: realizada ? 'Usuario Atual' : null, // TODO: Pegar usuário atual
          })
          .select()
          .single();

        if (error) {
          console.error('LOG: Erro ao criar atividade realizada:', error);
          throw error;
        }

        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['atividade-realizada', atividadePosVendaId, atividadeConfigId] 
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na atualização de atividade realizada:', error);
      toast({
        title: "Erro ao atualizar atividade",
        description: "Não foi possível atualizar o status da atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    atividadeRealizada: atividadeRealizada as AtividadeRealizada | null,
    isLoading,
    updateAtividade: updateAtividadeMutation.mutate,
    isUpdating: updateAtividadeMutation.isPending,
  };
}