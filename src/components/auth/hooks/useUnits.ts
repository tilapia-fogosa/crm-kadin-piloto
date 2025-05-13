
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUnits() {
  console.log('Iniciando hook useUnits');
  
  const { data: units = [], isLoading, error } = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      console.log('Buscando unidades');

      // Primeiro, verifica se o usuário é admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return [];
      }

      const { data: isAdmin, error: adminError } = await supabase
        .rpc('is_admin_user', { user_id: user.id });

      if (adminError) {
        console.error('Erro ao verificar se usuário é admin:', adminError);
      }

      console.log('Usuário é admin?', isAdmin);

      let query;
      
      if (isAdmin) {
        // Se o usuário é admin, busca todas as unidades ativas
        console.log('Buscando todas as unidades para admin');
        query = supabase
          .from('units')
          .select('id, name, city')
          .eq('active', true)
          .order('name');
      } else {
        // Se não é admin, busca apenas as unidades às quais o usuário tem acesso
        console.log('Buscando unidades específicas para usuário');
        query = supabase
          .from('unit_users')
          .select(`
            unit_id,
            units (
              id, 
              name,
              city
            )
          `)
          .eq('user_id', user.id)
          .eq('active', true);
      }

      const { data: userUnits, error } = await query;

      if (error) {
        console.error('Erro ao buscar unidades:', error);
        throw error;
      }

      // Processa os resultados de acordo com o tipo de consulta
      let processedUnits;
      if (isAdmin) {
        processedUnits = userUnits;
      } else {
        // Para usuários normais, extrai as unidades do resultado aninhado e remove duplicatas
        const uniqueUnitIds = new Set();
        processedUnits = userUnits
          .filter(item => item.units) // Garante que a unidade existe
          .filter(item => {
            if (uniqueUnitIds.has(item.unit_id)) {
              return false;
            }
            uniqueUnitIds.add(item.unit_id);
            return true;
          })
          .map(item => ({
            id: item.unit_id,
            name: item.units.name,
            city: item.units.city
          }));
      }

      console.log('Unidades encontradas:', processedUnits);
      return processedUnits;
    },
  });

  return { units, loading: isLoading, error };
}
