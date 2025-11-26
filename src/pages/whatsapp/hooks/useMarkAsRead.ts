/**
 * Hook para marcar mensagens como lidas
 * 
 * Log: Hook personalizado que marca todas as mensagens de um cliente como lidas
 * Etapas:
 * 1. Recebe o clientId como parâmetro
 * 2. Atualiza todas as mensagens não lidas (lida = false) desse cliente
 * 3. Define lida = true e lida_em = timestamp atual
 * 4. Invalida query de conversas para atualizar a lista
 * 5. Retorna função mutate para ser chamada quando abrir conversa
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  console.log('useMarkAsRead: Hook inicializado');

  return useMutation({
    mutationFn: async (clientId: string) => {
      console.log('useMarkAsRead: Marcando mensagens como lidas para cliente:', clientId);

      // Atualizar todas as mensagens não lidas deste cliente
      const { error } = await supabase
        .from('historico_comercial')
        .update({
          lida: true,
          lida_em: new Date().toISOString()
        })
        .eq('client_id', clientId)
        .eq('lida', false)
        .eq('from_me', false); // Apenas mensagens recebidas

      if (error) {
        console.error('useMarkAsRead: Erro ao marcar mensagens como lidas:', error);
        throw error;
      }

      console.log('useMarkAsRead: Mensagens marcadas como lidas com sucesso');
    },
    onMutate: async (clientId: string) => {
      console.log('useMarkAsRead: Iniciando atualização otimista para cliente:', clientId);
      
      // Cancelar queries em andamento que começam com 'whatsapp-conversations'
      await queryClient.cancelQueries({ queryKey: ['whatsapp-conversations'] });
      
      // Atualizar TODAS as queries que começam com 'whatsapp-conversations'
      // usando setQueriesData com match parcial
      queryClient.setQueriesData(
        { queryKey: ['whatsapp-conversations'] },
        (oldData: any) => {
          if (!oldData) {
            console.log('useMarkAsRead: Nenhum dado no cache para atualizar');
            return oldData;
          }
          
          console.log('useMarkAsRead: Atualizando cache otimisticamente', oldData);
          const newData = oldData.map((conversation: any) => {
            if (conversation.clientId === clientId) {
              console.log(`useMarkAsRead: Zerando unreadCount para cliente ${clientId}`, {
                clientName: conversation.clientName,
                unreadCountAntes: conversation.unreadCount,
                unreadCountDepois: 0
              });
              return { ...conversation, unreadCount: 0 };
            }
            return conversation;
          });
          console.log('useMarkAsRead: Novo estado do cache:', newData);
          return newData;
        }
      );
    },
    onSuccess: () => {
      console.log('useMarkAsRead: Mutation bem-sucedida, invalidando query de conversas');
      // Invalidar query para sincronizar com dados do servidor
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    },
    onError: (error, clientId) => {
      console.error('useMarkAsRead: Erro na mutation:', error);
      // Em caso de erro, invalidar para reverter ao estado do servidor
      console.log('useMarkAsRead: Revertendo cache devido ao erro');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
    }
  });
}
