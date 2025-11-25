/**
 * Input de mensagem (visual apenas, sem funcionalidade de envio)
 * 
 * Log: Componente mockup do input de mensagem
 * Etapas:
 * 1. Renderiza input de texto desabilitado
 * 2. Exibe botões de emoji, anexo e áudio
 * 3. Aplica cores do sistema para consistência
 * 
 * Nota: Por enquanto é apenas visual, funcionalidade de envio será implementada futuramente
 * 
 * Utiliza cores do sistema: muted, muted-foreground
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smile, Paperclip, Mic } from "lucide-react";

export function ChatInput() {
  console.log('ChatInput: Renderizando input de mensagem (mockup)');
  
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
        disabled
        className="flex-1"
      />

      {/* Botão Áudio */}
      <Button variant="ghost" size="icon" disabled>
        <Mic className="h-5 w-5" />
      </Button>
    </div>
  );
}
