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
  console.log('useMessages: Iniciando busca de mensagens para:', clientId);

  // Verificar se é um número não cadastrado (prefixo "phone_")
  const isPhoneQuery = clientId?.startsWith('phone_');
  const phoneNumber = isPhoneQuery ? clientId.replace('phone_', '') : null;

  return useQuery({
    queryKey: ['whatsapp-messages', clientId],
    refetchInterval: 10000, // Atualiza a cada 10 segundos quando chat está aberto
    queryFn: async () => {
      if (!clientId) {
        console.log('useMessages: ClientId é null, retornando array vazio');
        return [];
      }

      if (isPhoneQuery && phoneNumber) {
        console.log('useMessages: Buscando mensagens por telefone (não cadastrado):', phoneNumber);

        // Query para mensagens sem client_id, filtrando por telefone
        const { data, error } = await supabase
          .from('historico_comercial')
          .select(`
            id, 
            telefone,
            mensagem, 
            created_at, 
            from_me,
            created_by,
            tipo_mensagem,
            media_url,
            profiles:created_by (full_name)
          `)
          .eq('telefone', phoneNumber)
          .is('client_id', null)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('useMessages: Erro ao buscar mensagens por telefone:', error);
          throw error;
        }

        console.log('useMessages: Mensagens recebidas (não cadastrado):', data?.length);

        const messages: Message[] = data?.map(msg => ({
          id: msg.id,
          clientId: `phone_${phoneNumber}`,
          content: msg.mensagem,
          createdAt: msg.created_at,
          fromMe: msg.from_me,
          createdByName: msg.profiles?.full_name 
            ? msg.profiles.full_name.split(' ')[0] 
            : null,
          tipoMensagem: msg.tipo_mensagem,
          mediaUrl: msg.media_url
        })) || [];

        return messages;
      }

      // Query normal para clientes cadastrados
      console.log('useMessages: Executando query no Supabase para cliente cadastrado:', clientId);

      const { data, error } = await supabase
        .from('historico_comercial')
        .select(`
          id, 
          client_id, 
          mensagem, 
          created_at, 
          from_me,
          created_by,
          tipo_mensagem,
          media_url,
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
          : null,
        tipoMensagem: msg.tipo_mensagem,
        mediaUrl: msg.media_url
      })) || [];

      return messages;
    },
    enabled: !!clientId
  });
}
