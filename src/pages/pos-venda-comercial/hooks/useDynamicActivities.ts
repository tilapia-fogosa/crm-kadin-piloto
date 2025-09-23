import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnit } from "@/contexts/UnitContext";
import { toast } from "@/hooks/use-toast";

export interface DynamicActivity {
  id: string;
  unit_id: string;
  nome: string;
  descricao?: string;
  ordem: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export function useDynamicActivities() {
  const { selectedUnitId } = useUnit();
  const queryClient = useQueryClient();

  const { data: dynamicActivities, isLoading } = useQuery({
    queryKey: ['dynamic-activities', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      console.log('LOG: Buscando atividades dinâmicas para unidade:', selectedUnitId);

      const { data, error } = await supabase
        .from('pos_venda_atividades_config')
        .select('*')
        .eq('unit_id', selectedUnitId)
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('LOG: Erro ao buscar atividades dinâmicas:', error);
        throw error;
      }

      console.log('LOG: Atividades dinâmicas encontradas:', data?.length || 0);
      return data || [];
    },
    enabled: !!selectedUnitId,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (newActivity: Omit<DynamicActivity, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      console.log('LOG: Criando nova atividade dinâmica:', newActivity);

      const { data, error } = await supabase
        .from('pos_venda_atividades_config')
        .insert({
          ...newActivity,
          unit_id: selectedUnitId!,
          created_by: '00000000-0000-0000-0000-000000000000', // TODO: Usar auth.uid()
        })
        .select()
        .single();

      if (error) {
        console.error('LOG: Erro ao criar atividade dinâmica:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities'] });
      toast({
        title: "Atividade criada",
        description: "A nova atividade foi criada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na criação de atividade:', error);
      toast({
        title: "Erro ao criar atividade",
        description: "Não foi possível criar a atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DynamicActivity> }) => {
      console.log('LOG: Atualizando atividade dinâmica:', id, updates);

      const { data, error } = await supabase
        .from('pos_venda_atividades_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('LOG: Erro ao atualizar atividade dinâmica:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities'] });
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na atualização de atividade:', error);
      toast({
        title: "Erro ao atualizar atividade",
        description: "Não foi possível atualizar a atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    dynamicActivities: dynamicActivities as DynamicActivity[],
    isLoading,
    createActivity: createActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
    isUpdating: updateActivityMutation.isPending,
  };
}