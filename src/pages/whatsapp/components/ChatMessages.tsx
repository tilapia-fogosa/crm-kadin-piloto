/**
 * Lista de mensagens do chat
 * 
 * Log: Componente que renderiza todas as mensagens de uma conversa
 * Etapas:
 * 1. Busca mensagens usando useMessages hook
 * 2. Implementa auto-scroll para a última mensagem
 * 3. Agrupa mensagens por data
 * 4. Renderiza separadores de data
 * 5. Exibe ChatMessage para cada mensagem
 * 
 * Utiliza cores do sistema: muted, muted-foreground
 */

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChatMessage } from "./ChatMessage";
import { useMessages } from "../hooks/useMessages";

interface ChatMessagesProps {
  clientId: string;
}

export function ChatMessages({ clientId }: ChatMessagesProps) {
  console.log('ChatMessages: Renderizando mensagens para cliente:', clientId);

  const { data: messages, isLoading } = useMessages(clientId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (bottomRef.current && messages && messages.length > 0) {
      console.log('ChatMessages: Auto-scroll para última mensagem');
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Carregando mensagens...</p>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Nenhuma mensagem ainda</p>
      </div>
    );
  }

  // Agrupar mensagens por data
  const groupedMessages: { date: Date; messages: typeof messages }[] = [];
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt);
    const lastGroup = groupedMessages[groupedMessages.length - 1];

    if (!lastGroup || !isSameDay(lastGroup.date, msgDate)) {
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      lastGroup.messages.push(msg);
    }
  });

  return (
    <div className="flex-1 bg-muted/30 min-h-full">
      <div className="p-4 space-y-4 pb-4">
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Separador de data */}
            <div className="flex justify-center my-6">
              <span className="bg-background border border-border text-muted-foreground text-[10px] font-medium px-3 py-1 rounded-full shadow-sm uppercase tracking-wide">
                {format(group.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            {/* Mensagens do dia */}
            {group.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        ))}

        {/* Elemento âncora para scroll automático */}
        <div ref={bottomRef} className="h-4" />
      </div>
    </div>
  );
}
