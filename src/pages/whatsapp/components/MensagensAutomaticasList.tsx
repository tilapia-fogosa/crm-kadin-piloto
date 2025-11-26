/**
 * Lista de mensagens automáticas (Boas-vindas e Valorização)
 * 
 * Log: Componente para exibir as 2 mensagens automáticas fixas
 * Etapas:
 * 1. Buscar mensagens do hook
 * 2. Exibir cada mensagem com tipo, preview e ações
 * 3. Permitir ativar/desativar
 * 4. Permitir editar (mas não criar nem excluir)
 */

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Power, PowerOff } from "lucide-react";
import { 
  useMensagensAutomaticas, 
  useUpdateMensagemAutomatica,
  getTipoLabel 
} from "../hooks/useMensagensAutomaticas";

interface MensagensAutomaticasListProps {
  selectedUnitId: string | null;
  onEdit?: (id: string, tipo: string, mensagem: string) => void;
}

export function MensagensAutomaticasList({ selectedUnitId, onEdit }: MensagensAutomaticasListProps) {
  console.log('MensagensAutomaticasList: Renderizando lista de mensagens automáticas');

  const { data: messages, isLoading } = useMensagensAutomaticas(selectedUnitId);
  const updateMutation = useUpdateMensagemAutomatica();

  const handleToggleActive = (id: string, currentStatus: boolean) => {
    console.log('MensagensAutomaticasList: Alternando status:', { id, currentStatus });
    updateMutation.mutate({ id, ativo: !currentStatus });
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Carregando mensagens...</p>;
  }

  if (!messages || messages.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhuma mensagem automática configurada. As mensagens serão criadas automaticamente.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className="flex items-start gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm">{getTipoLabel(message.tipo)}</h4>
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
                onClick={() => onEdit(message.id, message.tipo, message.mensagem)}
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
