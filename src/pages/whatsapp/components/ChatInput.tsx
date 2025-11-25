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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Mic, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Conversation } from "../types/whatsapp.types";

interface ChatInputProps {
  conversation: Conversation;
  onMessageSent?: () => void;
}

export function ChatInput({ conversation, onMessageSent }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  console.log('ChatInput: Renderizando input de mensagem para cliente:', conversation.clientId);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      console.log('ChatInput: Mensagem vazia, ignorando envio');
      return;
    }

    console.log('ChatInput: Enviando mensagem para cliente:', conversation.clientId);
    setIsSending(true);

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

  return (
    <div className="p-3 border-t border-border bg-muted/50 flex items-center gap-2">
      {/* Botão Emoji */}
      <Button variant="ghost" size="icon" disabled>
        <Smile className="h-5 w-5" />
      </Button>

      {/* Botão Anexo */}
      <Button variant="ghost" size="icon" disabled>
        <Paperclip className="h-5 w-5" />
      </Button>

      {/* Input de texto */}
      <Input
        type="text"
        placeholder="Digite uma mensagem..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isSending}
        className="flex-1"
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

      {/* Botão Áudio */}
      <Button variant="ghost" size="icon" disabled>
        <Mic className="h-5 w-5" />
      </Button>
    </div>
  );
}
