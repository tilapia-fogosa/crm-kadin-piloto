/**
 * Lista de mensagens padronizadas criadas pelo usuário
 * 
 * Log: Componente para exibir e gerenciar mensagens padronizadas existentes
 * Etapas:
 * 1. Buscar mensagens do hook useAutoMessages
 * 2. Exibir cada mensagem com nome, preview e ações
 * 3. Permitir ativar/desativar mensagem
 * 4. Permitir editar e excluir mensagem
 * 
 * Utiliza cores do sistema: card, badge, button
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Power, PowerOff } from "lucide-react";
import { useAutoMessages, useUpdateAutoMessage, useDeleteAutoMessage } from "../hooks/useAutoMessages";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AutoMessagesListProps {
  onEdit?: (id: string, nome: string, mensagem: string) => void;
}

export function AutoMessagesList({ onEdit }: AutoMessagesListProps) {
  console.log('AutoMessagesList: Renderizando lista de mensagens padronizadas');

  const { data: messages, isLoading } = useAutoMessages();
  const updateMutation = useUpdateAutoMessage();
  const deleteMutation = useDeleteAutoMessage();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    console.log('AutoMessagesList: Alternando status da mensagem:', { id, currentStatus });
    updateMutation.mutate({ id, ativo: !currentStatus });
  };

  const handleDelete = () => {
    if (deleteId) {
      console.log('AutoMessagesList: Confirmando exclusão:', deleteId);
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando mensagens...</p>;
  }

  if (!messages || messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma mensagem criada ainda. Clique em "Nova Mensagem" para criar sua primeira mensagem padronizada.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {messages.map((message) => (
              <div
                key={message.id}
                className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{message.nome}</h4>
                    <Badge variant={message.ativo ? "default" : "secondary"}>
                      {message.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {message.mensagem}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleToggleActive(message.id, message.ativo)}
                    title={message.ativo ? "Desativar" : "Ativar"}
                  >
                    {message.ativo ? (
                      <Power className="h-4 w-4 text-green-600" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>

                  {onEdit && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onEdit(message.id, message.nome, message.mensagem)}
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(message.id)}
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
            </div>
          ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mensagem padronizada? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
