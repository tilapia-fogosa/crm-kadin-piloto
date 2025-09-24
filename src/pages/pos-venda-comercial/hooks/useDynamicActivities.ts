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
  created_by_name?: string;
}

export function useDynamicActivities() {
  const { selectedUnitId } = useUnit();
  const queryClient = useQueryClient();

  const { data: dynamicActivities, isLoading, error } = useQuery({
    queryKey: ['dynamic-activities-config', selectedUnitId],
    queryFn: async () => {
      if (!selectedUnitId) return [];

      console.log('LOG: Chamando função backend get_pos_venda_activities_config para unidade:', selectedUnitId);

      const { data, error } = await supabase.rpc('get_pos_venda_activities_config', {
        p_unit_id: selectedUnitId
      });

      if (error) {
        console.error('LOG: Erro ao chamar função backend get_pos_venda_activities_config:', error);
        throw error;
      }

      console.log('LOG: Atividades dinâmicas retornadas pela função backend:', data?.length || 0);
      return data || [];
    },
    enabled: !!selectedUnitId,
  });

  const createActivityMutation = useMutation({
    mutationFn: async (newActivity: { nome: string; descricao?: string; ordem?: number; ativa?: boolean }) => {
      console.log('LOG: Criando nova atividade via função backend:', newActivity);

      const { data, error } = await supabase.rpc('manage_pos_venda_activity_config', {
        p_operation: 'create',
        p_unit_id: selectedUnitId!,
        p_nome: newActivity.nome,
        p_descricao: newActivity.descricao || null,
        p_ordem: newActivity.ordem || null,
        p_ativa: newActivity.ativa ?? true
      });

      if (error) {
        console.error('LOG: Erro ao criar atividade via função backend:', error);
        throw error;
      }

      console.log('LOG: Atividade criada com sucesso via backend:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities-config', selectedUnitId] });
      toast({
        title: "Atividade criada",
        description: "A nova atividade foi criada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na criação de atividade via backend:', error);
      toast({
        title: "Erro ao criar atividade",
        description: "Não foi possível criar a atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateActivityMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DynamicActivity> }) => {
      console.log('LOG: Atualizando atividade via função backend:', id, updates);

      const { data, error } = await supabase.rpc('manage_pos_venda_activity_config', {
        p_operation: 'update',
        p_activity_id: id,
        p_unit_id: selectedUnitId!,
        p_nome: updates.nome || null,
        p_descricao: updates.descricao || null,
        p_ordem: updates.ordem || null,
        p_ativa: updates.ativa ?? null
      });

      if (error) {
        console.error('LOG: Erro ao atualizar atividade via função backend:', error);
        throw error;
      }

      console.log('LOG: Atividade atualizada com sucesso via backend:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities-config', selectedUnitId] });
      toast({
        title: "Atividade atualizada",
        description: "A atividade foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na atualização de atividade via backend:', error);
      toast({
        title: "Erro ao atualizar atividade",
        description: "Não foi possível atualizar a atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('LOG: Desativando atividade via função backend:', id);

      const { data, error } = await supabase.rpc('manage_pos_venda_activity_config', {
        p_operation: 'delete',
        p_activity_id: id,
        p_unit_id: selectedUnitId!
      });

      if (error) {
        console.error('LOG: Erro ao desativar atividade via função backend:', error);
        throw error;
      }

      console.log('LOG: Atividade desativada com sucesso via backend:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities-config', selectedUnitId] });
      toast({
        title: "Atividade removida",
        description: "A atividade foi removida com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na remoção de atividade via backend:', error);
      toast({
        title: "Erro ao remover atividade",
        description: "Não foi possível remover a atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const reorderActivityMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      console.log('LOG: Reordenando atividade via função backend:', id, 'nova ordem:', newOrder);

      const { data, error } = await supabase.rpc('manage_pos_venda_activity_config', {
        p_operation: 'reorder',
        p_activity_id: id,
        p_unit_id: selectedUnitId!,
        p_new_order: newOrder
      });

      if (error) {
        console.error('LOG: Erro ao reordenar atividade via função backend:', error);
        throw error;
      }

      console.log('LOG: Atividade reordenada com sucesso via backend:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-activities-config', selectedUnitId] });
      toast({
        title: "Atividade reordenada",
        description: "A ordem da atividade foi alterada com sucesso.",
      });
    },
    onError: (error) => {
      console.error('LOG: Erro na reordenação de atividade via backend:', error);
      toast({
        title: "Erro ao reordenar atividade",
        description: "Não foi possível alterar a ordem da atividade. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    dynamicActivities: (dynamicActivities || []) as DynamicActivity[],
    isLoading,
    error,
    createActivity: createActivityMutation.mutate,
    updateActivity: updateActivityMutation.mutate,
    deleteActivity: deleteActivityMutation.mutate,
    reorderActivity: reorderActivityMutation.mutate,
    isCreating: createActivityMutation.isPending,
    isUpdating: updateActivityMutation.isPending,
    isDeleting: deleteActivityMutation.isPending,
    isReordering: reorderActivityMutation.isPending,
  };
}