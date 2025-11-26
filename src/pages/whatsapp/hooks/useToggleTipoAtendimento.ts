/**
 * Hook para alternar tipo de atendimento (bot/humano)
 * 
 * Log: Hook de mutação para atualizar campo tipo_atendimento na tabela clients
 * Etapas:
 * 1. Recebe clientId e novo tipo (bot/humano)
 * 2. Atualiza registro na tabela clients
 * 3. Invalida cache de conversas para re-renderizar
 * 4. Exibe toast de sucesso ou erro
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useToggleTipoAtendimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      clientId, 
      newTipo 
    }: { 
      clientId: string; 
      newTipo: 'bot' | 'humano' 
    }) => {
      console.log('useToggleTipoAtendimento: Atualizando tipo de atendimento', {
        clientId,
        newTipo
      });

      const { error } = await supabase
        .from('clients')
        .update({ tipo_atendimento: newTipo })
        .eq('id', clientId);

      if (error) {
        console.error('useToggleTipoAtendimento: Erro ao atualizar:', error);
        throw error;
      }

      console.log('useToggleTipoAtendimento: Atualização bem-sucedida');
    },
    onSuccess: (_, variables) => {
      // Invalidar cache para atualizar lista de conversas
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      
      toast.success(
        `Atendimento alterado para ${variables.newTipo === 'bot' ? 'Bot' : 'Humano'}`
      );
    },
    onError: (error) => {
      console.error('useToggleTipoAtendimento: Erro na mutação:', error);
      toast.error('Erro ao alterar tipo de atendimento');
    }
  });
}
