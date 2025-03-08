
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface UserUnit {
  unit_id: string;
  units: {
    id: string;
    name: string;
  };
}

export function useUserUnit() {
  return useQuery({
    queryKey: ['user-unit'],
    queryFn: async () => {
      console.log('Iniciando busca de unidades do usuário');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('Usuário não autenticado');
        throw new Error('Not authenticated');
      }

      console.log('Buscando unidades do usuário:', session.user.id);
      
      const { data: unitUsers, error } = await supabase
        .from('unit_users')
        .select(`
          unit_id,
          units (
            id,
            name
          )
        `)
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (error) {
        console.error('Erro ao buscar unidades do usuário:', error);
        throw error;
      }

      console.log('Unidades encontradas:', unitUsers);
      return unitUsers;
    }
  });
}
