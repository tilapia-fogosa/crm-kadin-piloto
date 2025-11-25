/**
 * Área do chat (lado direito)
 * 
 * Log: Componente que exibe o chat completo ou placeholder
 * Etapas:
 * 1. Verifica se há conversa selecionada
 * 2. Se não: exibe placeholder "Selecione uma conversa"
 * 3. Se sim: renderiza ChatHeader + ChatMessages + ChatInput
 * 4. Busca dados da conversa no array de conversas
 * 
 * Utiliza cores do sistema: background, muted-foreground
 */

import { MessageCircle } from "lucide-react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { Conversation } from "../types/whatsapp.types";

interface ChatAreaProps {
  selectedClientId: string | null;
  conversations: Conversation[];
}

export function ChatArea({ selectedClientId, conversations }: ChatAreaProps) {
  console.log('ChatArea: Renderizando área do chat, cliente selecionado:', selectedClientId);
  
  const selectedConversation = conversations.find(
    conv => conv.clientId === selectedClientId
  );

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground">
        <MessageCircle className="h-24 w-24 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
        <p className="text-sm">
          Escolha uma conversa na lista para visualizar as mensagens
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <ChatHeader conversation={selectedConversation} />
      <div className="flex-1 overflow-hidden">
        <ChatMessages clientId={selectedConversation.clientId} />
      </div>
      <div className="flex-shrink-0">
        <ChatInput conversation={selectedConversation} />
      </div>
    </div>
  );
}
