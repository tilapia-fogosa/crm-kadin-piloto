import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type LeadSource = {
  id: string;
  name: string;
  is_system: boolean;
};

const LeadSourceForm = ({ onClose, initialData = null }: { onClose: () => void; initialData?: LeadSource | null }) => {
  const [name, setName] = React.useState(initialData?.name || "");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const id = initialData?.id || name.toLowerCase().replace(/\s+/g, '-');
      
      if (initialData) {
        await supabase
          .from('lead_sources')
          .update({ name })
          .eq('id', initialData.id);
      } else {
        await supabase
          .from('lead_sources')
          .insert([{ id, name }]);
      }
      
      toast({
        title: `Origem ${initialData ? 'atualizada' : 'adicionada'} com sucesso!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar origem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar origem",
        description: "Ocorreu um erro ao tentar salvar a origem do lead.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Nome da Origem
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Atualizar' : 'Adicionar'}
        </Button>
      </div>
    </form>
  );
};

export default function LeadSourcesTable() {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingSource, setEditingSource] = React.useState<LeadSource | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leadSources, isLoading } = useQuery({
    queryKey: ['leadSources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as LeadSource[];
    },
  });

  const handleDelete = async (source: LeadSource) => {
    try {
      const { error } = await supabase
        .from('lead_sources')
        .delete()
        .eq('id', source.id);

      if (error) throw error;

      toast({
        title: "Origem removida com sucesso!",
      });
      
      queryClient.invalidateQueries({ queryKey: ['leadSources'] });
    } catch (error) {
      console.error('Erro ao deletar origem:', error);
      toast({
        variant: "destructive",
        title: "Erro ao remover origem",
        description: "Ocorreu um erro ao tentar remover a origem do lead.",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Origens dos Leads</h2>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2" />
              Adicionar Origem
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Origem</DialogTitle>
            </DialogHeader>
            <LeadSourceForm onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leadSources?.map((source) => (
            <TableRow key={source.id}>
              <TableCell>{source.name}</TableCell>
              <TableCell className="space-x-2">
                <Dialog open={editingSource?.id === source.id} onOpenChange={(open) => !open && setEditingSource(null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingSource(source)}
                      disabled={source.is_system}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Origem</DialogTitle>
                    </DialogHeader>
                    <LeadSourceForm 
                      initialData={source} 
                      onClose={() => setEditingSource(null)} 
                    />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      disabled={source.is_system}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir esta origem? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(source)}>
                        Confirmar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}