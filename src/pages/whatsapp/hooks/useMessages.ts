/**
 * Hook para buscar mensagens de uma conversa específica
 * 
 * Log: Hook personalizado que busca histórico comercial de um cliente
 * Etapas:
 * 1. Recebe clientId como parâmetro
 * 2. Busca todas as mensagens do historico_comercial para esse cliente
 * 3. Ordena cronologicamente (mais antiga primeiro)
 * 4. Mapeia para o formato Message
 * 5. Query desabilitada se clientId for null
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "../types/whatsapp.types";

export function useMessages(clientId: string | null) {
  console.log('useMessages: Iniciando busca de mensagens para cliente:', clientId);

  return useQuery({
    queryKey: ['whatsapp-messages', clientId],
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    queryFn: async () => {
      if (!clientId) {
        console.log('useMessages: ClientId é null, retornando array vazio');
        return [];
      }

      console.log('useMessages: Executando query no Supabase para cliente:', clientId);

      const { data, error } = await supabase
        .from('historico_comercial')
        .select(`
          id, 
          client_id, 
          mensagem, 
          created_at, 
          from_me,
          created_by,
          profiles:created_by (full_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('useMessages: Erro ao buscar mensagens:', error);
        throw error;
      }

      console.log('useMessages: Mensagens recebidas:', data?.length);

      const messages: Message[] = data?.map(msg => ({
        id: msg.id,
        clientId: msg.client_id,
        content: msg.mensagem,
        createdAt: msg.created_at,
        fromMe: msg.from_me,
        createdByName: msg.profiles?.full_name 
          ? msg.profiles.full_name.split(' ')[0] 
          : null
      })) || [];

      return messages;
    },
    enabled: !!clientId
  });
}
