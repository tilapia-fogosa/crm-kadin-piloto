
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserUnit() {
  return useQuery({
    queryKey: ['user-unit'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('Not authenticated');

      const { data: unitUsers, error } = await supabase
        .from('unit_users')
        .select(`
          unit_id,
          units (
            name
          )
        `)
        .eq('user_id', session.user.id)
        .eq('active', true);

      if (error) {
        console.error('Error fetching user unit:', error);
        throw error;
      }

      return unitUsers;
    }
  });
}
