
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Button } from "@/components/ui/button";
import { UserDialog } from "./user-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
  user_roles: {
    role: 'admin' | 'consultor' | 'franqueado';
  }[];
  units: {
    name: string;
  };
}

interface UsersListProps {
  users: User[];
}

export function UsersList({ users }: UsersListProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!deleteUser) return;

    const { error } = await supabase
      .from('unit_users')
      .delete()
      .eq('id', deleteUser.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Usuário excluído com sucesso.",
    });

    queryClient.invalidateQueries({ queryKey: ['unit-users'] });
    setDeleteUser(null);
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setOpenDialog(true)}>
          Adicionar Usuário
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.profiles?.full_name || "Sem nome"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.user_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.units?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap capitalize">
                  {user.user_roles?.[0]?.role || "Sem perfil"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingUser(user)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteUser(user)}
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UserDialog 
        open={openDialog || !!editingUser} 
        onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) setEditingUser(null);
        }}
        editingUser={editingUser}
      />

      <AlertDialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O usuário perderá acesso à unidade.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
