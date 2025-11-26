/**
 * Modal para editar mensagens automáticas
 * 
 * Log: Modal de edição de mensagens automáticas (sem criar/deletar)
 * Etapas:
 * 1. Recebe dados de edição via props
 * 2. Renderiza formulário dentro de Dialog
 * 3. Permite apenas edição (não criar)
 * 4. Fecha ao concluir operação
 */

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, FileText, Smile } from "lucide-react";
import { toast } from "sonner";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useUpdateMensagemAutomatica, getTipoLabel } from "../hooks/useMensagensAutomaticas";
import { DynamicFieldsModal } from "./DynamicFieldsModal";

interface MensagemAutomaticaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData: {
    id: string;
    tipo: string;
    mensagem: string;
  } | null;
}

export function MensagemAutomaticaModal({ 
  open, 
  onOpenChange, 
  editData 
}: MensagemAutomaticaModalProps) {
  console.log('MensagemAutomaticaModal: Renderizando modal', { open, editData });

  const [mensagem, setMensagem] = useState("");
  const [fieldsModalOpen, setFieldsModalOpen] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const updateMutation = useUpdateMensagemAutomatica();

  // Fechar emoji picker ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Preencher campos quando editando
  useEffect(() => {
    if (editData && open) {
      console.log('MensagemAutomaticaModal: Preenchendo dados para edição');
      setMensagem(editData.mensagem);
    }
  }, [editData, open]);

  const handleInsertField = (field: string) => {
    console.log('MensagemAutomaticaModal: Inserindo variável:', field);
    
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

  const onEmojiClick = (emojiData: EmojiClickData) => {
    console.log('MensagemAutomaticaModal: Inserindo emoji:', emojiData.emoji);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = mensagem;
    
    const newText = text.substring(0, start) + emojiData.emoji + text.substring(end);
    setMensagem(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emojiData.emoji.length, start + emojiData.emoji.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editData) return;

    console.log('MensagemAutomaticaModal: Salvando mensagem:', { mensagem, editData });

    if (!mensagem.trim()) {
      console.error('MensagemAutomaticaModal: Mensagem vazia');
      toast.error('A mensagem não pode estar vazia');
      return;
    }

    updateMutation.mutate(
      { id: editData.id, mensagem },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isLoading = updateMutation.isPending;

  if (!editData) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Editar Mensagem Automática - {getTipoLabel(editData.tipo)}
            </DialogTitle>
            <DialogDescription>
              Personalize a mensagem automática com variáveis dinâmicas
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Conteúdo da mensagem */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="mensagem">Mensagem *</Label>
                <div className="flex gap-2">
                  <div className="relative" ref={emojiPickerRef}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-3 w-3" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute right-0 top-10 z-50">
                        <EmojiPicker onEmojiClick={onEmojiClick} />
                      </div>
                    )}
                  </div>
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
              </div>
              <Textarea
                ref={textareaRef}
                id="mensagem"
                placeholder="Digite a mensagem automática..."
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
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
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
