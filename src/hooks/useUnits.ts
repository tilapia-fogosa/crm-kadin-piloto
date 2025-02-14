
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";

export function useUnits() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      if (!profile) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('units')
        .select(`
          id,
          name,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          postal_code,
          created_at,
          api_key
        `)
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!profile
  });
}
