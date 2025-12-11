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

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bot, CheckCheck, ClipboardList, X, Phone } from "lucide-react";
import { Conversation } from "../types/whatsapp.types";
import { getStatusConfig } from "../utils/statusConfig";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onActivityClick?: (e: React.MouseEvent) => void;
  onToggleTipoAtendimento?: (e: React.MouseEvent) => void;
  onCadastrarClick?: (phoneNumber: string) => void;
}

export function ConversationItem({ conversation, isSelected, onClick, onActivityClick, onToggleTipoAtendimento, onCadastrarClick }: ConversationItemProps) {
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

  // Configuração do status para o indicador
  const statusConfig = getStatusConfig(conversation.status);

  // Handler para o badge Cadastrar
  const handleCadastrarClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Não seleciona a conversa
    console.log('ConversationItem: Clicando em Cadastrar para telefone:', conversation.phoneNumber);
    onCadastrarClick?.(conversation.phoneNumber);
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-2 flex items-center gap-2 hover:bg-muted/50 transition-colors border-b border-border h-14 relative",
        isSelected && "bg-primary/10 border-l-4 border-l-primary shadow-sm"
      )}
    >
      {/* Coluna de botões - apenas para cadastrados */}
      {!conversation.isUnregistered && (
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          {/* Botão de Atividades */}
          {onActivityClick && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-primary/10"
              onClick={(e) => {
                e.stopPropagation();
                onActivityClick(e);
              }}
              title="Gerenciar atividades"
            >
              <ClipboardList className="h-3.5 w-3.5 text-primary" />
            </Button>
          )}

          {/* Botão de Toggle Bot/Humano */}
          {onToggleTipoAtendimento && (
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 transition-colors relative",
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
              <Bot className="h-3.5 w-3.5" />
              {conversation.tipoAtendimento === 'humano' && (
                <X className="h-2.5 w-2.5 absolute -top-0.5 -right-0.5 text-destructive bg-background rounded-full" strokeWidth={3} />
              )}
            </Button>
          )}
        </div>
      )}

      {/* Indicador de Etapa do Lead (substituiu Avatar) */}
      <div 
        className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs",
          conversation.isUnregistered ? "bg-gray-400" : statusConfig.cor
        )}
        title={conversation.isUnregistered ? 'Não cadastrado' : statusConfig.label}
      >
        {conversation.isUnregistered ? (
          <Phone className="h-4 w-4" />
        ) : (
          statusConfig.sigla
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 text-left">
        {/* Primeira linha: Nome e Horário */}
        <div className="flex items-baseline justify-between">
          <span className={cn(
            "truncate text-sm",
            conversation.unreadCount > 0 ? "font-bold text-foreground" : "font-medium text-foreground"
          )}>
            {conversation.clientName}
          </span>
          <span className="text-[10px] text-muted-foreground ml-2 flex-shrink-0">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>

        {/* Segunda linha: Última mensagem e Badges */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground flex-1 min-w-0">
            {/* Indicador de mensagem enviada */}
            {conversation.lastMessageFromMe && (
              <CheckCheck className="h-3 w-3 flex-shrink-0" />
            )}
            <span className="truncate line-clamp-1">
              {conversation.lastMessage}
            </span>
          </div>

          {/* Badges agrupadas à direita */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Badge de Cadastrar (para não cadastrados) */}
            {conversation.isUnregistered && (
              <Badge 
                className="h-4 px-1.5 flex items-center justify-center bg-purple-600 text-white text-[10px] font-medium border-purple-600 hover:bg-purple-700 cursor-pointer transition-colors"
                onClick={handleCadastrarClick}
              >
                Cadastrar
              </Badge>
            )}
            
            {/* Badge de mensagens não lidas */}
            {conversation.unreadCount > 0 && (
              <Badge 
                variant="default" 
                className="h-4 min-w-[16px] px-1 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-medium"
              >
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
