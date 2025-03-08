
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUnits() {
  console.log('Iniciando hook useUnits');
  
  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Buscando unidades');

      // Primeiro, verifica se o usuário é admin
      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin_user', { user_id: (await supabase.auth.getUser()).data.user?.id });

      if (adminError) {
        console.error('Erro ao verificar se usuário é admin:', adminError);
      }

      console.log('Usuário é admin?', isAdmin);

      const { data: userUnits, error } = await supabase
        .from('units')
        .select('id, name, city')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
      }

      console.log('Unidades encontradas:', userUnits);
      return userUnits;
    },
  });

  return { units, loading: isLoading };
}
