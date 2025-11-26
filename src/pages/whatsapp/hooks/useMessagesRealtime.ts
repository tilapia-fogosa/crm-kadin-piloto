/**
 * Hook de realtime para mensagens WhatsApp
 * 
 * Log: Escuta eventos INSERT na tabela historico_comercial
 * Etapas:
 * 1. Cria subscription do Supabase para postgres_changes
 * 2. Escuta eventos INSERT em historico_comercial
 * 3. Ao receber nova mensagem, invalida cache de mensagens do cliente
 * 4. Invalida cache de conversas para atualizar lastMessage e unreadCount
 * 5. React Query automaticamente refaz as queries
 */

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMessagesRealtime() {
  console.log('🔔 [useMessagesRealtime] Hook inicializado');
  
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('🔔 [useMessagesRealtime] Configurando realtime subscription para historico_comercial');

    const channel = supabase
      .channel('whatsapp-messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'historico_comercial'
        },
        (payload) => {
          console.log('🔔 [useMessagesRealtime] Nova mensagem recebida via realtime:', {
            id: payload.new.id,
            client_id: payload.new.client_id,
            from_me: payload.new.from_me,
            created_at: payload.new.created_at
          });
          
          const clientId = payload.new.client_id;
          
          // Invalida cache de mensagens do cliente específico para recarregar as mensagens
          console.log('🔔 [useMessagesRealtime] Invalidando cache de mensagens para cliente:', clientId);
          queryClient.invalidateQueries({ 
            queryKey: ['whatsapp-messages', clientId] 
          });
          
          // Invalida cache de conversas para atualizar lastMessage, unreadCount e ordem
          console.log('🔔 [useMessagesRealtime] Invalidando cache de conversas');
          queryClient.invalidateQueries({ 
            queryKey: ['whatsapp-conversations'] 
          });
        }
      )
      .subscribe((status) => {
        console.log('🔔 [useMessagesRealtime] Status da subscription:', status);
      });

    channelRef.current = channel;

    return () => {
      console.log('🔔 [useMessagesRealtime] Removendo realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [queryClient]);
}
