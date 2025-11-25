/**
 * Aba de conversas (container principal)
 * 
 * Log: Componente principal da aba de conversas
 * Etapas:
 * 1. Gerencia estado da conversa selecionada
 * 2. Busca lista de conversas
 * 3. Renderiza layout de 2 colunas (lista + chat)
 * 4. Responsivo: em mobile, mostra apenas lista ou chat
 * 
 * Utiliza cores do sistema: background, card
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ConversationList } from "./ConversationList";
import { ChatArea } from "./ChatArea";
import { useConversations } from "../hooks/useConversations";

export function ConversationsTab() {
  console.log('ConversationsTab: Renderizando aba de conversas');
  
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const { data: conversations = [] } = useConversations();

  return (
    <Card className="overflow-hidden">
      <div className="flex h-[calc(100vh-250px)] min-h-[500px]">
        {/* Lista de conversas (esconde em mobile quando há conversa selecionada) */}
        <div className={selectedClientId ? "hidden md:block" : "w-full md:w-auto"}>
          <ConversationList
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
          />
        </div>

        {/* Área do chat (esconde em mobile quando não há conversa selecionada) */}
        <div className={!selectedClientId ? "hidden md:flex md:flex-1" : "w-full md:flex-1"}>
          <ChatArea
            selectedClientId={selectedClientId}
            conversations={conversations}
          />
        </div>
      </div>
    </Card>
  );
}
