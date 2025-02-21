
import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminRoute } from "@/components/auth/AdminRoute";

// Tipo simplificado para usuários
type User = {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
  role: string;
  unit_name: string;
};

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Iniciando busca de usuários');
      
      // Buscar profiles e unit_users em uma única query usando join
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          access_blocked,
          email_confirmed,
          unit_users!inner (
            role,
            units (
              name
            )
          )
        `)
        .eq('unit_users.active', true);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      console.log('Dados retornados:', data);

      // Mapear os resultados para o formato esperado
      const formattedUsers = (data || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        access_blocked: profile.access_blocked,
        email_confirmed: profile.email_confirmed,
        role: profile.unit_users[0]?.role || 'consultor',
        unit_name: profile.unit_users[0]?.units?.name || 'Unidade Padrão'
      }));

      console.log('Dados formatados:', formattedUsers);
      return formattedUsers as User[];
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <AdminRoute>
      <div className="container mx-auto py-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Usuários</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <UsersTable users={users || []} />

        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </AdminRoute>
  );
}
