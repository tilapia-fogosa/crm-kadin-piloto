/**
 * Formulário para criar mensagens padronizadas vinculadas ao usuário
 * 
 * Log: Componente para criar/editar mensagens padronizadas do WhatsApp
 * Etapas:
 * 1. Formulário com campos: nome, mensagem
 * 2. Botão para abrir modal de variáveis dinâmicas
 * 3. Inserir variáveis na posição do cursor
 * 4. Integração com Supabase para salvar mensagens
 * 5. Listar mensagens existentes do usuário
 * 
 * Utiliza cores do sistema: card, input, button
 */

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { useCreateAutoMessage, useUpdateAutoMessage } from "../hooks/useAutoMessages";
import { DynamicFieldsModal } from "./DynamicFieldsModal";
import { AutoMessagesList } from "./AutoMessagesList";

export function AutoMessageForm() {
  console.log('AutoMessageForm: Renderizando formulário de mensagem padronizada');

  const [nome, setNome] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createMutation = useCreateAutoMessage();
  const updateMutation = useUpdateAutoMessage();

  const handleInsertField = (field: string) => {
    console.log('AutoMessageForm: Inserindo variável:', field);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = mensagem;
    
    const newText = text.substring(0, start) + field + text.substring(end);
    setMensagem(newText);
    
    // Posicionar cursor após a variável inserida
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + field.length, start + field.length);
    }, 0);
  };

  const handleEdit = (id: string, nome: string, mensagem: string) => {
    console.log('AutoMessageForm: Editando mensagem:', { id, nome, mensagem });
    setEditingId(id);
    setNome(nome);
    setMensagem(mensagem);
    
    // Scroll para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    console.log('AutoMessageForm: Cancelando edição');
    setEditingId(null);
    setNome("");
    setMensagem("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('AutoMessageForm: Salvando mensagem:', { nome, mensagem, editingId });

    // Validação básica
    if (!nome.trim() || !mensagem.trim()) {
      console.error('AutoMessageForm: Campos obrigatórios não preenchidos');
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingId) {
      // Atualizar mensagem existente
      updateMutation.mutate(
        { id: editingId, nome, mensagem },
        {
          onSuccess: () => {
            setEditingId(null);
            setNome("");
            setMensagem("");
          },
        }
      );
    } else {
      // Criar nova mensagem
      createMutation.mutate(
        { nome, mensagem },
        {
          onSuccess: () => {
            setNome("");
            setMensagem("");
          },
        }
      );
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {editingId ? "Editar Mensagem Padronizada" : "Nova Mensagem Padronizada"}
          </CardTitle>
          <CardDescription>
            Crie mensagens padronizadas personalizadas com variáveis dinâmicas
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                  onClick={() => setModalOpen(true)}
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
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  "Salvando..."
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {editingId ? "Atualizar Mensagem" : "Criar Mensagem"}
                  </>
                )}
              </Button>
              
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de mensagens existentes */}
      <AutoMessagesList onEdit={handleEdit} />

      {/* Modal de variáveis dinâmicas */}
      <DynamicFieldsModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onInsertField={handleInsertField}
      />
    </div>
  );
}
