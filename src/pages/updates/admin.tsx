
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, ArrowLeft, AlertTriangle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUpdates } from '@/contexts/UpdatesContext';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { SystemUpdate, UpdateType } from '@/types/updates';

// Tipos de formulário
type FormMode = 'create' | 'edit';

// Estado inicial do formulário
const initialFormState = {
  title: '',
  description: '',
  type: 'melhoria' as UpdateType,
  build_version: ''
};

// Mapear tipo de atualização para um texto amigável
const updateTypeLabels: Record<string, string> = {
  'melhoria': 'Melhoria',
  'implementacao': 'Implementação',
  'correcao': 'Correção'
};

// Componente de página de administração
function UpdatesAdminContent() {
  console.log('Renderizando conteúdo de admin de atualizações');
  
  const navigate = useNavigate();
  const { updates, isLoading, refreshUpdates, createUpdate, updateUpdate, deleteUpdate, pagination } = useUpdates();
  
  // Estado para controlar diálogos
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [formData, setFormData] = useState(initialFormState);
  const [currentUpdateId, setCurrentUpdateId] = useState<string | null>(null);

  // Manipuladores de formulário
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: string) => {
    setFormData(prev => ({ ...prev, type: value as UpdateType }));
  };

  const handleOpenCreateForm = () => {
    setFormData(initialFormState);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (update: SystemUpdate) => {
    setFormData({
      title: update.title,
      description: update.description,
      type: update.type,
      build_version: update.build_version || ''
    });
    setCurrentUpdateId(update.id);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleConfirmDelete = (id: string) => {
    setCurrentUpdateId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitForm = async () => {
    if (formMode === 'create' && createUpdate) {
      await createUpdate(formData);
    } else if (formMode === 'edit' && updateUpdate && currentUpdateId) {
      await updateUpdate(currentUpdateId, formData);
    }
    
    setIsFormOpen(false);
    setFormData(initialFormState);
    setCurrentUpdateId(null);
  };

  const handleDelete = async () => {
    if (deleteUpdate && currentUpdateId) {
      await deleteUpdate(currentUpdateId);
      setIsDeleteDialogOpen(false);
      setCurrentUpdateId(null);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/updates')}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Gerenciar Atualizações</h1>
        </div>
        
        <Button onClick={handleOpenCreateForm}>
          <Plus className="h-4 w-4 mr-1" />
          Nova Atualização
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Atualizações do Sistema</CardTitle>
          <CardDescription>
            Gerencie as atualizações, melhorias e correções que serão exibidas para os usuários
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Carregando atualizações...</p>
            </div>
          ) : updates.length === 0 ? (
            <div className="text-center py-8">
              <p>Não há atualizações para mostrar.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {updates.map(update => (
                    <TableRow key={update.id}>
                      <TableCell className="font-medium">{update.title}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${update.type === 'melhoria' ? 'bg-blue-100 text-blue-800 border-blue-300' : ''}
                            ${update.type === 'implementacao' ? 'bg-green-100 text-green-800 border-green-300' : ''}
                            ${update.type === 'correcao' ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}
                          `}
                        >
                          {updateTypeLabels[update.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>{update.build_version || '-'}</TableCell>
                      <TableCell>{formatDate(update.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleOpenEditForm(update)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleConfirmDelete(update.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {pagination.totalPages > 1 && (
          <CardFooter className="flex justify-center border-t pt-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.goToPage(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm px-4">
                Página {pagination.currentPage} de {pagination.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.goToPage(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages}
              >
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Formulário de criação/edição */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === 'create' ? 'Nova Atualização' : 'Editar Atualização'}
            </DialogTitle>
            <DialogDescription>
              {formMode === 'create' 
                ? 'Adicione uma nova atualização ao sistema'
                : 'Edite os detalhes da atualização existente'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                name="title"
                placeholder="Título da atualização"
                value={formData.title}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="melhoria">Melhoria</SelectItem>
                  <SelectItem value="implementacao">Implementação</SelectItem>
                  <SelectItem value="correcao">Correção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="build_version">Versão da Build (opcional)</Label>
              <Input
                id="build_version"
                name="build_version"
                placeholder="ex: 1.2.3"
                value={formData.build_version}
                onChange={handleFormChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detalhe as mudanças feitas nesta atualização"
                value={formData.description}
                onChange={handleFormChange}
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsFormOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmitForm}
              disabled={!formData.title || !formData.description}
            >
              {formMode === 'create' ? 'Criar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A atualização será removida da visualização dos usuários.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleDelete}
            >
              Sim, excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente Principal com AdminRoute
export default function UpdatesAdminPage() {
  return (
    <AdminRoute>
      <div className="container py-8">
        <UpdatesAdminContent />
      </div>
    </AdminRoute>
  );
}
