/**
 * Item individual de conversa na lista
 * 
 * Log: Componente que renderiza uma conversa na lista lateral
 * Etapas de renderização:
 * 1. Exibe botão de atividades ao lado esquerdo
 * 2. Exibe avatar com iniciais do cliente
 * 3. Mostra nome do cliente e última mensagem (truncada)
 * 4. Formata horário da última mensagem (HH:mm, "Ontem", DD/MM)
 * 5. Indica se a última mensagem foi enviada ou recebida
 * 6. Aplica highlight quando a conversa está selecionada
 * 
 * Utiliza cores do sistema: background, foreground, muted, primary
 */

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, CheckCheck, ClipboardList, X } from "lucide-react";
import { Conversation } from "../types/whatsapp.types";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onActivityClick: (e: React.MouseEvent) => void;
  onToggleTipoAtendimento: (e: React.MouseEvent) => void;
}

export function ConversationItem({ conversation, isSelected, onClick, onActivityClick, onToggleTipoAtendimento }: ConversationItemProps) {
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
        "w-full p-3 flex items-start gap-2 hover:bg-muted/50 transition-colors border-b border-border h-20 relative",
        isSelected && "bg-primary/10 border-l-4 border-l-primary shadow-sm"
      )}
    >
      {/* Coluna de botões */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        {/* Botão de Atividades */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10"
          onClick={(e) => {
            e.stopPropagation();
            onActivityClick(e);
          }}
          title="Gerenciar atividades"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
        </Button>

        {/* Botão de Toggle Bot/Humano */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-colors relative",
            conversation.tipoAtendimento === 'bot'
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "hover:bg-muted text-muted-foreground"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleTipoAtendimento(e);
          }}
          title={`Atendimento: ${conversation.tipoAtendimento === 'bot' ? 'Bot' : 'Humano'} (clique para alternar)`}
        >
          <Bot className="h-4 w-4" />
          {conversation.tipoAtendimento === 'humano' && (
            <X className="h-3 w-3 absolute top-0 right-0 text-destructive bg-background rounded-full" strokeWidth={3} />
          )}
        </Button>
      </div>

      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarFallback className="bg-primary text-primary-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline justify-between mb-1">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className={cn(
              "truncate",
              conversation.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"
            )}>
              {conversation.clientName}
            </span>
            {/* Badge de mensagens não lidas */}
            {conversation.unreadCount > 0 && (
              <Badge 
                variant="default" 
                className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-medium"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
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
