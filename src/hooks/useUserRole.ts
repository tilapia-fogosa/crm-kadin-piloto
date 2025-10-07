/**
 * LOG: Hook para verificar role do usuário na unidade
 * DESCRIÇÃO: Busca o role (consultor, franqueado, admin) do usuário autenticado
 * SECURITY: Baseado na tabela unit_users com RLS apropriado
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserRole {
  role: 'consultor' | 'franqueado' | 'admin' | null;
  isLoading: boolean;
  error: Error | null;
  canConfigureCommissions: boolean; // Helper: se pode configurar fórmulas
}

/**
 * Hook para verificar o role do usuário na unidade atual
 * @param unitId - ID da unidade para verificar permissões
 * @returns UserRole com role, status de carregamento e permissões
 */
export function useUserRole(unitId: string | undefined): UserRole {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user-role', unitId],
    queryFn: async () => {
      console.log('LOG: Buscando role do usuário para unidade', unitId);
      
      if (!unitId) {
        console.log('LOG: Unit ID não fornecido');
        return null;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('LOG: Usuário não autenticado');
        return null;
      }

      console.log('LOG: Usuário autenticado:', user.id);

      const { data: unitUser, error: roleError } = await supabase
        .from('unit_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('unit_id', unitId)
        .eq('active', true)
        .maybeSingle();

      if (roleError) {
        console.error('LOG: Erro ao buscar role do usuário:', roleError);
        throw roleError;
      }

      if (!unitUser) {
        console.log('LOG: Usuário não tem acesso a esta unidade');
        return null;
      }

      console.log('LOG: Role do usuário encontrado:', unitUser.role);
      return unitUser.role as 'consultor' | 'franqueado' | 'admin';
    },
    enabled: !!unitId,
  });

  // Helper: usuário pode configurar fórmulas se for franqueado ou admin
  const canConfigureCommissions = data === 'franqueado' || data === 'admin';

  return {
    role: data ?? null,
    isLoading,
    error: error as Error | null,
    canConfigureCommissions,
  };
}
