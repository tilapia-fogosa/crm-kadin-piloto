import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para verificar se o usuário atual é administrador
 * Log: Hook centralizado para verificação de status de admin
 */
export function useIsAdmin() {
  console.log('useIsAdmin: Iniciando verificação de admin');
  
  const { data: isAdmin, isLoading, error } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      console.log('useIsAdmin: Executando verificação de admin');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('useIsAdmin: Usuário não encontrado');
        return false;
      }

      const { data, error } = await supabase
        .rpc('is_admin', { user_id: user.id });

      if (error) {
        console.error('useIsAdmin: Erro ao verificar admin:', error);
        throw error;
      }
      
      console.log('useIsAdmin: Resultado da verificação:', data);
      return data;
    },
  });

  return {
    isAdmin: Boolean(isAdmin),
    isLoading,
    error
  };
}