
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersList } from "@/components/users/users-list";

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

export default function UsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['unit-users'],
    queryFn: async () => {
      const { data: unitUsers, error: unitUsersError } = await supabase
        .from('unit_users')
        .select(`
          id,
          user_id,
          profiles!unit_users_user_id_fkey (
            full_name,
            avatar_url
          ),
          units (
            name
          )
        `);

      if (unitUsersError) {
        console.error('Error fetching unit users:', unitUsersError);
        throw unitUsersError;
      }

      // Buscar as roles separadamente para cada usuário
      const usersWithRoles = await Promise.all(
        unitUsers.map(async (user) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.user_id);

          return {
            ...user,
            user_roles: roles || []
          };
        })
      );
      
      return usersWithRoles as User[];
    }
  });

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Gestão de Usuários</h1>
      <UsersList users={users || []} />
    </div>
  );
}
