/**
 * Modal para selecionar mensagens automáticas
 * 
 * Log: Modal compacto que lista mensagens automáticas ativas do usuário
 * Etapas:
 * 1. Busca mensagens automáticas usando useAutoMessages
 * 2. Filtra apenas mensagens ativas
 * 3. Exibe lista de mensagens para seleção
 * 4. Ao clicar, retorna a mensagem via callback onSelect
 * 
 * Utiliza cores do sistema: background, foreground, muted, primary
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAutoMessages } from "../hooks/useAutoMessages";
import { MessageSquare } from "lucide-react";

interface SelectAutoMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (message: string) => void;
}

export function SelectAutoMessageModal({ open, onOpenChange, onSelect }: SelectAutoMessageModalProps) {
  const { data: messages, isLoading } = useAutoMessages();

  console.log('SelectAutoMessageModal: Renderizando modal, mensagens:', messages?.length || 0);

  // Filtrar apenas mensagens ativas
  const activeMessages = messages?.filter(m => m.ativo) || [];

  const handleSelectMessage = (message: string) => {
    console.log('SelectAutoMessageModal: Mensagem selecionada');
    onSelect(message);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar Mensagem Automática</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-muted-foreground">Carregando mensagens...</p>
          </div>
        ) : activeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhuma mensagem automática ativa encontrada.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Crie mensagens automáticas na aba de configuração.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 p-1">
              {activeMessages.map((msg) => (
                <Button
                  key={msg.id}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  onClick={() => handleSelectMessage(msg.mensagem)}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <span className="font-medium text-foreground">{msg.nome}</span>
                    <span className="text-sm text-muted-foreground line-clamp-2">
                      {msg.mensagem}
                    </span>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
