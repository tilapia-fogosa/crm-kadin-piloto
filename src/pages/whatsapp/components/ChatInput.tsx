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
import { SelectAutoMessageModal } from "./SelectAutoMessageModal";

interface ChatInputProps {
  conversation: Conversation;
  onMessageSent?: () => void;
}

export function ChatInput({ conversation, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAutoMessagesModal, setShowAutoMessagesModal] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      // Buscar nome do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      const userName = profile?.full_name || 'Usuário';

      console.log('ChatInput: Chamando edge function send-whatsapp-message');

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          phone_number: conversation.phoneNumber,
          user_name: userName,
          message: message.trim(),
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
    setShowAutoMessagesModal(false);
  };

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

      {/* Botão Mensagens Automáticas */}
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => setShowAutoMessagesModal(true)}
        className="text-muted-foreground"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>

      {/* Modal de Mensagens Automáticas */}
      <SelectAutoMessageModal
        open={showAutoMessagesModal}
        onOpenChange={setShowAutoMessagesModal}
        onSelect={handleSelectAutoMessage}
      />
    </div>
  );
}
