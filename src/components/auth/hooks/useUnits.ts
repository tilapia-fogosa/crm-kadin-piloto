
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Unit } from "../types/unit-select.types";

export function useUnits() {
  const { toast } = useToast();

  const { data: units = [], isLoading: loading, error } = useQuery({
    queryKey: ['units', 'active'],
    queryFn: async () => {
      console.log('Fetching units...');
      const { data, error } = await supabase
        .from('units')
        .select('id, name, city')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('Error fetching units:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as unidades",
        });
        throw error;
      }

      console.log('Units fetched successfully:', data?.length);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    retry: 2,
  });

  return { 
    units, 
    loading,
    error
  };
}
