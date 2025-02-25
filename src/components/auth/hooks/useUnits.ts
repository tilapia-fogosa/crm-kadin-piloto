
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Unit } from "../types/unit-select.types";

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        console.log('Iniciando busca de unidades...');
        const { data: unitsData, error } = await supabase
          .from('units')
          .select('id, name, city')
          .eq('active', true)
          .order('name');

        if (error) {
          console.error('Erro ao buscar unidades:', error);
          throw error;
        }

        console.log('Unidades carregadas com sucesso:', unitsData?.length);
        setUnits(unitsData || []);
      } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar as unidades",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, [toast]);

  return { units, loading };
}
