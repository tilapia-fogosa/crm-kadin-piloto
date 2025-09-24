import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, GripVertical, Save, X } from "lucide-react";
import { useDynamicActivities } from "../hooks/useDynamicActivities";
import { useToast } from "@/hooks/use-toast";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface ConfiguracaoAtividadesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AtividadeForm {
  id?: string;
  nome: string;
  descricao: string;
}

export function ConfiguracaoAtividadesModal({ isOpen, onClose }: ConfiguracaoAtividadesModalProps) {
  const { dynamicActivities, isLoading, createActivity, updateActivity, deleteActivity, reorderActivity } = useDynamicActivities();
  const { toast } = useToast();
  const [editingActivity, setEditingActivity] = useState<AtividadeForm | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // LOG: Inicializando modal de configuração
  console.log("📝 [ConfiguracaoAtividadesModal] Modal aberto:", isOpen);
  console.log("📝 [ConfiguracaoAtividadesModal] Atividades carregadas:", dynamicActivities?.length || 0);

  const handleCreateActivity = async (formData: Omit<AtividadeForm, 'id'>) => {
    try {
      console.log("📝 [ConfiguracaoAtividadesModal] Criando nova atividade:", formData);
      await createActivity(formData);
      setIsCreating(false);
      toast({
        title: "Atividade criada",
        description: "A nova atividade foi adicionada com sucesso.",
      });
    } catch (error) {
      console.error("❌ [ConfiguracaoAtividadesModal] Erro ao criar atividade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a atividade.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateActivity = async (id: string, formData: Omit<AtividadeForm, 'id'>) => {
    try {
      console.log("📝 [ConfiguracaoAtividadesModal] Atualizando atividade:", id, formData);
      await updateActivity({ id, updates: formData });
      setEditingActivity(null);
      toast({
        title: "Atividade atualizada",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error("❌ [ConfiguracaoAtividadesModal] Erro ao atualizar atividade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a atividade.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteActivity = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover a atividade "${nome}"?`)) {
      return;
    }

    try {
      console.log("📝 [ConfiguracaoAtividadesModal] Removendo atividade:", id);
      await deleteActivity(id);
      toast({
        title: "Atividade removida",
        description: "A atividade foi desativada com sucesso.",
      });
    } catch (error) {
      console.error("❌ [ConfiguracaoAtividadesModal] Erro ao remover atividade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a atividade.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const activity = dynamicActivities[sourceIndex];
    const newOrder = destinationIndex + 1;

    try {
      console.log("📝 [ConfiguracaoAtividadesModal] Reordenando atividade:", activity.id, "para posição:", newOrder);
      await reorderActivity({ id: activity.id, newOrder });
    } catch (error) {
      console.error("❌ [ConfiguracaoAtividadesModal] Erro ao reordenar atividade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar a atividade.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Configuração de Atividades</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configuração de Atividades Pós-Venda</DialogTitle>
          <DialogDescription>
            Configure as atividades que serão exibidas na tabela de processos pós-matrícula.
            Você pode adicionar, editar, remover e reordenar as atividades.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Botão para adicionar nova atividade */}
          <div className="flex justify-end">
            <Button
              onClick={() => setIsCreating(true)}
              className="gap-2"
              variant="default"
            >
              <Plus className="h-4 w-4" />
              Nova Atividade
            </Button>
          </div>

          {/* Formulário para criar/editar */}
          {(isCreating || editingActivity) && (
            <AtividadeForm
              activity={editingActivity}
              onSubmit={editingActivity 
                ? (data) => handleUpdateActivity(editingActivity.id!, data)
                : handleCreateActivity
              }
              onCancel={() => {
                setIsCreating(false);
                setEditingActivity(null);
              }}
            />
          )}

          {/* Lista de atividades com drag and drop */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="activities">
                  {(provided) => (
                    <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                      {dynamicActivities.map((activity, index) => (
                        <Draggable
                          key={activity.id}
                          draggableId={activity.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <TableRow
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={snapshot.isDragging ? "bg-muted" : ""}
                            >
                              <TableCell {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </TableCell>
                              <TableCell className="font-medium">
                                {activity.nome}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {activity.descricao || "Sem descrição"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={activity.ativa ? "default" : "secondary"}>
                                  {activity.ativa ? "Ativa" : "Inativa"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingActivity({
                                      id: activity.id,
                                      nome: activity.nome,
                                      descricao: activity.descricao || ""
                                    })}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteActivity(activity.id, activity.nome)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </TableBody>
                  )}
                </Droppable>
              </DragDropContext>
            </Table>
          </div>

          {dynamicActivities.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhuma atividade configurada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando a primeira atividade pós-venda.
              </p>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Primeira Atividade
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface AtividadeFormProps {
  activity?: AtividadeForm | null;
  onSubmit: (data: Omit<AtividadeForm, 'id'>) => void;
  onCancel: () => void;
}

function AtividadeForm({ activity, onSubmit, onCancel }: AtividadeFormProps) {
  const [nome, setNome] = useState(activity?.nome || "");
  const [descricao, setDescricao] = useState(activity?.descricao || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome.trim()) {
      return;
    }

    console.log("📝 [AtividadeForm] Submetendo formulário:", { nome, descricao });
    onSubmit({ nome: nome.trim(), descricao: descricao.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <h4 className="font-semibold">
        {activity ? "Editar Atividade" : "Nova Atividade"}
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nome" className="text-sm font-medium">
            Nome da Atividade *
          </label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Envio de documentos"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="descricao" className="text-sm font-medium">
            Descrição
          </label>
          <Textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição opcional da atividade"
            rows={3}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit">
          <Save className="h-4 w-4 mr-2" />
          {activity ? "Salvar Alterações" : "Criar Atividade"}
        </Button>
      </div>
    </form>
  );
}