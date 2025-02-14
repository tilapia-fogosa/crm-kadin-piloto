
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
    id: string;
    name: string;
  }[];
}

export default function UsersPage() {
  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['unit-users'],
    queryFn: async () => {
      // Primeiro verificamos se o usuário atual é admin
      const { data: currentUserRole } = await supabase
        .from('user_roles')
        .select('role')
        .single();

      if (!currentUserRole || currentUserRole.role !== 'admin') {
        throw new Error('Acesso não autorizado');
      }

      // Buscamos todos os usuários únicos
      const { data: uniqueUserIds, error: userIdsError } = await supabase
        .from('unit_users')
        .select('user_id')
        .order('user_id');

      if (userIdsError) throw userIdsError;

      // Filtramos para ter IDs únicos
      const uniqueIds = [...new Set(uniqueUserIds.map(u => u.user_id))];

      // Para cada ID único, buscamos todas as informações
      const usersWithDetails = await Promise.all(
        uniqueIds.map(async (userId) => {
          // Buscar perfil
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          // Buscar papéis
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId);

          // Buscar unidades
          const { data: userUnits } = await supabase
            .from('unit_users')
            .select(`
              id,
              units (
                id,
                name
              )
            `)
            .eq('user_id', userId);

          // Garantir que units é sempre um array
          const units = userUnits?.map(unit => ({
            id: unit.units.id,
            name: unit.units.name
          })) || [];

          return {
            id: userUnits?.[0]?.id || '',
            user_id: userId,
            profiles: profileData || { full_name: null, avatar_url: null },
            user_roles: roles || [],
            units
          };
        })
      );

      return usersWithDetails;
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
