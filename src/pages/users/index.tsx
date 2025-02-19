
import { UsersTable } from "@/components/users/users-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { CreateUserDialog } from "@/components/users/create-user-dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { Database } from "@/integrations/supabase/types";

// Define flat types to avoid circular references
type Profile = Database['public']['Tables']['profiles']['Row'];
type Unit = Database['public']['Tables']['units']['Row'];
type UnitUser = Omit<Database['public']['Tables']['unit_users']['Row'], 'unit'> & {
  unit: Pick<Unit, 'name'>;
};

interface User extends Omit<Profile, 'unit_users'> {
  unit_users: UnitUser[];
}

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Primeiro, buscar os perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, access_blocked, email_confirmed')
        .eq('active', true)
        .order('full_name');

      if (profilesError) throw profilesError;

      // Depois, buscar as unidades de cada perfil
      const usersWithUnits = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: unitUsers, error: unitError } = await supabase
            .from('unit_users')
            .select('role, unit:units(name)')
            .eq('user_id', profile.id)
            .eq('active', true);

          if (unitError) throw unitError;

          return {
            ...profile,
            unit_users: unitUsers || []
          };
        })
      );

      return usersWithUnits as User[];
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
