
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsersList } from "@/components/users/users-list";

export default function UsersPage() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['unit-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('unit_users')
        .select(`
          *,
          profiles!unit_users_user_id_fkey(full_name, avatar_url),
          units(name),
          profiles!unit_users_user_id_fkey(
            user_roles(role)
          )
        `);

      if (error) throw error;

      // Transform the data to match the expected User type
      const transformedData = data?.map(user => ({
        ...user,
        profiles: user.profiles,
        units: user.units,
        user_roles: user.profiles?.user_roles || []
      }));

      return transformedData;
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
