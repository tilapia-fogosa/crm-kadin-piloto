/**
 * Lista de conversas (sidebar esquerdo)
 * 
 * Log: Componente que renderiza a lista de conversas
 * Etapas:
 * 1. Busca conversas usando useConversations hook
 * 2. Implementa busca/filtro por nome do cliente
 * 3. Renderiza input de busca no topo
 * 4. Exibe lista de ConversationItem em ScrollArea
 * 5. Mostra loading ou mensagem de "sem conversas"
 * 
 * Utiliza cores do sistema: card, border, muted
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Search } from "lucide-react";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "../hooks/useConversations";

interface ConversationListProps {
  selectedClientId: string | null;
  onSelectClient: (clientId: string, isUnregistered?: boolean) => void;
  onActivityClick: (clientId: string) => void;
  onToggleTipoAtendimento: (clientId: string, currentTipo: 'bot' | 'humano') => void;
}

export function ConversationList({ selectedClientId, onSelectClient, onActivityClick, onToggleTipoAtendimento }: ConversationListProps) {
  console.log('ConversationList: Renderizando lista de conversas');

  const [searchQuery, setSearchQuery] = useState("");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const { data: conversations, isLoading } = useConversations();

  // Filtrar conversas pela busca
  let filteredConversations = conversations?.filter(conv =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phoneNumber.includes(searchQuery)
  );

  // Filtrar apenas não lidas se toggle estiver ativo
  if (showUnreadOnly) {
    filteredConversations = filteredConversations?.filter(conv => conv.unreadCount > 0);
  }

  // Calcular total de conversas não lidas
  const totalUnread = conversations?.filter(conv => conv.unreadCount > 0).length || 0;

  console.log('ConversationList: Conversas filtradas:', filteredConversations?.length, 'Total não lidas:', totalUnread);

  return (
    <div className="w-full md:w-[350px] flex flex-col border-r border-border bg-card h-full">
      {/* Header com busca e filtro */}
      <div className="p-3 border-b border-border bg-card space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Botão de filtro de não lidas */}
        <Button
          variant={showUnreadOnly ? "default" : "outline"}
          size="sm"
          className="w-full"
          onClick={() => setShowUnreadOnly(!showUnreadOnly)}
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          Não lidas {totalUnread > 0 && `(${totalUnread})`}
        </Button>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1">
        {isLoading && (
          <div className="p-4 text-center text-muted-foreground">
            Carregando conversas...
          </div>
        )}

        {!isLoading && filteredConversations && filteredConversations.length === 0 && (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa ainda'}
          </div>
        )}

        {!isLoading && filteredConversations && filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.clientId}
            conversation={conversation}
            isSelected={selectedClientId === conversation.clientId}
            onClick={() => onSelectClient(conversation.clientId, conversation.isUnregistered)}
            onActivityClick={conversation.isUnregistered ? undefined : () => onActivityClick(conversation.clientId)}
            onToggleTipoAtendimento={conversation.isUnregistered ? undefined : () => onToggleTipoAtendimento(conversation.clientId, conversation.tipoAtendimento)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
