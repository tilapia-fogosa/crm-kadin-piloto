/**
 * LOG: Hook para buscar ocupações categorizadas via RPC
 * DESCRIÇÃO: Utiliza a função do banco para categorização otimizada
 * SEGURANÇA: Valida permissões de acesso à unidade automaticamente
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScheduleOccupation } from "./useScheduleOccupations";

export interface CategorizedOccupation extends ScheduleOccupation {
  category: 'past' | 'next7days' | 'future';
}

export interface CategorizedOccupations {
  next7Days: CategorizedOccupation[];
  future: CategorizedOccupation[];
  past: CategorizedOccupation[];
}

interface CreateOccupationData {
  title: string;
  description?: string;
  start_datetime: string;
  duration_minutes: number;
}

/**
 * LOG: Hook principal para gerenciar ocupações categorizadas
 * Usa RPC function no banco para máxima performance
 */
export function useCategorizedOccupations(unitId: string | undefined) {
  const queryClient = useQueryClient();

  // LOG: Buscar ocupações categorizadas
  const { data, isLoading, error } = useQuery({
    queryKey: ['categorized-occupations', unitId],
    queryFn: async () => {
      if (!unitId) {
        console.warn('⚠️ [useCategorizedOccupations] unitId não fornecido');
        return { next7Days: [], future: [], past: [] };
      }

      console.log('🔄 [useCategorizedOccupations] Buscando ocupações categorizadas para unidade:', unitId);

      const { data, error } = await supabase
        .rpc('get_categorized_schedule_occupations', {
          p_unit_id: unitId
        });

      if (error) {
        console.error('❌ [useCategorizedOccupations] Erro ao buscar ocupações:', error);
        throw error;
      }

      console.log('✅ [useCategorizedOccupations] Ocupações recebidas:', data?.length || 0);

      // LOG: Separar por categoria
      const categorized: CategorizedOccupations = {
        next7Days: [],
        future: [],
        past: []
      };

      data?.forEach((occupation: any) => {
        const mapped: CategorizedOccupation = {
          id: occupation.id,
          unit_id: occupation.unit_id,
          title: occupation.title,
          description: occupation.description,
          start_datetime: occupation.start_datetime,
          duration_minutes: occupation.duration_minutes,
          created_by: occupation.created_by,
          created_by_name: occupation.created_by_name,
          created_at: occupation.created_at,
          updated_at: occupation.updated_at,
          active: true,
          category: occupation.category
        };

        if (occupation.category === 'next7days') {
          categorized.next7Days.push(mapped);
        } else if (occupation.category === 'future') {
          categorized.future.push(mapped);
        } else if (occupation.category === 'past') {
          categorized.past.push(mapped);
        }
      });

      console.log('📊 [useCategorizedOccupations] Categorização:', {
        next7Days: categorized.next7Days.length,
        future: categorized.future.length,
        past: categorized.past.length
      });

      return categorized;
    },
    enabled: !!unitId
  });

  // LOG: Mutation para criar ocupação
  const createMutation = useMutation({
    mutationFn: async (newOccupation: CreateOccupationData) => {
      if (!unitId) {
        throw new Error('Unit ID é obrigatório para criar ocupação');
      }

      console.log('➕ [useCategorizedOccupations] Criando ocupação:', newOccupation.title);

      // Obter usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('schedule_occupations')
        .insert([{
          title: newOccupation.title,
          description: newOccupation.description || null,
          start_datetime: newOccupation.start_datetime,
          duration_minutes: newOccupation.duration_minutes,
          unit_id: unitId,
          created_by: user.id,
          active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ [useCategorizedOccupations] Erro ao criar:', error);
        throw error;
      }

      console.log('✅ [useCategorizedOccupations] Ocupação criada:', data.id);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorized-occupations', unitId] });
    }
  });

  // LOG: Mutation para atualizar ocupação
  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<CreateOccupationData> }) => {
      console.log('✏️ [useCategorizedOccupations] Atualizando ocupação:', id);

      const { data, error } = await supabase
        .from('schedule_occupations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ [useCategorizedOccupations] Erro ao atualizar:', error);
        throw error;
      }

      console.log('✅ [useCategorizedOccupations] Ocupação atualizada');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorized-occupations', unitId] });
    }
  });

  // LOG: Mutation para deletar ocupação
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ [useCategorizedOccupations] Deletando ocupação:', id);

      const { error } = await supabase
        .from('schedule_occupations')
        .update({ active: false })
        .eq('id', id);

      if (error) {
        console.error('❌ [useCategorizedOccupations] Erro ao deletar:', error);
        throw error;
      }

      console.log('✅ [useCategorizedOccupations] Ocupação deletada');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorized-occupations', unitId] });
    }
  });

  return {
    categorizedOccupations: data || { next7Days: [], future: [], past: [] },
    isLoading,
    error,
    createOccupation: createMutation.mutateAsync,
    updateOccupation: (id: string, data: Partial<CreateOccupationData>) => 
      updateMutation.mutateAsync({ id, data }),
    deleteOccupation: deleteMutation.mutateAsync
  };
}
