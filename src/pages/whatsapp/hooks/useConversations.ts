/**
 * Hook para buscar conversas do WhatsApp
 * 
 * Log: Hook personalizado que busca clientes com mensagens
 * Etapas:
 * 1. Verifica se há sessão ativa antes de executar query
 * 2. Busca clientes que possuem histórico comercial (mensagens)
 * 3. Faz JOIN com historico_comercial para pegar última mensagem
 * 4. Ordena por data da última mensagem (mais recente primeiro)
 * 5. Mapeia para o formato Conversation
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUnit } from "@/contexts/UnitContext";
import { Conversation } from "../types/whatsapp.types";

export function useConversations() {
  const { session } = useAuth();
  const { selectedUnitId } = useUnit();

  console.log('useConversations: Iniciando busca de conversas', {
    hasSession: !!session,
    userId: session?.user?.id,
    selectedUnitId
  });

  return useQuery({
    queryKey: ['whatsapp-conversations', session?.user?.id, selectedUnitId],
    enabled: !!session && !!selectedUnitId,
    refetchInterval: 60000, // Atualiza a cada 1 minuto
    queryFn: async () => {
      console.log('useConversations: Executando query no Supabase');

      // Verificar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      console.log('useConversations: Usuário autenticado:', {
        userId: user?.id,
        email: user?.email,
        hasAuthError: !!authError
      });

      if (authError || !user) {
        console.error('useConversations: Erro de autenticação ou usuário não encontrado:', authError);
        return [];
      }

      // Buscar mensagens diretamente com JOIN para evitar problemas com RLS em nested selects
      // Log: Filtrando apenas clientes ativos para exibir conversas relevantes
      const { data: messages, error: messagesError } = await supabase
        .from('historico_comercial')
        .select(`
          id,
          mensagem,
          created_at,
          from_me,
          client_id,
          lida,
          clients (
            id,
            name,
            phone_number,
            primeiro_nome,
            status,
            unit_id,
            tipo_atendimento
          )
        `)
        .eq('clients.unit_id', selectedUnitId)
        .eq('clients.active', true)
        .order('created_at', { ascending: false });

      if (messagesError) {
        console.error('useConversations: Erro ao buscar mensagens:', messagesError);
        throw messagesError;
      }

      console.log('useConversations: Mensagens recebidas:', messages?.length);

      // Agrupar mensagens por cliente
      const clientsMap = new Map<string, {
        client: any;
        messages: any[];
      }>();

      messages?.forEach(msg => {
        if (msg.clients) {
          const clientId = msg.clients.id;
          if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
              client: msg.clients,
              messages: []
            });
          }
          clientsMap.get(clientId)!.messages.push({
            id: msg.id,
            mensagem: msg.mensagem,
            created_at: msg.created_at,
            from_me: msg.from_me,
            lida: msg.lida
          });
        }
      });

      console.log('useConversations: Clientes com mensagens:', clientsMap.size);

      // Mapear para o formato de conversa
      const conversations: Conversation[] = Array.from(clientsMap.values()).map(({ client, messages }) => {
        // Ordenar mensagens por data (mais recente primeiro)
        const sortedMessages = messages.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // Contar mensagens não lidas (recebidas e não lidas pela equipe)
        const unreadCount = messages.filter(msg => !msg.from_me && msg.lida === false).length;

        return {
          clientId: client.id,
          clientName: client.name,
          phoneNumber: client.phone_number,
          primeiroNome: client.primeiro_nome || client.name.split(' ')[0],
          status: client.status,
          unitId: client.unit_id || '',
          lastMessage: sortedMessages[0]?.mensagem || '',
          lastMessageTime: sortedMessages[0]?.created_at || '',
          lastMessageFromMe: sortedMessages[0]?.from_me || false,
          totalMessages: messages.length,
          tipoAtendimento: client.tipo_atendimento || 'humano',
          unreadCount
        };
      }).sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log('useConversations: Conversas formatadas:', conversations.length);
      return conversations;
    }
  });
}
