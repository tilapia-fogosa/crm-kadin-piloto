/**
 * Modal para criar/editar mensagens padronizadas
 * 
 * Log: Modal com formulário de mensagem padronizada
 * Etapas:
 * 1. Recebe dados de edição via props
 * 2. Renderiza formulário dentro de Dialog
 * 3. Permite criação ou edição
 * 4. Fecha ao concluir operação
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateAutoMessage, useUpdateAutoMessage } from "../hooks/useAutoMessages";
import { DynamicFieldsModal } from "./DynamicFieldsModal";

interface AutoMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    nome: string;
    mensagem: string;
  } | null;
}

export function AutoMessageModal({ open, onOpenChange, editData }: AutoMessageModalProps) {
  console.log('AutoMessageModal: Renderizando modal', { open, editData });

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [fieldsModalOpen, setFieldsModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createMutation = useCreateAutoMessage();
  const updateMutation = useUpdateAutoMessage();

  // Preencher campos quando editando
  useEffect(() => {
    if (editData) {
      console.log('AutoMessageModal: Preenchendo dados para edição');
      setNome(editData.nome);
      setMensagem(editData.mensagem);
    } else {
      setNome("");
      setMensagem("");
    }
  }, [editData, open]);

  const handleInsertField = (field: string) => {
    console.log('AutoMessageModal: Inserindo variável:', field);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = mensagem;
    
    const newText = text.substring(0, start) + field + text.substring(end);
    setMensagem(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + field.length, start + field.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('AutoMessageModal: Salvando mensagem:', { nome, mensagem, editData });

    if (!nome.trim() || !mensagem.trim()) {
      console.error('AutoMessageModal: Campos obrigatórios não preenchidos');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editData) {
      updateMutation.mutate(
        { id: editData.id, nome, mensagem },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    } else {
      createMutation.mutate(
        { nome, mensagem },
        {
          onSuccess: () => {
            onOpenChange(false);
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editData ? "Editar Mensagem Padronizada" : "Nova Mensagem Padronizada"}
            </DialogTitle>
            <DialogDescription>
              Crie mensagens padronizadas personalizadas com variáveis dinâmicas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome da mensagem */}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Mensagem *</Label>
              <Input
                id="nome"
                placeholder="Ex: Boas-vindas"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {/* Conteúdo da mensagem */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mensagem">Mensagem *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFieldsModalOpen(true)}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Inserir Variáveis
                </Button>
              </div>
              <Textarea
                ref={textareaRef}
                id="mensagem"
                placeholder="Digite a mensagem padronizada..."
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={6}
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Clique em "Inserir Variáveis" para adicionar campos dinâmicos como {'{{nome}}'} ou {'{{primeiro_nome}}'}
              </p>
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {editData ? "Atualizar" : "Criar"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de variáveis dinâmicas */}
      <DynamicFieldsModal
        open={fieldsModalOpen}
        onOpenChange={setFieldsModalOpen}
        onInsertField={handleInsertField}
      />
    </>
  );
}
