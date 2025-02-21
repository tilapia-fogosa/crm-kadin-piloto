
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

// Tipo para o resultado da query do Supabase
type ProfileWithUnit = {
  id: string;
  full_name: string;
  email: string;
  access_blocked: boolean;
  email_confirmed: boolean;
  unit_users: Array<{
    role: string;
    unit: {
      name: string;
    };
  }>;
};

export default function UsersPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
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
            unit:units(name)
          )
        `)
        .eq('unit_users.active', true)
        .order('full_name');

      if (error) throw error;

      // Transformar os dados para o formato simplificado
      return ((data || []) as ProfileWithUnit[]).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        access_blocked: profile.access_blocked,
        email_confirmed: profile.email_confirmed,
        role: profile.unit_users[0]?.role || 'consultor',
        unit_name: profile.unit_users[0]?.unit?.name || 'Unidade Padrão'
      })) as User[];
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
