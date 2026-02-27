
import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { useUsersFilter } from "@/components/users/hooks/useUsersFilter";
import { UsersFilters } from "@/components/users/UsersFilters";

// Interfaces para representar a estrutura exata dos dados
interface Unit {
  id: string;
  name: string;
}

interface UnitUser {
  role: string;
  unit_id: string;
  units: Unit;
  active: boolean;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
  unit_users: UnitUser[];
}

// Tipo para o formato final dos usuários na tabela
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
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          access_blocked,
          email_confirmed,
          unit_users (
            role,
            unit_id,
            active,
            units (
              id,
              name
            )
          )
        `);

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        throw error;
      }

      console.log('Dados retornados:', data);

      // Mapear os resultados para o formato esperado
      const formattedUsers = (data || []).map((profile: Profile) => {
        // Encontrar TODAS as unit_users ativas
        const activeUnitUsers = profile.unit_users?.filter(uu => uu.active && uu.units?.name) || [];
        const unitNames = activeUnitUsers.map(uu => uu.units.name).join(', ');
        
        console.log('Profile:', profile.email, 'Active units:', unitNames);
        
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          access_blocked: profile.access_blocked,
          email_confirmed: profile.email_confirmed,
          role: activeUnitUsers[0]?.role || 'consultor',
          unit_name: unitNames || 'Unidade Padrão'
        };
      });

      console.log('Dados formatados:', formattedUsers);
      return formattedUsers as User[];
    },
  });

  // Hook de filtros client-side aplicado sobre os dados carregados
  const filterState = useUsersFilter(users || []);

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

        <UsersFilters {...filterState} />

        <UsersTable users={filterState.filteredUsers} />

        <CreateUserDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
        />
      </div>
    </AdminRoute>
  );
}
