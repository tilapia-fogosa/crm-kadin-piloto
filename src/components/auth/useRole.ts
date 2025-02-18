
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'consultor' | 'franqueado' | 'admin';

export function useRole() {
  const { data: role, isLoading: isCheckingRole } = useQuery({
    queryKey: ['user-role'],
    queryFn: async () => {
      console.log('Verificando papel do usuário');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      console.log('Usuário atual:', user.email);
      
      const { data: userRole, error } = await supabase
        .from('unit_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();
        
      if (error) {
        console.error('Erro ao buscar papel do usuário:', error);
        return null;
      }
      
      console.log('Papel do usuário:', userRole?.role);
      return userRole?.role as UserRole | null;
    },
  });

  return { role, isCheckingRole };
}
