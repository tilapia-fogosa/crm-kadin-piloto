/**
 * Lista de conversas (sidebar esquerdo)
 * 
 * Log: Componente que renderiza a lista de conversas com atualização de cache
 * Etapas:
 * 1. Busca conversas usando useConversations hook
 * 2. Implementa busca/filtro por nome do cliente
 * 3. Renderiza input de busca no topo
 * 4. Exibe lista de ConversationItem em ScrollArea
 * 5. Mostra loading ou mensagem de "sem conversas"
 * 6. Invalida cache de mensagens ao selecionar conversa
 * 
 * Utiliza cores do sistema: card, border, muted
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "../hooks/useConversations";

interface ConversationListProps {
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
}

export function ConversationList({ selectedClientId, onSelectClient }: ConversationListProps) {
  console.log('ConversationList: Renderizando lista de conversas');
  
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations, isLoading } = useConversations();
  const queryClient = useQueryClient();

  // Filtrar conversas pela busca
  const filteredConversations = conversations?.filter(conv =>
    conv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phoneNumber.includes(searchQuery)
  );

  console.log('ConversationList: Conversas filtradas:', filteredConversations?.length);

  // Função para selecionar cliente e invalidar cache de mensagens
  const handleSelectClient = (clientId: string) => {
    console.log('ConversationList: Selecionando cliente e invalidando cache:', clientId);
    onSelectClient(clientId);
    // Invalida cache das mensagens para forçar recarregamento
    queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', clientId] });
  };

  return (
    <div className="w-full md:w-[350px] flex flex-col border-r border-border bg-card">
      {/* Header com busca */}
      <div className="p-3 border-b border-border bg-card">
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
            onClick={() => handleSelectClient(conversation.clientId)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
