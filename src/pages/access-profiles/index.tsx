
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SystemPage {
  id: string;
  name: string;
  path: string;
  description: string | null;
}

interface Permission {
  id: string;
  profile: 'admin' | 'consultor' | 'franqueado';
  page_id: string;
}

export default function AccessProfilesPage() {
  const [selectedProfile, setSelectedProfile] = useState<'admin' | 'consultor' | 'franqueado'>('admin');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);
  const [originalPages, setOriginalPages] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch system pages
  const { data: pages } = useQuery({
    queryKey: ['system-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_pages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as SystemPage[];
    }
  });

  // Fetch permissions for selected profile
  const { data: permissions } = useQuery({
    queryKey: ['permissions', selectedProfile],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_permissions')
        .select('*')
        .eq('profile', selectedProfile);
      
      if (error) throw error;

      const permittedPageIds = (data as Permission[]).map(p => p.page_id);
      setSelectedPages(permittedPageIds);
      setOriginalPages(permittedPageIds);
      
      return data as Permission[];
    }
  });

  // Mutation to update permissions
  const updatePermissions = useMutation({
    mutationFn: async () => {
      // Remove permissions that are no longer selected
      const pagesToRemove = originalPages.filter(id => !selectedPages.includes(id));
      if (pagesToRemove.length > 0) {
        await supabase
          .from('access_permissions')
          .delete()
          .eq('profile', selectedProfile)
          .in('page_id', pagesToRemove);
      }

      // Add new permissions
      const pagesToAdd = selectedPages.filter(id => !originalPages.includes(id));
      if (pagesToAdd.length > 0) {
        const newPermissions = pagesToAdd.map(pageId => ({
          profile: selectedProfile,
          page_id: pageId
        }));
        
        await supabase
          .from('access_permissions')
          .insert(newPermissions);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast({
        title: "Sucesso",
        description: "Permissões atualizadas com sucesso",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar as permissões",
      });
    }
  });

  const handlePageToggle = (pageId: string) => {
    setSelectedPages(current =>
      current.includes(pageId)
        ? current.filter(id => id !== pageId)
        : [...current, pageId]
    );
  };

  const handleSave = () => {
    setShowConfirmDialog(true);
  };

  const confirmSave = () => {
    updatePermissions.mutate();
    setShowConfirmDialog(false);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Perfis de Acesso</h1>
      
      <div className="mb-6 flex gap-2">
        <Button
          variant={selectedProfile === 'admin' ? 'default' : 'outline'}
          onClick={() => setSelectedProfile('admin')}
        >
          Admin
        </Button>
        <Button
          variant={selectedProfile === 'consultor' ? 'default' : 'outline'}
          onClick={() => setSelectedProfile('consultor')}
        >
          Consultor
        </Button>
        <Button
          variant={selectedProfile === 'franqueado' ? 'default' : 'outline'}
          onClick={() => setSelectedProfile('franqueado')}
        >
          Franqueado
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Acesso</TableHead>
              <TableHead>Nome da Página</TableHead>
              <TableHead>Caminho</TableHead>
              <TableHead>Descrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages?.map((page) => (
              <TableRow key={page.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedPages.includes(page.id)}
                    onCheckedChange={() => handlePageToggle(page.id)}
                    disabled={selectedProfile === 'admin'} // Admin sempre tem acesso a tudo
                  />
                </TableCell>
                <TableCell>{page.name}</TableCell>
                <TableCell>{page.path}</TableCell>
                <TableCell>{page.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={selectedProfile === 'admin'} // Admin não pode ser modificado
        >
          Salvar Alterações
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alterações</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja alterar as permissões do perfil {selectedProfile}?
              Esta ação afetará todos os usuários com este perfil.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
