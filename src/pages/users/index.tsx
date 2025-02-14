
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
  }[];
}

export default function UsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['unit-users'],
    queryFn: async () => {
      // Primeiro, buscamos os usuários únicos com seus perfis
      const { data: uniqueUsers, error: usersError } = await supabase
        .from('unit_users')
        .select(`
          user_id,
          profiles!unit_users_user_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .select('distinct:user_id,profiles!unit_users_user_id_fkey(full_name,avatar_url)');

      if (usersError) {
        console.error('Error fetching unique users:', usersError);
        throw usersError;
      }

      // Para cada usuário único, buscamos todas as suas unidades
      const usersWithUnits = await Promise.all(
        uniqueUsers.map(async (user) => {
          const { data: userUnits } = await supabase
            .from('unit_users')
            .select(`
              id,
              units (
                name
              )
            `)
            .eq('user_id', user.user_id);

          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.user_id);

          // Garantimos que units é sempre um array
          const units = userUnits?.map(unit => ({
            name: unit.units.name
          })) || [];

          return {
            id: userUnits?.[0]?.id || '', // Usando o primeiro ID encontrado
            user_id: user.user_id,
            profiles: user.profiles,
            user_roles: roles || [],
            units
          };
        })
      );
      
      return usersWithUnits as User[];
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
