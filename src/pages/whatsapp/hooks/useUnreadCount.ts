/**
 * Hook para contar conversas não lidas
 * 
 * Log: Hook que retorna o total de conversas com mensagens não lidas
 * Etapas:
 * 1. Usa o hook useConversations para buscar todas as conversas
 * 2. Filtra conversas que possuem unreadCount > 0
 * 3. Retorna a contagem total
 */

import { useConversations } from "./useConversations";

export function useUnreadCount() {
  console.log('useUnreadCount: Calculando total de conversas não lidas');
  
  const { data: conversations = [], isLoading } = useConversations();
  
  // Conta quantas conversas têm mensagens não lidas
  const unreadCount = conversations.filter(conv => conv.unreadCount > 0).length;
  
  console.log('useUnreadCount: Total de conversas não lidas:', unreadCount);
  
  return {
    unreadCount,
    isLoading
  };
}
