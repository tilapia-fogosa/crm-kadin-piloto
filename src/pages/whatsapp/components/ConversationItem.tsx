/**
 * Item individual de conversa na lista
 * 
 * Log: Componente que renderiza uma conversa na lista lateral
 * Etapas de renderização:
 * 1. Exibe avatar com iniciais do cliente
 * 2. Mostra nome do cliente e última mensagem (truncada)
 * 3. Formata horário da última mensagem (HH:mm, "Ontem", DD/MM)
 * 4. Indica se a última mensagem foi enviada ou recebida
 * 5. Aplica highlight quando a conversa está selecionada
 * 
 * Utiliza cores do sistema: background, foreground, muted, primary
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";
import { Conversation } from "../types/whatsapp.types";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({ conversation, isSelected, onClick }: ConversationItemProps) {
  console.log('ConversationItem: Renderizando conversa:', conversation.clientName);
  
  // Formatar horário da última mensagem
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale: ptBR });
    }
    if (isYesterday(date)) {
      return 'Ontem';
    }
    return format(date, 'dd/MM', { locale: ptBR });
  };

  // Pegar iniciais para o avatar
  const initials = conversation.primeiroNome
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border h-20",
        isSelected && "bg-muted"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline justify-between mb-1">
          <span className="font-medium text-foreground truncate">
            {conversation.clientName}
          </span>
          <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          {/* Indicador de mensagem enviada */}
          {conversation.lastMessageFromMe && (
            <CheckCheck className="h-3 w-3 flex-shrink-0" />
          )}
          <span className="truncate line-clamp-1">
            {conversation.lastMessage}
          </span>
        </div>
      </div>
    </button>
  );
}
