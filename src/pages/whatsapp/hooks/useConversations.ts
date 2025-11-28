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

// ID do perfil Sistema-Kadin para identificar novos leads
const SISTEMA_KADIN_ID = 'eaf94b92-7646-485f-bd96-016bf1add2b2';

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
    refetchInterval: 30000, // Atualiza a cada 30 segundos
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
          created_by,
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
            lida: msg.lida,
            created_by: msg.created_by
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

        // Verificar se é novo lead: apenas 1 mensagem e foi criada pelo Sistema-Kadin
        const isNewLead = messages.length === 1 && messages[0].created_by === SISTEMA_KADIN_ID;

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
          unreadCount,
          isNewLead,
          isUnregistered: false
        };
      }).sort((a, b) =>
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );

      console.log('useConversations: Conversas de clientes cadastrados:', conversations.length);

      // Filtrar Novo-Lead com status perdido
      // Log: Removendo leads que são novos mas já foram marcados como perdidos
      const filteredConversations = conversations.filter(conv => {
        // Remove Novo-Lead que estão com status perdido
        if (conv.isNewLead && conv.status === 'perdido') {
          console.log('useConversations: Removendo Novo-Lead perdido:', conv.clientName);
          return false;
        }
        return true;
      });

      console.log('useConversations: Conversas após filtrar perdidos:', filteredConversations.length);

      // Etapa 2: Buscar mensagens de números não cadastrados (client_id IS NULL)
      console.log('useConversations: Buscando mensagens de números não cadastrados', {
        selectedUnitId,
        filters: { client_id: null, telefone: 'NOT NULL', unit_id: selectedUnitId }
      });
      
      const { data: unregisteredMessages, error: unregisteredError } = await supabase
        .from('historico_comercial')
        .select('id, telefone, mensagem, created_at, from_me, lida, created_by')
        .is('client_id', null)
        .not('telefone', 'is', null)
        .eq('unit_id', selectedUnitId)
        .order('created_at', { ascending: false });

      console.log('useConversations: Resultado da busca de não cadastrados:', {
        count: unregisteredMessages?.length || 0,
        hasError: !!unregisteredError,
        firstMessage: unregisteredMessages?.[0]
      });

      if (unregisteredError) {
        console.error('useConversations: Erro ao buscar mensagens não cadastradas:', {
          error: unregisteredError,
          message: unregisteredError.message,
          details: unregisteredError.details,
          hint: unregisteredError.hint,
          code: unregisteredError.code
        });
        // Continua com apenas as conversas cadastradas
      } else {
        console.log('useConversations: Mensagens não cadastradas recebidas:', unregisteredMessages?.length);

        // Agrupar mensagens por telefone
        const unregisteredByPhone = new Map<string, any[]>();
        
        unregisteredMessages?.forEach(msg => {
          if (!unregisteredByPhone.has(msg.telefone)) {
            unregisteredByPhone.set(msg.telefone, []);
          }
          unregisteredByPhone.get(msg.telefone)!.push({
            id: msg.id,
            mensagem: msg.mensagem,
            created_at: msg.created_at,
            from_me: msg.from_me,
            lida: msg.lida,
            created_by: msg.created_by
          });
        });

        console.log('useConversations: Números únicos não cadastrados:', unregisteredByPhone.size);

        // Converter para formato Conversation
        const unregisteredConversations: Conversation[] = Array.from(unregisteredByPhone.entries()).map(([phone, msgs]) => {
          // Ordenar mensagens por data
          const sortedMsgs = msgs.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

          // Contar não lidas
          const unreadCount = msgs.filter(msg => !msg.from_me && msg.lida === false).length;

          // Formatar número de telefone para exibição
          const formatPhone = (tel: string) => {
            // Remove caracteres não numéricos
            const clean = tel.replace(/\D/g, '');
            
            // Formata como +55 XX XXXXX-XXXX ou +55 XX XXXX-XXXX
            if (clean.length === 13) {
              return `+${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 9)}-${clean.slice(9)}`;
            } else if (clean.length === 12) {
              return `+${clean.slice(0, 2)} ${clean.slice(2, 4)} ${clean.slice(4, 8)}-${clean.slice(8)}`;
            } else if (clean.length === 11) {
              return `${clean.slice(0, 2)} ${clean.slice(2, 7)}-${clean.slice(7)}`;
            } else if (clean.length === 10) {
              return `${clean.slice(0, 2)} ${clean.slice(2, 6)}-${clean.slice(6)}`;
            }
            return tel;
          };

          return {
            clientId: `phone_${phone}`, // Prefixo para identificar números não cadastrados
            clientName: formatPhone(phone),
            phoneNumber: phone,
            primeiroNome: '??',
            status: 'não-cadastrado',
            unitId: selectedUnitId || '',
            lastMessage: sortedMsgs[0]?.mensagem || '',
            lastMessageTime: sortedMsgs[0]?.created_at || '',
            lastMessageFromMe: sortedMsgs[0]?.from_me || false,
            totalMessages: msgs.length,
            tipoAtendimento: 'humano' as const,
            unreadCount,
            isNewLead: false,
            isUnregistered: true
          };
        });

        console.log('useConversations: Conversas não cadastradas formatadas:', unregisteredConversations.length);

        // Mesclar conversas cadastradas e não cadastradas
        const allConversations = [...filteredConversations, ...unregisteredConversations]
          .sort((a, b) => 
            new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
          );

        console.log('useConversations: Total de conversas (cadastradas + não cadastradas):', allConversations.length);
        return allConversations;
      }

      return filteredConversations;
    }
  });
}
