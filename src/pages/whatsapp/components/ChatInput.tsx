/**
 * Input de mensagem com funcionalidade de envio
 * 
 * Log: Componente para enviar mensagens WhatsApp
 * Etapas:
 * 1. Recebe conversa como prop (telefone e clientId)
 * 2. Gerencia estado da mensagem e loading
 * 3. Valida e envia mensagem via edge function
 * 4. Salva mensagem no historico_comercial
 * 5. Exibe feedback via toast
 * 
 * Utiliza cores do sistema: muted, muted-foreground, primary
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, MessageSquare, Send } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Conversation } from "../types/whatsapp.types";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoMessages } from "../hooks/useAutoMessages";

interface ChatInputProps {
  conversation: Conversation;
  onMessageSent?: () => void;
}

export function ChatInput({ conversation, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAutoMessages, setShowAutoMessages] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: autoMessages, isLoading: isLoadingAutoMessages } = useAutoMessages();

  console.log('ChatInput: Renderizando input de mensagem para cliente:', conversation.clientId);

  // Fechar emoji picker ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
    // Não fecha o picker para permitir selecionar múltiplos emojis
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      console.log('ChatInput: Mensagem vazia, ignorando envio');
      return;
    }

    console.log('ChatInput: Enviando mensagem para cliente:', conversation.clientId);
    setIsSending(true);
    setShowEmojiPicker(false); // Fecha o picker ao enviar

    try {
      // Etapa 1: Substituir variáveis dinâmicas na mensagem
      console.log('ChatInput: Substituindo variáveis dinâmicas na mensagem');
      const { data: replaceData, error: replaceError } = await supabase.functions.invoke(
        'replace-message-variables',
        {
          body: {
            message: message.trim(),
            clientId: conversation.clientId,
          },
        }
      );

      if (replaceError) {
        console.error('ChatInput: Erro ao substituir variáveis:', replaceError);
        throw new Error('Erro ao processar variáveis da mensagem');
      }

      const processedMessage = replaceData?.processed || message.trim();
      console.log('ChatInput: Mensagem processada:', processedMessage);

      // Etapa 2: Buscar nome do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const userName = profile?.full_name || 'Usuário';

      console.log('ChatInput: Chamando edge function send-whatsapp-message');

      // Etapa 3: Enviar mensagem processada
      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phone_number: conversation.phoneNumber,
          user_name: userName,
          message: processedMessage,
          client_id: conversation.clientId
        }
      });

      if (error) {
        console.error('ChatInput: Erro ao enviar mensagem:', error);
        throw error;
      }

      console.log('ChatInput: Mensagem enviada com sucesso:', data);

      // Limpar input
      setMessage("");

      // Invalida cache para atualizar mensagens e conversas com delay de 1s
      // Isso garante que o backend teve tempo de processar a mensagem
      setTimeout(() => {
        console.log('ChatInput: Invalidando cache de mensagens e conversas após 1s');
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages', conversation.clientId] });
        queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      }, 1000);

      // Exibir toast de sucesso
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso",
      });

      // Callback para atualizar lista de mensagens
      if (onMessageSent) {
        onMessageSent();
      }

    } catch (error: any) {
      console.error('ChatInput: Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message || "Ocorreu um erro ao enviar a mensagem",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectAutoMessage = (autoMessage: string) => {
    console.log('ChatInput: Mensagem automática selecionada');
    setMessage(autoMessage);
    setShowAutoMessages(false);
  };

  // Filtrar apenas mensagens ativas
  const activeAutoMessages = autoMessages?.filter(m => m.ativo) || [];

  return (
    <div className="p-3 border-t border-border bg-muted/50 flex items-center gap-2 relative">
      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-16 left-4 z-50 shadow-xl rounded-lg"
        >
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={Theme.LIGHT}
            searchDisabled={false}
            width={300}
            height={400}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Botão Emoji */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        className={showEmojiPicker ? "text-primary" : "text-muted-foreground"}
      >
        <Smile className="h-5 w-5" />
      </Button>

      {/* Botão Anexo REMOVIDO conforme solicitado */}

      {/* Input de texto */}
      <Input
        type="text"
        placeholder="Digite uma mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
        className="flex-1"
        onClick={() => setShowEmojiPicker(false)} // Fecha picker ao focar no input
      />

      {/* Botão Enviar */}
      <Button
        variant="default"
        size="icon"
        onClick={handleSendMessage}
        disabled={isSending || !message.trim()}
      >
        <Send className="h-5 w-5" />
      </Button>

      {/* Popover de Mensagens Automáticas */}
      <Popover open={showAutoMessages} onOpenChange={setShowAutoMessages}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={showAutoMessages ? "text-primary" : "text-muted-foreground"}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="end"
          className="w-80 p-3"
        >
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-foreground mb-3">Mensagens Automáticas</h4>
            
            {isLoadingAutoMessages ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Carregando...</p>
            ) : activeAutoMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhuma mensagem ativa encontrada
              </p>
            ) : (
              <ScrollArea className="max-h-[300px]">
                <div className="space-y-1.5">
                  {activeAutoMessages.map((msg) => (
                    <Button
                      key={msg.id}
                      variant="ghost"
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      onClick={() => handleSelectAutoMessage(msg.mensagem)}
                    >
                      <div className="flex flex-col gap-0.5 w-full">
                        <span className="font-medium text-sm text-foreground">{msg.nome}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {msg.mensagem}
                        </span>
                      </div>
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
