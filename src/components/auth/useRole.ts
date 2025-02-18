
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'consultor' | 'franqueado' | 'admin';

// Função auxiliar para determinar o papel mais privilegiado
function getMostPrivilegedRole(roles: UserRole[]): UserRole {
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('franqueado')) return 'franqueado';
  return 'consultor';
}

export function useRole() {
  const { data: role, isLoading: isCheckingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      console.log('Verificando papel do usuário');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      console.log('Usuário atual:', user.email);
      
      const { data: userRoles, error } = await supabase
        .from('unit_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('active', true);
        
      if (error) {
        console.error('Erro ao buscar papel do usuário:', error);
        return null;
      }

      if (!userRoles || userRoles.length === 0) {
        console.log('Nenhum papel encontrado para o usuário');
        return null;
      }
      
      // Pega o papel mais privilegiado do usuário
      const mostPrivilegedRole = getMostPrivilegedRole(userRoles.map(ur => ur.role as UserRole));
      console.log('Papel mais privilegiado do usuário:', mostPrivilegedRole);
      
      return mostPrivilegedRole;
    },
  });

  return { role, isCheckingRole };
}
