
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useUnitOperations() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getActiveUnits = async () => {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('id, name, city')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar unidades",
      });
      return [];
    }
  };

  const getUserUnits = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('unit_users')
        .select(`
          unit_id,
          role,
          units (
            id,
            name,
            city
          )
        `)
        .eq('user_id', userId)
        .eq('active', true);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar unidades do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao buscar unidades do usuário",
      });
      return [];
    }
  };

  return {
    getActiveUnits,
    getUserUnits,
    isLoading
  };
}
