/**
 * Drawer para enviar mensagens para números não cadastrados
 * 
 * Log: Componente que permite enviar mensagens WhatsApp para números que não estão cadastrados no sistema
 * Etapas:
 * 1. Valida número de telefone (apenas números, 10 ou 11 dígitos)
 * 2. Permite digitação de mensagem com emoji picker
 * 3. Envia mensagem via edge function send-whatsapp-message
 * 4. Salva no historico_comercial com client_id null
 * 5. Exibe feedback via toast
 */

import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smile, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { z } from "zod";

// Schema de validação para o número de telefone
const phoneSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, { message: "Apenas números são permitidos" })
  .min(10, { message: "Número deve ter pelo menos 10 dígitos" })
  .max(11, { message: "Número deve ter no máximo 11 dígitos" });

interface SendToUnregisteredDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SendToUnregisteredDrawer({ open, onOpenChange }: SendToUnregisteredDrawerProps) {
  console.log('SendToUnregisteredDrawer: Renderizando drawer');

  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Validar número ao digitar
  const handlePhoneChange = (value: string) => {
    // Remove caracteres não numéricos
    const cleanValue = value.replace(/\D/g, "");
    setPhoneNumber(cleanValue);

    // Valida o número
    try {
      phoneSchema.parse(cleanValue);
      setPhoneError("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPhoneError(error.errors[0]?.message || "Número inválido");
      }
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = async () => {
    console.log('SendToUnregisteredDrawer: Iniciando envio de mensagem');

    // Validação do número
    try {
      phoneSchema.parse(phoneNumber);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Número inválido",
          description: error.errors[0]?.message || "Verifique o número de telefone",
          variant: "destructive",
        });
        return;
      }
    }

    // Validação da mensagem
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Digite uma mensagem para enviar",
        variant: "destructive",
      });
      return;
    }

    // Validação de tamanho da mensagem
    if (message.trim().length > 1000) {
      toast({
        title: "Mensagem muito longa",
        description: "A mensagem deve ter no máximo 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setShowEmojiPicker(false);

    try {
      // Buscar usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('SendToUnregisteredDrawer: Enviando mensagem via edge function');

      // Formatar número para envio (adicionar 55 se necessário)
      const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;

      // Enviar via edge function
      const { data: sendData, error: sendError } = await supabase.functions.invoke(
        'send-whatsapp-message',
        {
          body: {
            to: formattedPhone,
            message: message.trim(),
          },
        }
      );

      if (sendError) {
        console.error('SendToUnregisteredDrawer: Erro ao enviar mensagem:', sendError);
        throw sendError;
      }

      console.log('SendToUnregisteredDrawer: Mensagem enviada com sucesso:', sendData);

      // Salvar no histórico comercial
      const { error: historyError } = await supabase
        .from('historico_comercial')
        .insert({
          client_id: null, // Número não cadastrado
          telefone: formattedPhone,
          mensagem: message.trim(),
          from_me: true,
          lida: true,
          created_by: user.id,
        });

      if (historyError) {
        console.error('SendToUnregisteredDrawer: Erro ao salvar no histórico:', historyError);
        // Não vamos lançar erro aqui pois a mensagem já foi enviada
      }

      toast({
        title: "Mensagem enviada",
        description: "Mensagem enviada com sucesso",
      });

      // Limpar formulário
      setPhoneNumber("");
      setMessage("");
      setPhoneError("");

      // Invalidar queries para atualizar lista de conversas
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });

      // Fechar drawer
      onOpenChange(false);

    } catch (error: any) {
      console.error('SendToUnregisteredDrawer: Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar a mensagem",
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl flex flex-col">
        <SheetHeader>
          <SheetTitle>Enviar para número não cadastrado</SheetTitle>
          <SheetDescription>
            Digite o número de telefone e a mensagem que deseja enviar
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 py-4">
          {/* Campo de número de telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Número de Telefone</Label>
            <Input
              id="phone"
              type="text"
              placeholder="DDD + número (apenas números)"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={11}
              className={phoneError ? "border-destructive" : ""}
            />
            {phoneError && (
              <p className="text-xs text-destructive">{phoneError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Exemplo: 43999887766 (11 dígitos com DDD)
            </p>
          </div>

          {/* Área de mensagem */}
          <div className="flex-1 flex flex-col">
            <Label htmlFor="message" className="mb-2">Mensagem</Label>
            <div className="flex-1 border border-border rounded-md p-2 bg-muted/10">
              <textarea
                id="message"
                placeholder="Digite sua mensagem..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending}
                className="w-full h-full bg-transparent border-none outline-none resize-none text-sm"
                style={{ minHeight: '150px' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {message.length}/1000 caracteres
            </p>
          </div>
        </div>

        {/* Rodapé de envio */}
        <div className="border-t border-border pt-4 pb-2">
          <div className="flex items-center gap-2">
            {/* Botão Emoji Picker */}
            <div ref={emojiPickerRef} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={isSending}
              >
                <Smile className="h-5 w-5" />
              </Button>
              
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme={Theme.AUTO}
                    height={350}
                    width={300}
                  />
                </div>
              )}
            </div>

            {/* Input de mensagem rápida (opcional) */}
            <Input
              type="text"
              placeholder="Digite uma mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1"
              onClick={() => setShowEmojiPicker(false)}
            />

            {/* Botão Enviar */}
            <Button
              onClick={handleSendMessage}
              disabled={isSending || !message.trim() || !!phoneError || !phoneNumber}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
