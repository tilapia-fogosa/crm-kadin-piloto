/**
 * Balão de mensagem individual
 * 
 * Log: Componente que renderiza uma mensagem no chat
 * Etapas de renderização:
 * 1. Determina alinhamento baseado em fromMe (direita/esquerda)
 * 2. Aplica cores diferentes para mensagens enviadas vs recebidas
 * 3. Formata horário da mensagem
 * 4. Exibe conteúdo com quebras de linha preservadas
 * 
 * Utiliza cores do sistema:
 * - Mensagem enviada (fromMe=true): primary/primary-foreground
 * - Mensagem recebida (fromMe=false): card/card-foreground
 */

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Message } from "../types/whatsapp.types";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  console.log('ChatMessage: Renderizando mensagem ID:', message.id);

  const time = format(new Date(message.createdAt), 'HH:mm', { locale: ptBR });

  return (
    <div
      className={cn(
        "flex mb-2",
        message.fromMe ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
          message.fromMe
            ? "bg-[#f7dcc9] text-black rounded-br-none"
            : "bg-card text-card-foreground rounded-bl-none border border-border"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.tipoMensagem === 'audio' && (
            <span className="font-bold">Áudio transcrito: </span>
          )}
          {message.content}
        </p>
        <div className="flex items-center justify-between mt-1 text-xs opacity-70 gap-2">
          {message.fromMe && message.createdByName && (
            <span>{message.createdByName}</span>
          )}
          <span className={!message.fromMe || !message.createdByName ? "ml-auto" : ""}>
            {time}
          </span>
        </div>
      </div>
    </div>
  );
}
