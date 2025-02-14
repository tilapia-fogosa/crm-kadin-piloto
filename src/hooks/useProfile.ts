
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'consultor' | 'franqueado';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ProfileWithRole extends Profile {
  role?: UserRole;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileWithRole | null> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      // Buscar o perfil básico
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;

      // Buscar a role do usuário
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id);

      if (rolesError) throw rolesError;

      // Verificar se é admin usando a função is_admin
      const { data: isAdmin, error: isAdminError } = await supabase
        .rpc('is_admin', { user_uid: session.user.id });

      if (isAdminError) throw isAdminError;

      // Se é admin, retornar role como admin, senão usar a primeira role encontrada
      return {
        ...profile,
        role: isAdmin ? 'admin' : (userRoles?.[0]?.role as UserRole)
      };
    }
  });
}
