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
import { Conversation } from "../types/whatsapp.types";

export function useConversations() {
  const { session } = useAuth();
  
  console.log('useConversations: Iniciando busca de conversas', {
    hasSession: !!session,
    userId: session?.user?.id
  });
  
  return useQuery({
    queryKey: ['whatsapp-conversations', session?.user?.id],
    enabled: !!session,
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

      // Buscar clientes que têm mensagens, com última mensagem
      const { data, error } = await supabase
        .from('clients')
        .select(`
          id,
          name,
          phone_number,
          primeiro_nome,
          status,
          unit_id,
          historico_comercial (
            id,
            mensagem,
            created_at,
            from_me
          )
        `)
        .eq('active', true)
        .order('created_at', { 
          referencedTable: 'historico_comercial', 
          ascending: false 
        });

      if (error) {
        console.error('useConversations: Erro ao buscar conversas:', error);
        throw error;
      }

      console.log('useConversations: Dados recebidos:', data?.length, 'clientes');

      // Filtrar apenas clientes que têm mensagens
      const clientsWithMessages = data?.filter(
        client => client.historico_comercial && client.historico_comercial.length > 0
      ) || [];

      console.log('useConversations: Clientes com mensagens:', clientsWithMessages.length);

      // Mapear para o formato de conversa
      const conversations: Conversation[] = clientsWithMessages.map(client => ({
        clientId: client.id,
        clientName: client.name,
        phoneNumber: client.phone_number,
        primeiroNome: client.primeiro_nome || client.name.split(' ')[0],
        status: client.status,
        unitId: client.unit_id || '',
        // Pegar última mensagem
        lastMessage: client.historico_comercial?.[0]?.mensagem || '',
        lastMessageTime: client.historico_comercial?.[0]?.created_at || '',
        lastMessageFromMe: client.historico_comercial?.[0]?.from_me || false,
        totalMessages: client.historico_comercial?.length || 0
      })).sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log('useConversations: Conversas formatadas:', conversations.length);
      return conversations;
    }
  });
}
