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
  
  // Log: Conta apenas conversas normais (não Novo Cadastro, não Sem Cadastro) com mensagens não lidas
  // Isso mantém o contador da sidebar sincronizado com o contador da página de conversas
  const conversasNormais = conversations.filter(conv => !conv.isNewLead && !conv.isUnregistered);
  const unreadCount = conversasNormais.filter(conv => conv.unreadCount > 0).length;
  
  console.log('useUnreadCount: Total de conversas não lidas (normais):', unreadCount);
  
  return {
    unreadCount,
    isLoading
  };
}
